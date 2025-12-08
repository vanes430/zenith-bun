# 🔐 Authentication Modes

Bot ini mendukung dua mode autentikasi WhatsApp:

## 1. QR Code Mode (Default)

Mode ini menggunakan QR code untuk autentikasi.

### Cara Menggunakan:
1. Buka `src/config.ts`
2. Set `usePairing: false`
3. Jalankan bot dengan `bun run start`
4. Buka URL QR code yang muncul di console
5. Scan QR code dengan WhatsApp Anda

### Contoh Config:
```typescript
export const config = {
  usePairing: false,
  // ...
}
```

## 2. Pairing Code Mode

Mode ini menggunakan pairing code (8 digit) untuk autentikasi.

### Cara Menggunakan:
1. Buka `src/config.ts`
2. Set `usePairing: true`
3. Isi `phoneNumber` dengan nomor WhatsApp Anda dalam format E.164 **tanpa tanda plus (+)**
4. Jalankan bot dengan `bun run start`
5. Salin kode pairing yang muncul di console
6. Buka WhatsApp > Settings > Linked Devices > Link a Device > Link with phone number instead
7. Masukkan kode pairing

### Format Nomor Telepon:
**PENTING:** Nomor telepon HARUS dalam format E.164 tanpa tanda plus (+)

#### Contoh:
- ❌ Salah: `+1 (234) 567-8901`
- ❌ Salah: `+62 812-7627-4398`
- ✅ Benar: `12345678901`
- ✅ Benar: `6281276274398`

### Contoh Config:
```typescript
export const config = {
  usePairing: true,
  phoneNumber: "6281276274398", // Format E.164 tanpa +
  // ...
}
```

## 📝 Catatan

- Pairing code akan expired dalam beberapa menit, jadi segera masukkan ke WhatsApp
- Jika pairing code expired, restart bot untuk mendapatkan kode baru
- Session akan tersimpan di folder `session/` setelah autentikasi berhasil
- Anda hanya perlu autentikasi sekali, kecuali session dihapus atau logout

## 🔧 Technical Details

### Authentication Mode Exclusivity

Bot ini dirancang untuk **hanya menggunakan SATU mode autentikasi** pada satu waktu:

**Pairing Mode (`usePairing: true`):**
- ✅ QR code generation **DISABLED**
- ✅ Pairing code **ENABLED**
- ✅ `printQRInTerminal` automatically set to `false`
- ✅ Pairing code requested after 1 second

**QR Mode (`usePairing: false`):**
- ✅ QR code generation **ENABLED**
- ✅ Pairing code **DISABLED**
- ✅ `printQRInTerminal` uses config value
- ✅ QR code displayed immediately

### Why This Matters

Previously, both QR and pairing code could be generated simultaneously, causing:
- ❌ Authentication conflicts
- ❌ Invalid pairing codes
- ❌ Connection failures
- ❌ Confusing debug messages

**Now (Fixed):**
- ✅ Only one authentication method runs
- ✅ No conflicts
- ✅ Pairing codes work correctly
- ✅ Clear authentication flow

## 🐛 Troubleshooting

### Problem: Pairing code tidak bisa digunakan

**Symptoms:**
```
[DEBUG] QR received but pairing mode is enabled
```

**Cause:** QR code dan pairing code berjalan bersamaan (OLD BUG - FIXED)

**Solution:** Update ke versi terbaru (sudah diperbaiki)

### Problem: Pairing code expired

**Solution:**
```bash
# Stop bot (Ctrl+C)
rm -rf session/
bun start
# Gunakan pairing code baru yang muncul
```

### Problem: "Session registered: true" tapi tidak connect

**Cause:** Session corrupted atau logged out

**Solution:**
```bash
rm -rf session/
bun start
# Re-authenticate dengan pairing code atau QR
```

### Problem: Ingin ganti dari QR ke Pairing (atau sebaliknya)

**Solution:**
```bash
# 1. Stop bot
# 2. Edit src/config.ts - ubah usePairing
# 3. Hapus session lama
rm -rf session/
# 4. Start bot
bun start
```

## 📊 Authentication Flow

### Pairing Mode Flow:
```
Start Bot
  ↓
Load Session (not registered)
  ↓
Create Socket (printQRInTerminal: false)
  ↓
Wait 1 second
  ↓
Request Pairing Code
  ↓
Display Pairing Code
  ↓
User enters code in WhatsApp
  ↓
Connection Open ✅
```

### QR Mode Flow:
```
Start Bot
  ↓
Load Session (not registered)
  ↓
Create Socket (printQRInTerminal: true)
  ↓
QR Code Generated
  ↓
Display QR URL
  ↓
User scans QR
  ↓
Connection Open ✅
```

---

**Last Updated:** 2025-12-08 (Fixed QR/Pairing conflict)
