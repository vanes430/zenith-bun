// lib/event.ts
import type { WASocket } from "whaileys";
import { log } from "./logging";
import { color } from "../lib/color";

export function registerEvents(sock: WASocket) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages?.[0];
    if (!msg || !msg.message) return;

    const jid = msg.key.remoteJid!;
    const sender = msg.pushName ?? null;

    // Ambil isi pesan
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.extendedTextMessage?.matchedText ||
      "";

    // ----------------------------------------------------
    // 📘 FORMAT MESSAGE LABEL
    // ----------------------------------------------------
    let label = `${color.cyan(sender)} ${color.white(`(${jid})`)}`;

    // ----------------------------------------------------
    // 📘 Jika dari grup
    // ----------------------------------------------------
    if (jid.endsWith("@g.us")) {
      let groupName: string | null = null;

      try {
        const meta = await sock.groupMetadata(jid);
        groupName = meta.subject ?? null;
      } catch {
        groupName = null;
      }

      const participant = msg.key.participant ?? jid;

      label =
        `${color.cyan(sender)} ` +
        `${color.white(`(${participant})`)} ` +
        `${color.magenta("@")} ` +
        `${color.yellow(groupName)} ` +
        `${color.white(`(${jid})`)}`;
    }

    // ----------------------------------------------------
    // 🟢 LOG PESAN (dengan color)
    // ----------------------------------------------------
    log.msg(label, text);

    // ----------------------------------------------------
    // 🔵 AUTO READ (tanpa logging)
    // ----------------------------------------------------
    try {
      await sock.readMessages([
        {
          remoteJid: jid,
          id: msg.key.id!,
          participant: msg.key.participant ?? undefined,
        },
      ]);
    } catch {}
  });

  log.event("Event handler loaded.");
}
