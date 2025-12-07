// index.ts
import { createWhatsAppConnection } from "./lib/auth";
import type { WASocket } from "whaileys";
import { color } from "./lib/color";
import { handleCommand } from "./lib/case";
import { registerEvents } from "./handler/event";

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

    const sock: WASocket = await createWhatsAppConnection(startBot);

    // Register auto events from event.ts
    registerEvents(sock);

    // Connection event
    sock.ev.on("connection.update", (update) => {
        if (update.connection === "open") {
            displayFancyConnectionInfo(sock);
        }

        if (update.connection === "close") {
            console.log(color.red("\n⚠️ Koneksi terputus. Mencoba menyambung ulang...\n"));
        }
    });

    // Command handler
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg || msg.key.fromMe) return;

        // Jalankan handler command (multi-prefix, paralel)
        await handleCommand(sock, msg);
    });
}

// ==================================================
// ▶️ RUN BOT
// ==================================================
startBot();
