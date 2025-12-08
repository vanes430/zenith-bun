// src/func/sendContact.ts
import type { WASocket } from "baileys";

export async function sendContact(
    sock: WASocket,
    jid: string
) {
    const vcard =
        "BEGIN:VCARD\n" +
        "VERSION:3.0\n" +
        "FN:Jeff Singh\n" +
        "ORG:Ashoka Uni;\n" +
        "TEL;type=CELL;type=VOICE;waid=911234567890:+91 12345 67890\n" +
        "END:VCARD";

    const message = {
        contacts: {
            displayName: "Jeff",
            contacts: [{ vcard }]
        }
    };

    // TypeScript Baileys biasanya belum mendefinisikan type contacts → perlu cast any
    return await sock.sendMessage(jid, message as any);
}