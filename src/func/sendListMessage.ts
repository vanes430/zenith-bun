// src/func/sendListMessage.ts
import type { WASocket } from "baileys";

export async function sendListMessage(
    sock: WASocket,
    jid: string
) {
    const sections = [
        {
            title: "Section 1",
            rows: [
                { title: "Option 1", rowId: "option1" },
                {
                    title: "Option 2",
                    rowId: "option2",
                    description: "This is a description"
                }
            ]
        },
        {
            title: "Section 2",
            rows: [
                { title: "Option 3", rowId: "option3" },
                {
                    title: "Option 4",
                    rowId: "option4",
                    description: "This is a description V2"
                }
            ]
        }
    ];

    const listMessage = {
        text: "This is a list",
        footer: "nice footer, link: https://google.com",
        title: "Amazing boldfaced list title",
        buttonText: "Required, text on the button to view the list",
        sections
    };

    // ⛔ WAJIB memakai cast ANY karena typings Baileys tidak mengenali listMessage
    return await sock.sendMessage(jid, listMessage as any);
}
