# Troubleshooting - Reconnection Loop

## Problem: Bot keeps reconnecting in a loop

### Symptoms:
```
[CONNECTION] open
[SUCCESS] Koneksi WhatsApp berhasil!
[CONNECTION] close
[CONNECTION] close - Reconnect: true
[INFO] --- START BOT ---  (repeats infinitely)
```

### Root Causes:

1. **Corrupted Session**
   - Session files might be corrupted
   - WhatsApp might have logged out the session
   - Multiple devices using same session

2. **Duplicate Event Handlers** (FIXED)
   - Previous issue: Events were registered multiple times on reconnect
   - Solution: Added `eventsRegistered` flag to prevent duplicate handlers

3. **Rapid Reconnection** (FIXED)
   - Previous issue: Bot reconnected immediately after disconnect
   - Solution: Added 3-second delay before reconnection

### Solutions:

#### Solution 1: Delete Session and Re-authenticate
```bash
# Stop the bot (Ctrl+C)
rm -rf session/
bun start
# Scan new pairing code or QR code
```

#### Solution 2: Check WhatsApp Connection
- Make sure phone has internet connection
- Make sure WhatsApp is not logged out
- Check if too many devices are linked

#### Solution 3: Review Disconnect Reason
The bot now logs disconnect reason:
```
[CONNECTION] close - Status: <code>, Reconnect: <true/false>
[DEBUG] Disconnect reason: {...}
```

Common status codes:
- `401` - Logged out (need to re-authenticate)
- `408` - Connection timeout
- `428` - Connection replaced (another device connected)
- `440` - Connection lost
- `500` - Internal error

### Prevention:

1. **Don't run multiple instances** of the bot with same session
2. **Keep phone connected** to internet
3. **Don't logout** from WhatsApp on phone
4. **Limit linked devices** (max 4 devices per WhatsApp account)

### Code Changes Made:

#### 1. Separated Initial Setup from Reconnection (`src/index.ts`)
```typescript
// Initial setup (run once)
async function startBot() {
    // Load plugins (ONLY ONCE)
    // Watch plugins (ONLY ONCE)
    // Initialize socket
}

// Reconnection (run on disconnect)
async function initializeSocket() {
    // Only reconnect socket
    // Don't reload plugins
    // Don't re-register events
}
```

#### 2. Added Reconnection Delay (`src/lib/auth.ts`)
```typescript
if (shouldReconnect) {
    setTimeout(() => {
        reconnectHandler();
    }, 3000); // Wait 3 seconds before reconnecting
}
```

#### 3. Prevent Duplicate Event Handlers (`src/index.ts`)
```typescript
let eventsRegistered = false;

if (!eventsRegistered) {
    registerEvents(sock);
    sock.ev.on("messages.upsert", ...);
    eventsRegistered = true;
}
```

### Testing:

After fixes, bot should:
- ✅ Connect once
- ✅ Stay connected
- ✅ Only reconnect on actual disconnect (not loop)
- ✅ Wait 3 seconds before reconnecting
- ✅ Not duplicate event handlers

### If Problem Persists:

1. Check `[DEBUG] Disconnect reason` in logs
2. Try different WhatsApp account
3. Check network stability
4. Review Baileys library issues on GitHub

---

**Note:** The reconnection loop was NOT caused by parallel execution changes. It was a pre-existing issue with session management and event handler registration.
