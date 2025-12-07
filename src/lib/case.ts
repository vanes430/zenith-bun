// lib/case.ts
import type { WASocket, proto } from "whaileys";
import { color } from "./color";

// Multi prefix support: ".", "!"
const prefixes = [".", "!"];

export async function handleCommand(sock: WASocket, msg: proto.IWebMessageInfo) {
    const jid = msg.key.remoteJid;
    if (!jid) return;

    const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

    // Cek prefix valid
    const prefixUsed = prefixes.find((p) => text.startsWith(p));
    if (!prefixUsed) return;

    const args = text.slice(prefixUsed.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase() || "";

    console.log(color.green(`[CMD] ${prefixUsed}${command} dari ${jid}`));

    // ====================================
    // EXECUTE COMMAND PARALEL (NON BLOCKING)
    // ====================================
    Promise.resolve().then(async () => {
        try {
            switch (command) {

            case "":
                await sock.sendMessage(jid, {
                    text: "Gunakan perintah yang benar."
                });
                break;

            case "ping":
                await sock.sendMessage(jid, { text: "Pong! 🟢" });
                break;

            case "info":
                await sock.sendMessage(jid, { 
                    text: "Ini adalah bot WhatsApp berbasis Whaileys ⚡"
                });
                break;

            case "menu":
                await sock.sendMessage(jid, {
                    text: `📜 *MENU*\n\n!ping\n!info\n!menu\n.ping\n.info\n.menu`
                });
                break;

            default:
                break;

            }
        } catch (err) {
            console.error(color.red(`Error Command: ${err}`));
            await sock.sendMessage(jid, {
                text: "⚠️ Terjadi kesalahan menjalankan perintah."
            });
        }
    });
}
