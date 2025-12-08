// src/handler/plugin.ts
// Hot-reloadable plugin system - Auto-register dari folder plugins/

import type { WASocket, proto } from "baileys";
import { watch } from "fs";
import { log } from "./logging";
import { config } from "../config";
import { isOwner as checkIsOwner } from "../lib/owner";
import path from "path";

// Re-export types untuk digunakan di plugins (no need to import in each plugin)
export type { WASocket, proto } from "baileys";

// Plugin context dengan helper flags
export interface PluginContext {
    sock: WASocket;
    msg: proto.IWebMessageInfo;
    args: string[];
    jid: string;
    sender: string;
    isOwner: boolean;
    isGroup: boolean;
    isAdminGroup: boolean;
}

// Plugin interface
export interface Plugin {
    name: string;
    description?: string;
    commands?: string[];
    enabled?: boolean;
    ownerOnly: boolean;   // ✅ REQUIRED - Must specify!
    groupOnly: boolean;   // ✅ REQUIRED - Must specify!
    execute: (ctx: PluginContext) => Promise<void>;
}

// ====================================
// �️ PLUGIN REGISTRY (MAP-BASED)
// ====================================
// Auto-populated dari folder plugins/

export const pluginRegistry = new Map<string, Plugin>();
const pluginFiles = new Map<string, string>(); // filename -> full path
let isReloading = false;

/**
 * Load plugin dari file
 */
async function loadPlugin(filePath: string): Promise<Plugin | null> {
    try {
        // Dynamic import dengan cache busting
        const timestamp = Date.now();
        const module = await import(`${filePath}?t=${timestamp}`);

        const plugin: Plugin = module.default || module.plugin;

        if (!plugin || typeof plugin.execute !== "function") {
            log.error(`Plugin ${filePath} tidak memiliki export default atau execute function`);
            return null;
        }

        // Validate required fields
        if (plugin.ownerOnly === undefined || plugin.groupOnly === undefined) {
            log.error(`Plugin ${filePath} harus memiliki ownerOnly dan groupOnly flags!`);
            return null;
        }

        // Set default values
        plugin.enabled = plugin.enabled !== false;
        plugin.commands = plugin.commands || [];

        return plugin;
    } catch (error) {
        log.error(`Error loading plugin ${filePath}: ${error instanceof Error ? error.message : error}`);
        return null;
    }
}

/**
 * Register plugin ke Map registry
 */
function registerPlugin(filename: string, plugin: Plugin) {
    pluginRegistry.set(filename, plugin);
    log.success(`Plugin loaded: ${plugin.name} (${filename})`);
}

/**
 * Unregister plugin dari Map registry
 */
function unregisterPlugin(filename: string) {
    const plugin = pluginRegistry.get(filename);
    if (plugin) {
        pluginRegistry.delete(filename);
        log.info(`Plugin unloaded: ${plugin.name} (${filename})`);
    }
}

/**
 * Load semua plugins dari folder ke Map registry
 */
export async function loadAllPlugins(pluginDir: string) {
    log.info("Loading plugins from folder...");

    try {
        const fs = await import("fs/promises");
        const files = await fs.readdir(pluginDir);

        const pluginPromises = files
            .filter(file => file.endsWith(".ts") || file.endsWith(".js"))
            .map(async (file) => {
                const filePath = path.join(pluginDir, file);
                pluginFiles.set(file, filePath);

                const plugin = await loadPlugin(filePath);
                if (plugin) {
                    registerPlugin(file, plugin);
                }
            });

        await Promise.all(pluginPromises);

        log.success(`Loaded ${pluginRegistry.size} plugins into Map registry`);
    } catch (error) {
        log.error(`Error loading plugins: ${error instanceof Error ? error.message : error}`);
    }
}

/**
 * Reload specific plugin
 */
async function reloadPlugin(filename: string) {
    if (isReloading) {
        log.warn(`Plugin reload already in progress, skipping ${filename}`);
        return;
    }

    isReloading = true;

    try {
        const filePath = pluginFiles.get(filename);
        if (!filePath) {
            log.warn(`Plugin file not found: ${filename}`);
            return;
        }

        log.info(`Reloading plugin: ${filename}`);

        // Load new version
        const newPlugin = await loadPlugin(filePath);

        if (newPlugin) {
            // Atomic swap - unregister old, register new
            unregisterPlugin(filename);
            registerPlugin(filename, newPlugin);
            log.success(`Plugin reloaded successfully: ${newPlugin.name}`);
        } else {
            log.error(`Failed to reload plugin: ${filename}, keeping old version`);
        }
    } catch (error) {
        log.error(`Error reloading plugin ${filename}: ${error instanceof Error ? error.message : error}`);
    } finally {
        isReloading = false;
    }
}

/**
 * Watch plugins folder for changes
 */
export function watchPlugins(pluginDir: string) {
    log.info(`Watching plugins directory: ${pluginDir}`);

    const watcher = watch(pluginDir, { recursive: false }, async (eventType, filename) => {
        if (!filename || (!filename.endsWith(".ts") && !filename.endsWith(".js"))) {
            return;
        }

        if (eventType === "change") {
            log.info(`Plugin file changed: ${filename}`);
            // Debounce - tunggu sebentar untuk multiple changes
            setTimeout(() => reloadPlugin(filename), 500);
        } else if (eventType === "rename") {
            const filePath = path.join(pluginDir, filename);
            const fs = await import("fs/promises");

            try {
                await fs.access(filePath);
                // File created
                log.info(`New plugin detected: ${filename}`);
                pluginFiles.set(filename, filePath);
                const plugin = await loadPlugin(filePath);
                if (plugin) {
                    registerPlugin(filename, plugin);
                }
            } catch {
                // File deleted
                log.info(`Plugin removed: ${filename}`);
                unregisterPlugin(filename);
                pluginFiles.delete(filename);
            }
        }
    });

    return watcher;
}

/**
 * Execute plugin by command with parallel execution
 * 
 * This function executes plugins in a non-blocking way to prevent freeze.
 * Multiple plugins can run simultaneously without blocking each other.
 * 
 * @param command - Command to execute
 * @param sock - WhatsApp socket
 * @param msg - Message info
 * @param args - Command arguments
 * @returns true if command was handled, false otherwise
 */
export async function executePlugin(
    command: string,
    sock: WASocket,
    msg: proto.IWebMessageInfo,
    args: string[]
): Promise<boolean> {
    // Basic validation
    if (!msg.key?.remoteJid) return false;

    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    // Build context with flags
    const isGroup = jid.endsWith("@g.us");
    const isOwner = checkIsOwner(msg);  // ✅ Use owner utility

    // Check if sender is admin in group
    let isAdminGroup = false;
    if (isGroup) {
        try {
            const groupMeta = await sock.groupMetadata(jid);
            const participant = groupMeta.participants.find(p => p.id === sender);
            isAdminGroup = participant?.admin === "admin" || participant?.admin === "superadmin";
        } catch {
            isAdminGroup = false;
        }
    }

    // Create plugin context
    const ctx: PluginContext = {
        sock,
        msg,
        args,
        jid,
        sender,
        isOwner,
        isGroup,
        isAdminGroup,
    };

    // Find plugin that handles this command (from Map registry)
    for (const [, plugin] of pluginRegistry) {
        if (!plugin.enabled) continue;

        if (plugin.commands?.includes(command)) {
            // Auto-check ownerOnly
            if (plugin.ownerOnly && !isOwner) {
                await sock.sendMessage(jid, { text: "❌ Command ini hanya untuk owner!" });
                return true; // Command handled (rejected)
            }

            // Auto-check groupOnly
            if (plugin.groupOnly && !isGroup) {
                await sock.sendMessage(jid, { text: "❌ Command ini hanya bisa digunakan di group!" });
                return true; // Command handled (rejected)
            }

            try {
                // ====================================
                // 🚀 PARALLEL PLUGIN EXECUTION
                // ====================================
                // Execute plugin in parallel (non-blocking) untuk prevent freeze.
                // Setiap plugin dijalankan di Promise terpisah sehingga:
                // - Multiple users bisa execute plugin bersamaan
                // - Long-running plugins tidak block plugins lainnya
                // - Error di satu plugin tidak affect plugin lainnya
                // ====================================
                Promise.resolve().then(async () => {
                    try {
                        await plugin.execute(ctx);
                    } catch (error) {
                        log.error(`Error executing plugin ${plugin.name}: ${error instanceof Error ? error.message : error}`);
                    }
                });

                return true; // Command handled
            } catch (error) {
                log.error(`Error in plugin ${plugin.name}: ${error instanceof Error ? error.message : error}`);
                return false;
            }
        }
    }

    return false; // Command not handled
}

/**
 * Get all loaded plugins from Map registry
 */
export function getLoadedPlugins(): Plugin[] {
    return Array.from(pluginRegistry.values());
}

/**
 * Get plugin by name
 */
export function getPlugin(name: string): Plugin | undefined {
    for (const [, plugin] of pluginRegistry) {
        if (plugin.name === name) {
            return plugin;
        }
    }
    return undefined;
}
