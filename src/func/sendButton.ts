// src/func/sendButton.ts
import type { WASocket } from "whaileys";
import fs from "fs";
import path from "path";

export interface ButtonItem {
    id: string;
    text: string;
}

export async function sendButton(
    sock: WASocket,
    jid: string,
    caption: string,
    buttons: ButtonItem[]
) {
    const mappedButtons = buttons.map(btn => ({
        buttonId: btn.id,
        buttonText: { displayText: btn.text },
        type: 1
    }));

    // Hardcoded image path
    const imagePath = path.join(__dirname, "../nayuta.jpg");

    const msg = {
        image: fs.readFileSync(imagePath),
        caption,
        footer: "© Vanes Bot",
        buttons: mappedButtons,
        headerType: 4
    };

    return await sock.sendMessage(jid, msg);
}
