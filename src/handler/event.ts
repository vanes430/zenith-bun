// src/handler/event.ts
import type { WASocket, WAMessage } from "baileys";
import { log } from "./logging";
import { color } from "../lib/color";
import { config } from "../config";
import { getActualJid } from "../lib/owner";

export function registerEvents(sock: WASocket) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages?.[0];
    if (!msg || !msg.message) return;

    const jid = msg.key.remoteJid!;
    const actualJid = getActualJid(msg);  // ✅ Get actual JID (not LID)
    const sender = msg.pushName ?? "-";

    // ambil text
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.extendedTextMessage?.matchedText ||
      "";

    // ----- LOG LABEL -----
    let label = `${color.cyan(sender)} ${color.white(`(${actualJid})`)}`; // ✅ Use actualJid

    if (jid.endsWith("@g.us")) {
      try {
        const meta = await sock.groupMetadata(jid);
        const groupName = meta?.subject ?? "Unknown Group";
        const participant = msg.key.participant ?? "";
        const actualParticipant = (msg.key as any)?.remoteJidAlt || participant; // ✅ Get actual participant

        label =
          `${color.cyan(sender)} ${color.white(`(${actualParticipant})`)}` +
          `\n ${color.magenta("@")} ${color.yellow(groupName)} ${color.white(`(${jid})`)}`;
      } catch { }
    }

    if (config.autoLog) {
      log.msg(label, text);
    }

    // -----------------------------------------------------------
    // 🔵 MARK READ LOGIC (ChatModification)
    // -----------------------------------------------------------

    if (config.readReceipts === "all") {
      try {
        if (jid.endsWith("@g.us")) {
          // 🔹 GROUP — gunakan chatModify dengan markRead
          // Type: ChatModification = { markRead: boolean; lastMessages: LastMessageList }
          await sock.chatModify(
            {
              markRead: true,
              lastMessages: [msg],
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
        log.error(err instanceof Error ? err : `READ LOGIC ERROR: ${err}`);
      }
    }
  });

  log.event("Event handler ready.");
}
