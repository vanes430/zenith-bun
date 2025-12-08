# 🔒 Eval Features - Owner Only

Bot memiliki 2 eval features yang sangat powerful untuk owner:

## 1. 🖥️ Shell Command Execution (`$`)

Execute shell commands langsung dari WhatsApp.

### Syntax:

```
$ <command>
```

### Examples:

#### List Files
```
$ ls -la
```

**Output:**
```
🖥️ Shell Command

📝 Command: `ls -la`
🔢 Exit Code: 0

📤 Output:
```
total 48
drwxrwxr-x 6 user user 4096 Dec  8 14:30 .
drwxrwxr-x 3 user user 4096 Dec  8 13:50 ..
-rw-rw-r-- 1 user user  123 Dec  8 14:30 package.json
...
```
```

#### Check System Info
```
$ uname -a
```

#### Check Disk Space
```
$ df -h
```

#### Check Memory
```
$ free -h
```

#### Check Running Processes
```
$ ps aux | head -10
```

#### Git Status
```
$ git status
```

#### NPM/Bun Commands
```
$ bun --version
```

### Features:

- ✅ **Owner Only** - Hanya owner yang bisa execute
- ✅ **Timeout** - Auto-kill after 30 seconds
- ✅ **Output Limit** - Max 3000 chars stdout, 1000 chars stderr
- ✅ **Error Handling** - Shows stderr if command fails
- ✅ **Exit Code** - Shows command exit code

### Security:

⚠️ **DANGER!** Shell commands bisa berbahaya:
- Bisa delete files
- Bisa modify system
- Bisa install packages
- Bisa access sensitive data

**Use with caution!**

---

## 2. ⚡ JavaScript Eval (`=>`)

Execute JavaScript code dengan akses ke bot context.

### Syntax:

```
=> <javascript code>
```

### Available Variables:

- `sock` - WASocket instance
- `msg` - Current message object
- `jid` - Current chat JID
- `config` - Bot config
- `log` - Logging functions

### Examples:

#### Simple Math
```
=> 2 + 2
```

**Output:**
```
⚡ JavaScript Eval

📝 Code: `2 + 2`

📤 Result:
```
4
```
```

#### Get Bot Info
```
=> config.botName
```

**Output:**
```
⚡ JavaScript Eval

📝 Code: `config.botName`

📤 Result:
```
"Zenith-Bun"
```
```

#### Get User Info
```
=> sock.user
```

**Output:**
```
⚡ JavaScript Eval

📝 Code: `sock.user`

📤 Result:
```
{
  "id": "6281234567890:3@s.whatsapp.net",
  "name": "Bot Name"
}
```
```

#### Send Message
```
=> await sock.sendMessage(jid, { text: "Hello from eval!" })
```

#### Get Group Metadata
```
=> await sock.groupMetadata(jid)
```

#### Console Log
```
=> console.log("Test from eval")
```

#### Complex Logic
```
=> {
  const users = ["user1", "user2", "user3"];
  return users.map(u => u.toUpperCase());
}
```

### Features:

- ✅ **Owner Only** - Hanya owner yang bisa execute
- ✅ **Async Support** - Bisa pakai `await`
- ✅ **Full Access** - Access to sock, msg, jid, config, log
- ✅ **Error Handling** - Shows error if code fails
- ✅ **JSON Output** - Auto-stringify result

### Security:

⚠️ **DANGER!** JavaScript eval bisa berbahaya:
- Bisa modify bot state
- Bisa access sensitive data
- Bisa crash bot
- Bisa send messages to anyone

**Use with caution!**

---

## 🔒 Security Features

### Owner Check

Both features check if sender is owner:

```typescript
const isOwner = config.ownerJid.includes(sender || "");

if (text.startsWith("$") && isOwner) {
  // Execute shell command
}

if (text.startsWith("=>") && isOwner) {
  // Execute JavaScript
}
```

### Non-Owner Response

If non-owner tries to use eval features, they get **no response** (silent rejection).

---

## 📝 Usage Examples

### Shell Commands

```bash
# System info
$ hostname
$ whoami
$ pwd

# File operations
$ ls -la
$ cat package.json
$ head -n 10 README.md

# Process management
$ ps aux | grep node
$ top -b -n 1 | head -20

# Network
$ ping -c 3 google.com
$ curl -I https://google.com

# Git
$ git log -5 --oneline
$ git branch
$ git diff

# Package manager
$ bun --version
$ npm list --depth=0
```

### JavaScript Eval

```javascript
// Simple expressions
=> 1 + 1
=> Math.random()
=> new Date().toISOString()

// String operations
=> "hello".toUpperCase()
=> ["a", "b", "c"].join("-")

// Object operations
=> Object.keys(config)
=> JSON.stringify(config, null, 2)

// Bot operations
=> sock.user?.name
=> await sock.groupMetadata(jid)
=> await sock.sendMessage(jid, { text: "Test" })

// Complex logic
=> {
  const result = [];
  for (let i = 0; i < 5; i++) {
    result.push(i * 2);
  }
  return result;
}

// Async operations
=> await fetch("https://api.github.com/users/github").then(r => r.json())
```

---

## ⚠️ Important Notes

### 1. Owner Only

Both features are **strictly owner only**. Non-owners cannot use them.

### 2. No Prefix Required

Unlike normal commands, eval features don't need prefix:
- ❌ `.$ ls` - Wrong
- ✅ `$ ls` - Correct
- ❌ `.=> 1+1` - Wrong
- ✅ `=> 1+1` - Correct

### 3. Timeout

Shell commands have 30-second timeout. Long-running commands will be killed.

### 4. Output Limit

- Shell stdout: Max 3000 characters
- Shell stderr: Max 1000 characters
- JavaScript result: Full JSON output

### 5. Error Handling

Both features have error handling and will show error messages if something fails.

---

## 🎯 Use Cases

### Shell Commands (`$`)

- ✅ System monitoring
- ✅ File operations
- ✅ Git operations
- ✅ Package management
- ✅ Process management
- ✅ Network diagnostics

### JavaScript Eval (`=>`)

- ✅ Quick calculations
- ✅ Test bot functions
- ✅ Debug bot state
- ✅ Send test messages
- ✅ Query APIs
- ✅ Data transformations

---

## 🚨 Warnings

### DO NOT:

- ❌ Share eval access with non-owners
- ❌ Run destructive commands without thinking
- ❌ Execute untrusted code
- ❌ Expose sensitive data
- ❌ Use in production without testing

### DO:

- ✅ Test commands in safe environment first
- ✅ Use for debugging and development
- ✅ Keep owner list secure
- ✅ Monitor command execution
- ✅ Use responsibly

---

## 🎉 Conclusion

Eval features memberikan **full control** atas bot dan system untuk owner. Sangat powerful untuk:

- 🐛 Debugging
- 🧪 Testing
- 🔧 Maintenance
- 📊 Monitoring
- ⚡ Quick operations

**Use wisely!** 🔒
