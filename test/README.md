# 🧪 Baileys Connection Tests

File-file test untuk mengisolasi dan debug koneksi Baileys.

## Test Files

### 1. QR Code Test (`qr-test.ts`)
Test koneksi menggunakan QR Code.

**Run:**
```bash
bun run test/qr-test.ts
```

**Expected Output:**
- QR code URL akan muncul
- Scan QR code untuk connect
- Setelah connect, akan menampilkan info user

### 2. Pairing Code Test (`pairing-test.ts`)
Test koneksi menggunakan Pairing Code.

**Setup:**
1. Edit `PHONE_NUMBER` di file `pairing-test.ts`
2. Ganti dengan nomor WhatsApp Anda (format E.164 tanpa +)
   - Contoh: `6281234567890`

**Run:**
```bash
bun run test/pairing-test.ts
```

**Expected Output:**
- Pairing code (8 digit) akan muncul
- Masukkan code di WhatsApp Settings > Linked Devices

## Troubleshooting

### Jika QR/Pairing Code tidak muncul:
1. Cek apakah ada warning WebSocket dari Bun
2. Coba gunakan Node.js instead:
   ```bash
   npx tsx test/qr-test.ts
   # atau
   npx tsx test/pairing-test.ts
   ```

### Jika connection.update tidak trigger:
- Ini kemungkinan issue dengan Bun WebSocket support
- Gunakan Node.js untuk production

## Clean Up

Hapus session test setelah selesai:
```bash
rm -rf test-session test-session-pairing
```
