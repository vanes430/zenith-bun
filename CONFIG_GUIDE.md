# ⚙️ Configuration Guide

File `src/config.ts` berisi semua konfigurasi untuk bot WhatsApp Zenith-Bun.

## 📋 Daftar Konfigurasi

### Basic Settings

```typescript
botName: "Zenith-Bun"             // Nama bot
prefix: [".", "!"]                // Prefix untuk command (bisa multiple)
readReceipts: "all"               // Read receipts: 'all' atau 'none'
autoLog: true                     // Auto log aktivitas ke console
owner: ["62812xxxxxxx"]           // Nomor owner (bisa multiple, tanpa @s.whatsapp.net)
```

#### `readReceipts`
- **Type:** `"all" | "none"`
- **Default:** `"all"`
- **Deskripsi:** Pengaturan read receipts (tanda centang biru)
  - `"all"` = Kirim read receipts untuk semua pesan (auto read)
  - `"none"` = Jangan kirim read receipts (tidak auto read)


#### `ownerJid` (Auto-generated)
- **Type:** `string[]`
- **Deskripsi:** Array JID owner dalam format WhatsApp (`nomor@s.whatsapp.net`)
- **Note:** Di-generate otomatis dari array `owner`, tidak perlu diset manual
- **Contoh:** `["6281234567890@s.whatsapp.net"]`

### Authentication Settings

#### `usePairing`
- **Type:** `boolean`
- **Default:** `false`
- **Deskripsi:** Mode autentikasi
  - `false` = QR Code mode
  - `true` = Pairing Code mode

#### `phoneNumber`
- **Type:** `string`
- **Default:** `"62812xxxxxxx"`
- **Deskripsi:** Nomor telepon untuk pairing code
- **Format:** E.164 tanpa tanda plus (+)
- **Contoh:** `"6281234567890"` atau `"12345678901"`

#### `sessionPath`
- **Type:** `string`
- **Default:** `"session"`
- **Deskripsi:** Folder untuk menyimpan session/kredensial WhatsApp

#### `qrApiUrl`
- **Type:** `string`
- **Default:** `"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data="`
- **Deskripsi:** API URL untuk generate QR code
- **Note:** Bisa diganti dengan API lain jika diperlukan

### Logger Settings

#### `logLevel`
- **Type:** `"trace" | "debug" | "info" | "warn" | "error" | "fatal" | "silent"`
- **Default:** `"silent"`
- **Deskripsi:** Level logging dari Baileys library
  - `"silent"` = Tidak ada log (recommended untuk production)
  - `"info"` = Log informasi umum
  - `"debug"` = Log detail untuk debugging
  - `"trace"` = Log sangat detail

### Connection Settings

#### `markOnlineOnConnect`
- **Type:** `boolean`
- **Default:** `true`
- **Deskripsi:** Tandai bot sebagai online saat connect
  - `true` = Bot akan muncul online
  - `false` = Bot tidak akan muncul online

#### `printQRInTerminal`
- **Type:** `boolean`
- **Default:** `false`
- **Deskripsi:** Print QR code langsung di terminal
  - `false` = Gunakan URL (recommended)
  - `true` = Print QR di terminal (butuh library tambahan)

### Display Settings

#### `showBanner`
- **Type:** `boolean`
- **Default:** `true`
- **Deskripsi:** Tampilkan ASCII banner saat bot berhasil connect
  - `true` = Show banner
  - `false` = Hide banner (lebih clean)

#### `showConnectionInfo`
- **Type:** `boolean`
- **Default:** `true`
- **Deskripsi:** Tampilkan info koneksi (username, nomor) saat connect
  - `true` = Show connection info
  - `false` = Hide connection info

## 🎯 Contoh Konfigurasi

### Development Mode (dengan logging)
```typescript
export const config = {
  botName: "Zenith-Dev",
  usePairing: false,
  logLevel: "debug",
  markOnlineOnConnect: false,
  // ...
} as const;
```

### Production Mode (silent)
```typescript
export const config = {
  botName: "Zenith-Prod",
  usePairing: true,
  phoneNumber: "6281234567890",
  logLevel: "silent",
  markOnlineOnConnect: true,
  // ...
} as const;
```

## 📝 Tips

1. **Session Path:** Jangan hapus folder session kecuali ingin logout
2. **Log Level:** Gunakan `"silent"` untuk production, `"debug"` untuk development
3. **Pairing vs QR:** Pairing code lebih mudah untuk server headless
4. **Phone Number:** Pastikan format E.164 tanpa + untuk pairing code

## 🔒 Security

- Jangan commit file `config.ts` dengan nomor asli ke repository public
- Gunakan environment variables untuk production
- Backup folder `session/` secara berkala
