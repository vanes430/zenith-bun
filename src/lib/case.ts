// src/lib/case.ts
// ====================================
// 🚀 PARALLEL COMMAND HANDLER
// ====================================
// This handler processes commands in parallel to prevent freezing.
// All commands are executed non-blocking using Promise.resolve().then()
// to ensure multiple users can execute commands simultaneously.
// ====================================

import type { WASocket, proto } from "baileys";
import { sendButton } from "../func/sendButton";
import { sendListMessage } from "../func/sendListMessage";
import { sendContact } from "../func/sendContact";
import { config } from "../config";
import { log } from "../handler/logging";
import { executePlugin, getLoadedPlugins } from "../handler/plugin";
import { isOwner } from "./owner";
import { executeShellCommand, executeJavaScript } from "./eval";

/**
 * Handle incoming commands with parallel execution
 * All commands run non-blocking to prevent freeze
 */
export async function handleCommand(sock: WASocket, msg: proto.IWebMessageInfo) {
    if (!msg.key) return;

    const sender = msg.key.participant || msg.key.remoteJid;
    const jid = msg.key.remoteJid;
    if (!jid) return;

    const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

    // ====================================
    // 🔒 EVAL FEATURES (OWNER ONLY)
    // ====================================

    const isOwnerUser = isOwner(msg);

    // $ = Shell Command Execution (non-blocking)
    if (text.startsWith("$") && isOwnerUser) {
        const command = text.slice(1).trim();
        if (!command) {
            Promise.resolve().then(() =>
                sock.sendMessage(jid, { text: "❌ Usage: $ <command>" })
            );
            return;
        }
        // Execute in parallel (non-blocking)
        Promise.resolve().then(() => executeShellCommand(sock, msg, command));
        return;
    }

    // => = JavaScript Eval (non-blocking)
    if (text.startsWith("=>") && isOwnerUser) {
        const code = text.slice(2).trim();
        if (!code) {
            Promise.resolve().then(() =>
                sock.sendMessage(jid, { text: "❌ Usage: => <javascript code>" })
            );
            return;
        }
        // Execute in parallel (non-blocking)
        Promise.resolve().then(() => executeJavaScript(sock, msg, code));
        return;
    }

    // ====================================
    // NORMAL COMMAND PROCESSING
    // ====================================

    // Cek prefix valid
    const prefixUsed = config.prefix.find((p: string) => text.startsWith(p));
    if (!prefixUsed) return;

    const args = text.slice(prefixUsed.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase() || "";

    log.cmd(prefixUsed, command, jid);

    // ====================================
    // TRY PLUGIN FIRST (HOT-RELOADABLE)
    // ====================================
    const pluginHandled = await executePlugin(command, sock, msg, args);
    if (pluginHandled) {
        return; // Plugin handled the command
    }

    // ====================================
    // FALLBACK TO BUILT-IN COMMANDS
    // ====================================
    Promise.resolve().then(async () => {
        try {
            // Owner check helper
            const onlyOwner = () => !isOwnerUser && sock.sendMessage(jid, { text: "❌ Kamu bukan owner." });

            switch (command) {

                // Built-in test commands (prefixed with 'test' to avoid conflicts)
                case "testlist": {
                    await sendListMessage(sock, jid);
                }
                    break;

                case "testcontact": {
                    await sendContact(sock, jid);
                }
                    break;

                case "testbutton": {
                    await sendButton(sock, jid, "Ini adalah pesan dengan button:", [
                        { id: "btn1", text: "Tombol 1" },
                        { id: "btn2", text: "Tombol 2" }
                    ]);
                }
                    break;

                // Debug command - dump message structure (owner only)
                case "dump": {
                    if (onlyOwner()) break;

                    // Full dump dengan processed data
                    const actualJid = (msg.key as any)?.remoteJidAlt || sender;
                    const dump = {
                        // Raw message
                        raw: msg,

                        // Processed data
                        processed: {
                            jid: jid,
                            actualJid: actualJid,
                            sender: sender,
                            senderNumber: actualJid?.split("@")[0],
                            pushName: msg.pushName,
                            isGroup: jid.endsWith("@g.us"),
                            isOwner: isOwnerUser,
                            timestamp: msg.messageTimestamp,
                        }
                    };

                    await sock.sendMessage(jid, {
                        text: JSON.stringify(dump, null, 2)
                    });
                }
                    break;

                // Menu command - shows all available commands
                case "menu":
                case "help": {
                    const plugins = getLoadedPlugins();

                    // Group plugins by category
                    const publicPlugins = plugins.filter(p => p.enabled && !p.ownerOnly && !p.groupOnly);
                    const ownerPlugins = plugins.filter(p => p.enabled && p.ownerOnly);
                    const groupPlugins = plugins.filter(p => p.enabled && p.groupOnly && !p.ownerOnly);

                    let menuText = `📜 *${config.botName.toUpperCase()} - MENU*\n\n`;

                    // Public plugins
                    if (publicPlugins.length > 0) {
                        menuText += `🌐 *Public Commands:*\n`;
                        publicPlugins.forEach(p => {
                            menuText += `• ${p.commands?.join(", ")} - ${p.description || p.name}\n`;
                        });
                        menuText += `\n`;
                    }

                    // Owner only plugins
                    if (ownerPlugins.length > 0) {
                        menuText += `👑 *Owner Only:*\n`;
                        ownerPlugins.forEach(p => {
                            menuText += `• ${p.commands?.join(", ")} - ${p.description || p.name}\n`;
                        });
                        menuText += `\n`;
                    }

                    // Group only plugins
                    if (groupPlugins.length > 0) {
                        menuText += `👥 *Group Only:*\n`;
                        groupPlugins.forEach(p => {
                            menuText += `• ${p.commands?.join(", ")} - ${p.description || p.name}\n`;
                        });
                        menuText += `\n`;
                    }

                    // Built-in commands
                    menuText += `🛠️ *Built-in Commands:*\n`;
                    menuText += `• menu, help - Show this menu\n`;
                    menuText += `• testlist - Test list message\n`;
                    menuText += `• testcontact - Test send contact\n`;
                    menuText += `• testbutton - Test button message\n`;
                    menuText += `• stop - Stop bot (owner only)\n\n`;

                    menuText += `📊 *Stats:*\n`;
                    menuText += `• Total plugins: ${plugins.length}\n`;
                    menuText += `• Prefix: ${config.prefix.join(", ")}\n`;

                    await sock.sendMessage(jid, { text: menuText.trim() });
                }
                    break;

                // Stop command (owner only)
                case "stop": {
                    if (onlyOwner()) break;
                    await sock.sendMessage(jid, { text: "🛑 Bot dimatikan." });
                    process.exit(0);
                }
                    break;

                // Unknown command
                default: {
                    // Don't log unknown commands (might be typo or plugin that failed to load)
                    // User will just not get a response
                }
                    break;
            }
        } catch (err) {
            log.error(err instanceof Error ? err : `Error Command: ${err}`);
            await sock.sendMessage(jid, {
                text: "⚠️ Terjadi kesalahan menjalankan perintah."
            });
        }
    });
}
