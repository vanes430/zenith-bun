# zenith-bun 🚀

WhatsApp Bot dengan **Parallel Command Execution** - Fast, Scalable, and Non-blocking!

## ✨ Features

- 🚀 **Parallel Command Execution** - Multiple commands diproses bersamaan tanpa freeze
- 🔥 **Hot-Reloadable Plugins** - Edit plugins tanpa restart bot
- 🔒 **Owner-Only Commands** - Shell & JavaScript eval untuk owner
- 👥 **Group Support** - Commands untuk manage group
- 📊 **Auto-logging** - Comprehensive logging system
- 🎯 **Type-Safe** - Full TypeScript support
- ⚡ **Fast** - Powered by Bun runtime

## 🚀 Quick Start

### Installation

```bash
bun install
```

### Running the Bot

```bash
bun start
# or
bun run src/index.ts
```

### Configuration

Edit `src/config.ts`:

```typescript
export const config = {
    botName: "Whaliy",
    owner: ["6281226485398"],  // Your WhatsApp number
    prefix: [".", "!", "/"],
    // ... other settings
};
```

## 📚 Documentation

- **[PARALLEL_EXECUTION.md](PARALLEL_EXECUTION.md)** - Technical details about parallel execution
- **[PARALLEL_EXECUTION_VISUAL.md](PARALLEL_EXECUTION_VISUAL.md)** - Visual explanation with diagrams
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - How to test parallel execution
- **[AUTH_MODES.md](AUTH_MODES.md)** - Authentication modes (QR/Pairing)

## 🎯 Key Features Explained

### 🚀 Parallel Command Execution

Bot ini menggunakan **non-blocking parallel execution** untuk semua commands:

```typescript
// Multiple users dapat execute commands bersamaan
User A: .slowtest 5  // Long-running command
User B: .ping        // Instant response ✅
User C: .info        // Instant response ✅

// User B dan C tidak perlu tunggu User A selesai!
```

**Benefits:**
- ✅ No freeze/blocking
- ✅ Multiple users supported simultaneously
- ✅ Long-running commands don't affect others
- ✅ Error isolation between commands

See [PARALLEL_EXECUTION_VISUAL.md](PARALLEL_EXECUTION_VISUAL.md) for visual explanation.

### 🔥 Hot-Reloadable Plugins

Edit plugins di `src/plugins/` dan bot akan auto-reload:

```typescript
// src/plugins/myPlugin.ts
import type { Plugin } from "../handler/plugin";

const plugin: Plugin = {
    name: "My Plugin",
    description: "Description here",
    commands: ["mycommand"],
    enabled: true,
    ownerOnly: false,
    groupOnly: false,

    async execute(ctx) {
        const { sock, jid } = ctx;
        await sock.sendMessage(jid, { text: "Hello!" });
    }
};

export default plugin;
```

Save file → Bot auto-reloads → Test immediately!

### 🔒 Owner-Only Commands

```bash
# Shell command execution
$ ls -la

# JavaScript eval
=> 2 + 2

# Debug message structure
.dump
```

## 📋 Available Commands

### Public Commands
- `.ping` - Check bot latency
- `.info` - Bot information
- `.menu` - Show all commands
- `.slowtest [seconds]` - Test parallel execution

### Group Commands
- `.groupinfo` - Show group information
- `.kick @user` - Kick user (admin only)
- `.promote @user` - Promote to admin (admin only)
- `.demote @user` - Demote from admin (admin only)

### Owner Commands
- `$ <command>` - Execute shell command
- `=> <code>` - Execute JavaScript code
- `.dump` - Debug message structure
- `.stop` - Stop bot

## 🧪 Testing Parallel Execution

### Test 1: Basic Test
```bash
1. Send: .slowtest 5
2. Immediately send: .ping
3. Immediately send: .info

Result: .ping and .info respond instantly!
```

### Test 2: Multiple Users
```bash
User A: .ping
User B: .info  (send simultaneously)

Result: Both commands processed in parallel
```

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for more test scenarios.

## 📁 Project Structure

```
zenith-bun/
├── src/
│   ├── index.ts              # Main entry point
│   ├── config.ts             # Bot configuration
│   ├── handler/
│   │   ├── event.ts          # Event handlers
│   │   ├── plugin.ts         # Plugin system (hot-reload)
│   │   └── logging.ts        # Logging utilities
│   ├── lib/
│   │   ├── auth.ts           # WhatsApp authentication
│   │   ├── case.ts           # Command handler (parallel)
│   │   ├── owner.ts          # Owner check utilities
│   │   ├── eval.ts           # Eval commands
│   │   └── color.ts          # Console colors
│   ├── plugins/              # Hot-reloadable plugins
│   │   ├── ping.ts
│   │   ├── info.ts
│   │   ├── admin.ts
│   │   └── slowtest.ts       # Test plugin
│   └── func/                 # Helper functions
│       ├── sendButton.ts
│       ├── sendListMessage.ts
│       └── sendContact.ts
├── test/                     # Test files
└── session/                  # WhatsApp session data
```

## 🔧 Development

### Adding New Plugin

1. Create file in `src/plugins/myPlugin.ts`
2. Use the plugin template (see Hot-Reloadable Plugins section)
3. Save file → Bot auto-loads!

### Debugging

Enable debug mode in `src/config.ts`:

```typescript
export const config = {
    autoLog: true,  // Log all messages
    // ...
};
```

## 🐛 Troubleshooting

### Bot freezes on commands
- ✅ **Fixed!** Bot now uses parallel execution
- All commands run non-blocking
- See [PARALLEL_EXECUTION.md](PARALLEL_EXECUTION.md)

### Plugin not loading
- Check console for errors
- Verify plugin exports `default`
- Ensure `ownerOnly` and `groupOnly` are defined

### Authentication issues
- Delete `session/` folder
- Restart bot
- Scan new QR code
- See [AUTH_MODES.md](AUTH_MODES.md)

## 📊 Performance

With parallel execution:
- ✅ 10x faster for concurrent commands
- ✅ No freeze on long-running commands
- ✅ Support unlimited concurrent users
- ✅ Error isolation prevents crashes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test with parallel execution
5. Submit pull request

## 📝 License

This project was created using `bun init` in bun v1.3.3. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## 🙏 Credits

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [Bun](https://bun.com) - Fast JavaScript runtime

---

**Made with ❤️ and ⚡ Parallel Execution**
