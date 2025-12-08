// config.ts

export const config = {
  botName: "Zenith-Bun",

  prefix: [".", "!"],

  // Read receipts: 'all' = send read receipts, 'none' = don't send
  readReceipts: "all" as "all" | "none",
  autoLog: true,

  owner: ["6281276274398"],

  // Owner JID (format WhatsApp: nomor@s.whatsapp.net)
  // Akan di-generate otomatis dari owner array
  get ownerJid() {
    return this.owner.map(num => `${num}@s.whatsapp.net`);
  },

  // === Authentication Settings ===

  // Pairing Code Mode: true = pairing code, false = QR code
  usePairing: true,

  // Phone number untuk pairing code (format E.164 tanpa +)
  // Contoh: +1 (234) 567-8901 -> 12345678901
  phoneNumber: "6281226485398", // Ganti dengan nomor Anda

  // Session folder path
  sessionPath: "session",

  // QR Code API URL (untuk generate QR code via URL)
  qrApiUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=",

  // === Logger Settings ===

  // Pino logger level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent'
  // 'silent' = tidak ada log dari baileys
  logLevel: "silent" as "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "silent",

  // === Connection Settings ===

  // Mark online saat connect
  markOnlineOnConnect: true,

  // Print QR di terminal (jika false, gunakan URL)
  printQRInTerminal: false,

  // === Display Settings ===

  // Show ASCII banner saat connect
  showBanner: true,

  // Show connection info saat connect
  showConnectionInfo: true,

  // Tambahkan konfigurasi lain nanti di sini tanpa ribet
} as const;
