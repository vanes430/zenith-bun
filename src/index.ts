// src/index.ts
import { createWhatsAppConnection } from "./lib/auth";
import type { WASocket } from "baileys";
import { color } from "./lib/color";
import { registerEvents } from "./handler/event";
import { handleCommand } from "./lib/case";
import { config } from "./config";
import { log } from "./handler/logging";
import { loadAllPlugins, watchPlugins } from "./handler/plugin";
import path from "path";

let sock: WASocket | null = null;
let eventsRegistered = false;  // Track if events are already registered

// ==================================================
// 🎨 ASCII BANNER BERWARNA
// ==================================================
const ASCII_BANNER = color.brightCyan(`
██╗    ██╗██╗  ██╗ █████╗ ██╗     ██╗██╗   ██╗
██║    ██║██║  ██║██╔══██╗██║     ██║╚██╗ ██╔╝
██║ █╗ ██║███████║███████║██║     ██║ ╚████╔╝ 
██║███╗██║██╔══██║██╔══██║██║     ██║  ╚██╔╝  
╚███╔███╔╝██║  ██║██║  ██║███████╗██║   ██║   
 ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝   ╚═╝  
`);

// ==================================================
// 🎉 Fancy Connection Display
// ==================================================
function displayFancyConnectionInfo(sock: WASocket) {
    if (!config.showConnectionInfo) return;

    const userJid = sock.user?.id ?? "unknown";
    const phone = userJid.split("@")[0];
    const username = sock.user?.name || phone;

    if (config.showBanner) {
        log.banner("\n" + ASCII_BANNER);
    }

    log.raw(color.magenta("=".repeat(50)));
    log.raw(color.brightGreen("        🎉 KONEKSI WHATSAPP BERHASIL 🎉"));
    log.raw(color.magenta("=".repeat(50)));

    log.raw(`${color.blue("👤 Pengguna")} : ${color.brightWhite(username)}`);
    log.raw(`${color.blue("📱 Nomor   ")} : ${color.brightWhite(phone)}`);

    log.raw(color.magenta("----------------------------------------------"));
    log.raw(color.green("Status: 🟢 Aktif dan siap menerima pesan."));
    log.raw(color.magenta("=".repeat(50)) + "\n");
}

// ==================================================
// 🚀 MAIN BOT
// ==================================================

/**
 * Initialize socket connection only (for reconnection)
 */
async function initializeSocket() {
    sock = await createWhatsAppConnection(initializeSocket, (sock) => {
        // Callback saat connection open
        displayFancyConnectionInfo(sock);
    });

    // Register events only if not already registered
    if (!eventsRegistered) {
        registerEvents(sock);

        // ====================================
        // 🚀 PARALLEL COMMAND HANDLER
        // ====================================
        // Event handler untuk command processing dengan parallel execution.
        // Menggunakan Promise.resolve().then() untuk:
        // 1. Prevent freeze - multiple commands bisa diproses bersamaan
        // 2. Non-blocking - event loop tetap responsive
        // 3. Error isolation - error di satu command tidak crash bot
        // 4. Scalability - support high volume concurrent commands
        // ====================================
        sock.ev.on("messages.upsert", ({ messages }) => {
            const msg = messages[0];
            if (!msg || msg.key.fromMe) return;

            // Execute in parallel (non-blocking) to prevent freeze
            // Setiap command dijalankan di Promise terpisah
            Promise.resolve().then(async () => {
                try {
                    await handleCommand(sock!, msg);
                } catch (error) {
                    log.error(`Error in command handler: ${error instanceof Error ? error.message : error}`);
                }
            });
        });

        eventsRegistered = true;  // Mark events as registered
    }
}

/**
 * Start bot - Initial setup (only run once)
 */
async function startBot() {
    log.info("--- START BOT ---");
    log.info("Menyiapkan koneksi WhatsApp...\n");

    // Load plugins dari folder plugins/ ke Map registry (ONLY ONCE)
    const pluginDir = path.join(import.meta.dir, "plugins");
    await loadAllPlugins(pluginDir);

    // Watch plugins folder for hot-reload (ONLY ONCE)
    watchPlugins(pluginDir);

    // Initialize socket connection
    await initializeSocket();
}

// ==================================================
// ▶️ RUN BOT
// ==================================================
startBot();
// Graceful shutdown handler
process.on("SIGINT", () => {
    log.warn("\n--- BOT DIHENTIKAN ---");
    process.exit(0);
});
