# 🔌 Plugin System - Map-Based Auto-Registry

## ✨ Konsep

Plugins tetap di folder `src/plugins/`, tapi `plugin.ts` akan **auto-fetch** dan register semua plugins ke **Map registry**.

### Architecture:

```
src/plugins/          ← Plugin files here
  ├── ping.ts
  ├── info.ts
  ├── admin.ts
  ├── groupinfo.ts
  └── listplugins.ts

src/handler/
  └── plugin.ts       ← Auto-register ke Map!

Map<string, Plugin>   ← Runtime registry
```

### Flow:

```
1. Bot start
   ↓
2. loadAllPlugins("src/plugins/")
   ↓
3. Scan folder → Load each .ts file
   ↓
4. Register to Map<string, Plugin>
   ↓
5. Watch folder for changes
   ↓
6. Hot-reload on file change
```

## 🎯 Keuntungan

1. ✅ **Organized** - Plugins di folder terpisah
2. ✅ **Map-Based** - Fast lookup dengan Map
3. ✅ **Hot-Reload** - Auto-reload on file change
4. ✅ **Type Safe** - Full TypeScript support
5. ✅ **Easy to Add** - Just create new file!

## 📝 Cara Membuat Plugin Baru

### Step 1: Create File

```bash
touch src/plugins/mycommand.ts
```

### Step 2: Write Plugin

```typescript
// src/plugins/mycommand.ts
import type { Plugin, PluginContext } from "../handler/plugin";

const plugin: Plugin = {
  name: "My Command",
  description: "Does something cool",
  commands: ["mycommand", "mc"],
  enabled: true,
  ownerOnly: false,  // ✅ REQUIRED
  groupOnly: false,  // ✅ REQUIRED

  async execute(ctx: PluginContext) {
    const { sock, jid, isOwner, isGroup, isAdminGroup } = ctx;
    
    await sock.sendMessage(jid, {
      text: "Hello from my plugin!"
    });
  },
};

export default plugin;
```

### Step 3: Save File

Plugin **otomatis ter-load** ke Map registry! Tidak perlu restart bot.

## 🔄 Hot-Reload

### Auto-Reload Triggers:

- ✅ **File changed** - Edit & save → Auto reload
- ✅ **File created** - New plugin → Auto load
- ✅ **File deleted** - Remove plugin → Auto unload

### Example:

```bash
# Edit plugin
vim src/plugins/ping.ts

# Save file
:wq

# Bot automatically reloads ping.ts!
# No restart needed!
```

## 🗺️ Map Registry

### Structure:

```typescript
Map<string, Plugin> {
  "ping.ts" => { name: "Ping", commands: ["ping"], ... },
  "info.ts" => { name: "Info", commands: ["info", "about"], ... },
  "admin.ts" => { name: "Admin", commands: ["admin", "sudo"], ... },
  "groupinfo.ts" => { name: "Group Info", commands: ["groupinfo", "ginfo"], ... },
  "listplugins.ts" => { name: "List Plugins", commands: ["listplugins", "plugins"], ... },
}
```

### Benefits:

- **Fast Lookup** - O(1) access
- **Easy Iteration** - `for (const [, plugin] of pluginRegistry)`
- **Atomic Operations** - Thread-safe add/remove
- **Dynamic** - Add/remove at runtime

## 📊 Built-in Commands

### `listplugins` / `plugins` (Owner Only)

List semua plugins yang ter-load:

```
🔌 PLUGIN LIST

📊 Stats:
• Total: 5
• Enabled: 5
• Disabled: 0

✅ Enabled Plugins:
1. Ping
   • Commands: ping
   • Type: 🌐 Public
   • Desc: Test bot latency

2. Info
   • Commands: info, about
   • Type: 🌐 Public
   • Desc: Show bot information

3. Admin
   • Commands: admin, sudo
   • Type: 👑 Owner
   • Desc: Admin commands (owner only)

4. List Plugins
   • Commands: listplugins, plugins
   • Type: 👑 Owner
   • Desc: List all loaded plugins with details

5. Group Info
   • Commands: groupinfo, ginfo
   • Type: 👥 Group
   • Desc: Show group information (group only)
```

## 🎨 Plugin Template

```typescript
// src/plugins/template.ts
import type { Plugin, PluginContext } from "../handler/plugin";

const plugin: Plugin = {
  // Plugin metadata
  name: "Plugin Name",
  description: "What this plugin does",
  commands: ["cmd1", "cmd2"],
  enabled: true,
  
  // Permission flags (REQUIRED!)
  ownerOnly: false,  // true = owner only
  groupOnly: false,  // true = group only

  // Execute function
  async execute(ctx: PluginContext) {
    // Destructure context
    const { 
      sock,        // WASocket
      msg,         // IWebMessageInfo
      args,        // string[] - command arguments
      jid,         // string - chat JID
      sender,      // string - sender JID
      isOwner,     // boolean - is sender owner?
      isGroup,     // boolean - is group chat?
      isAdminGroup // boolean - is sender admin in group?
    } = ctx;
    
    // Your plugin logic here
    await sock.sendMessage(jid, {
      text: "Response"
    });
  },
};

export default plugin;
```

## 🔧 Advanced Examples

### Echo Plugin

```typescript
// src/plugins/echo.ts
import type { Plugin, PluginContext } from "../handler/plugin";

const plugin: Plugin = {
  name: "Echo",
  description: "Echo back your message",
  commands: ["echo"],
  enabled: true,
  ownerOnly: false,
  groupOnly: false,

  async execute(ctx) {
    const { sock, jid, args } = ctx;
    const text = args.join(" ") || "Nothing to echo!";
    
    await sock.sendMessage(jid, {
      text: `🔊 ${text}`
    });
  },
};

export default plugin;
```

### Owner-Only Broadcast

```typescript
// src/plugins/broadcast.ts
import type { Plugin, PluginContext } from "../handler/plugin";

const plugin: Plugin = {
  name: "Broadcast",
  description: "Broadcast message to all chats",
  commands: ["broadcast", "bc"],
  enabled: true,
  ownerOnly: true,   // ✅ Only owner!
  groupOnly: false,

  async execute(ctx) {
    const { sock, jid, args } = ctx;
    const message = args.join(" ");
    
    if (!message) {
      await sock.sendMessage(jid, {
        text: "❌ Usage: .broadcast <message>"
      });
      return;
    }
    
    // Broadcast logic here
    await sock.sendMessage(jid, {
      text: `📢 Broadcasting: ${message}`
    });
  },
};

export default plugin;
```

### Group-Only Tagall

```typescript
// src/plugins/tagall.ts
import type { Plugin, PluginContext } from "../handler/plugin";

const plugin: Plugin = {
  name: "Tag All",
  description: "Tag all members in group",
  commands: ["tagall", "everyone"],
  enabled: true,
  ownerOnly: false,
  groupOnly: true,   // ✅ Only in groups!

  async execute(ctx) {
    const { sock, jid, isAdminGroup } = ctx;
    
    if (!isAdminGroup) {
      await sock.sendMessage(jid, {
        text: "❌ Only admins can use this!"
      });
      return;
    }
    
    const groupMeta = await sock.groupMetadata(jid);
    const mentions = groupMeta.participants.map(p => p.id);
    
    await sock.sendMessage(jid, {
      text: "📢 @everyone",
      mentions: mentions
    });
  },
};

export default plugin;
```

## 🎯 Plugin Categories

Auto-detected based on flags:

### 🌐 Public Plugins
```typescript
ownerOnly: false,
groupOnly: false,
```
Anyone can use, anywhere.

### 👑 Owner Only
```typescript
ownerOnly: true,
groupOnly: false,
```
Only owner can use, anywhere.

### 👥 Group Only
```typescript
ownerOnly: false,
groupOnly: true,
```
Anyone in group can use.

### 👑👥 Owner in Group
```typescript
ownerOnly: true,
groupOnly: true,
```
Only owner in group can use.

## 🚀 Development Workflow

### 1. Create Plugin

```bash
touch src/plugins/weather.ts
```

### 2. Write Code

```typescript
import type { Plugin, PluginContext } from "../handler/plugin";

const plugin: Plugin = {
  name: "Weather",
  commands: ["weather", "cuaca"],
  enabled: true,
  ownerOnly: false,
  groupOnly: false,
  
  async execute(ctx) {
    // Your code
  },
};

export default plugin;
```

### 3. Save & Test

File auto-loads! Test immediately.

### 4. Iterate

Edit → Save → Auto-reload → Test

## 💡 Best Practices

1. **One file = One plugin** - Keep focused
2. **Use descriptive names** - Clear command names
3. **Add descriptions** - Help users understand
4. **Handle errors** - Try-catch in execute
5. **Validate input** - Check args before use
6. **Use context flags** - isOwner, isGroup, isAdminGroup
7. **Export default** - Always `export default plugin`

## 🎉 Conclusion

Plugin system dengan Map-based auto-registry memberikan:

- ✅ **Organization** - Plugins in separate files
- ✅ **Performance** - Fast Map lookup
- ✅ **Hot-Reload** - Auto-reload on changes
- ✅ **Simplicity** - Just create file & save!

**Create file → Write code → Save → Done!** 🚀
