// src/handler/logging.ts
import { color } from "../lib/color";

export const log = {
  // Message logging (untuk pesan WhatsApp)
  msg: (name: string, text: string) => {
    const size = text?.length ?? 0;
    console.log(
      color.green(
        `[MSG] ${name} size: ${size} \n => ${text}`
      )
    );
  },

  // Event logging (untuk event sistem)
  event: (text: string) => {
    console.log(color.blue(`[EVENT] ${text}`));
  },

  // Error logging
  error: (text: string | Error) => {
    const message = text instanceof Error ? text.message : text;
    console.log(color.red(`[ERROR] ${message}`));
  },

  // Warning logging
  warn: (text: string) => {
    console.log(color.yellow(`[WARN] ${text}`));
  },

  // Info logging
  info: (text: string) => {
    console.log(color.cyan(`[INFO] ${text}`));
  },

  // Success logging
  success: (text: string) => {
    console.log(color.green(`[SUCCESS] ${text}`));
  },

  // Debug logging
  debug: (text: string) => {
    console.log(color.magenta(`[DEBUG] ${text}`));
  },

  // Command logging
  cmd: (prefix: string, command: string, from: string) => {
    console.log(color.green(`[CMD] ${prefix}${command} dari ${from}`));
  },

  // Connection logging
  connection: (status: string, details?: string) => {
    const statusColor = status === "open" ? color.green :
      status === "close" ? color.red :
        color.yellow;
    const msg = details ? `${status} - ${details}` : status;
    console.log(statusColor(`[CONNECTION] ${msg}`));
  },

  // QR Code logging
  qr: (url: string) => {
    console.log(color.brightCyan("🚨 Silakan scan QR code di bawah:"));
    console.log("Buka URL ini di browser untuk melihat QR code:");
    console.log(color.brightYellow(`🔗 ${url}`));
  },

  // Pairing code logging
  pairing: (code: string, phoneNumber: string) => {
    console.log(color.brightCyan("🔐 Pairing Code:"));
    console.log(color.brightYellow(`📱 Kode: ${code}`));
    console.log(`📞 Untuk nomor: ${phoneNumber}`);
    console.log(color.yellow("⚠️  Masukkan kode ini di WhatsApp Anda:"));
    console.log("   Settings > Linked Devices > Link a Device > Link with phone number instead");
  },

  // Startup banner
  banner: (text: string) => {
    console.log(text);
  },

  // Generic colored log
  raw: (text: string, colorFn?: (s: string) => string) => {
    console.log(colorFn ? colorFn(text) : text);
  }
};
