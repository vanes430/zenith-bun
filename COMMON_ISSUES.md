# Common Issues & Solutions

## 🔴 Issue: Connection Conflict (440 - replaced)

### Symptoms:
```
[CONNECTION] open
[SUCCESS] Koneksi WhatsApp berhasil!
[CONNECTION] close
[CONNECTION] close - Status: 440, Reconnect: true
[DEBUG] Disconnect reason: {
  "data": {
    "tag": "conflict",
    "attrs": {
      "type": "replaced"
    }
  }
}
```

### Root Cause:
**Multiple instances of the bot are running with the same session!**

WhatsApp detects multiple connections and replaces the old one with the new one, causing an infinite reconnection loop.

### How to Check:
```bash
# Check if multiple bot instances are running
ps aux | grep "bun.*src/index.ts"

# Or use pgrep
pgrep -fa "bun.*src/index.ts"
```

### Solution:

#### 1. Kill All Bot Instances
```bash
# Kill all bun processes running the bot
pkill -f "bun.*src/index.ts"

# Wait a moment
sleep 2

# Start only ONE instance
bun start
```

#### 2. Prevent Multiple Instances

Add this to your startup script or use a process manager:

**Option A: Simple PID file**
```bash
#!/bin/bash
PID_FILE="/tmp/zenith-bot.pid"

# Check if already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "Bot already running (PID: $PID)"
        exit 1
    fi
fi

# Start bot and save PID
bun start &
echo $! > "$PID_FILE"
```

**Option B: Use PM2**
```bash
# Install PM2
npm install -g pm2

# Start bot with PM2 (only one instance)
pm2 start "bun start" --name zenith-bot --max-restarts 10

# PM2 will prevent multiple instances
pm2 status
```

---

## 🔴 Issue: Reconnection Loop (Other Causes)

### Cause 1: Corrupted Session
**Solution:**
```bash
rm -rf session/
bun start
# Re-authenticate
```

### Cause 2: Network Issues
**Solution:**
- Check internet connection
- Check firewall settings
- Try different network

### Cause 3: WhatsApp Logged Out
**Symptoms:**
```
[CONNECTION] close - Status: 401, Reconnect: false
```

**Solution:**
```bash
rm -rf session/
bun start
# Re-authenticate
```

---

## 🔴 Issue: Bot Freezes on Commands

### Cause:
Long-running commands blocking the event loop (OLD BUG - FIXED in parallel execution update)

### Solution:
Update to latest version with parallel execution support.

---

## 🔴 Issue: Pairing Code Not Working

### Cause:
QR code and pairing code running simultaneously (OLD BUG - FIXED)

### Solution:
Update to latest version with fixed authentication modes.

---

## 🔴 Issue: Owner Check Not Working in Groups

### Cause:
Using `@lid` format instead of actual JID (OLD BUG - FIXED)

### Solution:
Update to latest version with fixed `getActualJid()` function.

---

## 🛠️ General Troubleshooting Steps

### 1. Check Bot Status
```bash
# Check if bot is running
ps aux | grep bun

# Check bot logs
# (logs are in console output)
```

### 2. Clean Restart
```bash
# Stop all instances
pkill -f "bun.*src/index.ts"

# Clean session
rm -rf session/

# Start fresh
bun start
```

### 3. Verify Configuration
```bash
# Check config.ts
cat src/config.ts

# Verify:
# - owner numbers are correct
# - phoneNumber is in E.164 format (no +)
# - usePairing is set correctly
```

### 4. Check Dependencies
```bash
# Reinstall dependencies
rm -rf node_modules
bun install
```

### 5. Check Bun Version
```bash
bun --version
# Should be 1.3.3 or higher
```

---

## 📊 Status Codes Reference

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Unauthorized / Logged out | Delete session, re-authenticate |
| 408 | Connection timeout | Check network |
| 428 | Connection replaced | Kill duplicate instances |
| 440 | Connection conflict | Kill duplicate instances |
| 500 | Internal error | Restart bot, check logs |

---

## 🔍 Debug Mode

Enable debug logging in `src/config.ts`:
```typescript
export const config = {
    logLevel: "debug",  // or "trace" for more details
    autoLog: true,
    // ...
}
```

---

## 📝 Best Practices

1. **Run only ONE instance** of the bot per session
2. **Use process manager** (PM2) for production
3. **Monitor logs** for errors
4. **Keep session folder** backed up
5. **Don't share session** between multiple bots
6. **Restart bot** if it behaves strangely
7. **Update regularly** to get bug fixes

---

## 🆘 Still Having Issues?

1. Check all documentation in `DOCS_INDEX.md`
2. Review `TROUBLESHOOTING_RECONNECTION.md`
3. Check `AUTH_MODES.md` for authentication issues
4. Review console logs for specific errors
5. Try clean installation:
   ```bash
   rm -rf node_modules session
   bun install
   bun start
   ```

---

**Last Updated:** 2025-12-08
