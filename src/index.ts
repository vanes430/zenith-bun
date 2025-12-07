// src/index.ts
import { createWhatsAppConnection } from "./lib/auth";
import type { WASocket } from "whaileys";
import { color } from "./lib/color";
import { registerEvents } from "./handler/event";

// handler yang bisa di-reload
let handleCommand = (await import("./lib/case")).handleCommand;
let sock: WASocket | null = null;

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
    const userJid = sock.user?.id ?? "unknown";
    const phone = userJid.split("@")[0];
    const username = sock.user?.name || phone;

    console.log("\n" + ASCII_BANNER);

    console.log(color.magenta("=".repeat(50)));
    console.log(color.brightGreen("        🎉 KONEKSI WHATSAPP BERHASIL 🎉"));
    console.log(color.magenta("=".repeat(50)));

    console.log(`${color.blue("👤 Pengguna")} : ${color.brightWhite(username)}`);
    console.log(`${color.blue("📱 Nomor   ")} : ${color.brightWhite(phone)}`);

    console.log(color.magenta("----------------------------------------------"));
    console.log(color.green("Status: 🟢 Aktif dan siap menerima pesan."));
    console.log(color.magenta("=".repeat(50)) + "\n");
}

// ==================================================
// 🚀 MAIN BOT
// ==================================================
async function startBot() {
    console.log(color.yellow("\n--- START BOT ---"));
    console.log(color.yellow("Menyiapkan koneksi WhatsApp...\n"));

    // Buat koneksi bot
    sock = await createWhatsAppConnection(startBot);

    // Pastikan tidak ada listener rangkap
    sock.ev.removeAllListeners("messages.upsert");
    sock.ev.removeAllListeners("connection.update");

    // Event bawaan dari event.ts
    registerEvents(sock);

    // Event update koneksi
    sock.ev.on("connection.update", (update) => {
        if (update.connection === "open") {
            displayFancyConnectionInfo(sock!);
        }

        if (update.connection === "close") {
            console.log(
                color.red("\n⚠️ Koneksi terputus. Mencoba menyambung ulang...\n")
            );
        }
    });

    // Event command handler
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg || msg.key.fromMe) return;

        await handleCommand(sock!, msg);
    });
}

// ==================================================
// ▶️ RUN BOT
// ==================================================
startBot();
// Graceful shutdown handler
process.on("SIGINT", () => {
    console.log(color.yellow("\n--- BOT DIHENTIKAN ---"));
    process.exit(0);
});
