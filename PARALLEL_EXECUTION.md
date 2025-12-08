# Parallel Command Execution System

## 🚀 Overview

Bot ini menggunakan **parallel command execution** untuk memastikan bahwa multiple commands dapat diproses secara bersamaan tanpa menyebabkan freeze atau blocking.

## 🔧 How It Works

### 1. **Event Handler Level** (`src/index.ts`)
```typescript
sock.ev.on("messages.upsert", ({ messages }) => {
    // Non-blocking: tidak menggunakan async/await di event handler
    Promise.resolve().then(async () => {
        await handleCommand(sock!, msg);
    });
});
```

**Benefits:**
- ✅ Multiple messages dapat diproses secara paralel
- ✅ Tidak ada blocking pada event loop
- ✅ Error handling yang proper tanpa crash

### 2. **Command Handler Level** (`src/lib/case.ts`)

#### Eval Commands (Owner Only)
```typescript
// Shell execution
if (text.startsWith("$") && isOwnerUser) {
    Promise.resolve().then(() => executeShellCommand(sock, msg, command));
    return;
}

// JavaScript eval
if (text.startsWith("=>") && isOwnerUser) {
    Promise.resolve().then(() => executeJavaScript(sock, msg, code));
    return;
}
```

#### Built-in Commands
```typescript
Promise.resolve().then(async () => {
    switch (command) {
        case "menu":
            // ... handle menu
            break;
        // ... other commands
    }
});
```

**Benefits:**
- ✅ Eval commands tidak block command lainnya
- ✅ Long-running commands tidak freeze bot
- ✅ Multiple users dapat execute commands simultaneously

### 3. **Plugin System** (`src/handler/plugin.ts`)
```typescript
// Execute plugin in parallel (non-blocking)
Promise.resolve().then(async () => {
    try {
        await plugin.execute(ctx);
    } catch (error) {
        log.error(`Error executing plugin ${plugin.name}: ${error}`);
    }
});
```

**Benefits:**
- ✅ Plugins berjalan secara paralel
- ✅ Error di satu plugin tidak affect plugin lainnya
- ✅ Hot-reload tetap aman

## 📊 Execution Flow

```
Message Received
    ↓
Event Handler (Non-blocking)
    ↓
Promise.resolve().then()
    ↓
handleCommand()
    ├─→ Eval Commands (Parallel)
    ├─→ Plugin Commands (Parallel)
    └─→ Built-in Commands (Parallel)
```

## ⚡ Performance Benefits

1. **No Freeze**: Bot tetap responsive meskipun ada command yang long-running
2. **Parallel Processing**: Multiple users dapat execute commands bersamaan
3. **Error Isolation**: Error di satu command tidak affect command lainnya
4. **Scalability**: Bot dapat handle high volume of commands

## 🛡️ Safety Features

1. **Error Handling**: Setiap level memiliki try-catch untuk prevent crash
2. **Promise Rejection Handling**: Unhandled rejections di-catch dengan proper
3. **Timeout Protection**: Long-running commands tidak block event loop
4. **Memory Safe**: Promises di-resolve dengan proper untuk prevent memory leaks

## 📝 Best Practices

### ✅ DO:
- Use `Promise.resolve().then()` untuk async operations
- Add proper error handling di setiap level
- Return early untuk prevent unnecessary processing
- Use non-blocking operations

### ❌ DON'T:
- Jangan gunakan `await` di event handler langsung
- Jangan block event loop dengan synchronous operations
- Jangan lupa error handling
- Jangan gunakan infinite loops tanpa yield

## 🔍 Debugging

Jika ada masalah dengan command execution:

1. Check logs untuk error messages
2. Verify command tidak block dengan long-running operations
3. Ensure proper error handling di plugin
4. Test dengan multiple concurrent commands

## 📚 Related Files

- `src/index.ts` - Main event handler
- `src/lib/case.ts` - Command handler
- `src/handler/plugin.ts` - Plugin execution system
- `src/lib/eval.ts` - Eval command handlers
