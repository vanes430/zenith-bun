// src/lib/case.ts
import type { WASocket, proto } from "whaileys";
import { color } from "./color";
import { sendButton } from "../func/sendButton";
import { sendListMessage } from "../func/sendListMessage";
import { sendContact } from "../func/sendContact";

// Multi prefix support: ".", "!"
const prefixes = [".", "!"];
const OWNER = "6281276274398@s.whatsapp.net";

export async function handleCommand(sock: WASocket, msg: proto.IWebMessageInfo) {
    const sender = msg.key.participant || msg.key.remoteJid;
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
            const onlyOwner = () => sender !== OWNER && sock.sendMessage(jid, { text: "❌ Kamu bukan owner." });
switch (command) {

case "ping": {
    if (onlyOwner()) break;
    const start = Date.now();

    const sentMsg = await sock.sendMessage(jid, { text: "Testing ping..." });

    const end = Date.now();
    const ping = end - start;

    await sock.sendMessage(jid, {
        text: `Pong! 🟢\n*Latency:* ${ping} ms`
    });
}
break;

case "testlistmessage": {
    await sendListMessage(sock, jid);
}
break;

case "testsendcontact": {
    await sendContact(sock, jid);
}
break;

case "testbutton": {
    await sendButton(sock, jid, "Ini adalah pesan dengan test1:", [
        { id: "btn1", text: "Tombol 1" },
        { id: "btn2", text: "Tombol 2" }
    ]);
}
break;

case "info": {
    await sock.sendMessage(jid, { 
        text: "Ini adalah bot WhatsApp berbasis Whaileys ⚡"
    });
}
break;

case "menu": {
    await sock.sendMessage(jid, {
        text: `📜 *MENU*\n\n!ping\n!info\n!menu\n.ping\n.info\n.menu`
    });
}
break;

case "restart": {
    if (onlyOwner()) break;
    await sock.sendMessage(jid, { text: "♻️ Restarting bot..." });
    process.exit(5); // restart
}
break;

case "stop": {
    if (onlyOwner()) break;
    await sock.sendMessage(jid, { text: "🛑 Bot dimatikan." });
    process.exit(10); // stop
}
break;


default: {
    console.log(color.brightYellow(`[CMD] Perintah tidak dikenal: ${command}`));
}
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
