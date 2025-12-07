// src/handler/event.ts
import type { WASocket, WAMessage } from "whaileys";
import { log } from "./logging";
import { color } from "../lib/color";

export function registerEvents(sock: WASocket) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages?.[0];
    if (!msg || !msg.message) return;

    const jid = msg.key.remoteJid!;
    const sender = msg.pushName ?? "-";

    // ambil text
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.extendedTextMessage?.matchedText ||
      "";

    // ----- LOG LABEL -----
    let label = `${color.cyan(sender)} ${color.white(`(${jid})`)}`;

    if (jid.endsWith("@g.us")) {
      try {
        const meta = await sock.groupMetadata(jid);
        const groupName = meta?.subject ?? "Unknown Group";
        const participant = msg.key.participant ?? "";

        label =
          `${color.cyan(sender)} ${color.white(`(${participant})`)}` +
          `\n ${color.magenta("@")} ${color.yellow(groupName)} ${color.white(`(${jid})`)}`;
      } catch {}
    }

    log.msg(label, text);

    // -----------------------------------------------------------
    // 🔵 LOGIC READ SESUAI JID
    // -----------------------------------------------------------

    try {
      if (jid.endsWith("@g.us")) {
        // 🔹 GROUP — gunakan chatModify
        const lastMsgInChat: WAMessage = msg;

        await sock.chatModify(
          {
            markRead: true,
            lastMessages: [lastMsgInChat],
          },
          jid
        );
      } else {
        // 🔹 PRIVATE — gunakan readMessages
        await sock.readMessages([
          {
            remoteJid: jid,
            id: msg.key.id!,
          },
        ]);
      }
    } catch (err) {
      console.log("READ LOGIC ERROR:", err);
    }
  });

  log.event("Event handler ready.");
}
