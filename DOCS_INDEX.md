# 📚 Documentation Index

Welcome to zenith-bun documentation! This index will help you navigate through all available documentation.

## 🚀 Getting Started

1. **[README.md](README.md)** - Main documentation
   - Quick start guide
   - Installation instructions
   - Basic usage
   - Project structure

## 🎯 Core Features

### Parallel Execution System
- **[PARALLEL_EXECUTION.md](PARALLEL_EXECUTION.md)** - Technical documentation
  - How it works
  - Implementation details
  - Best practices
  - Safety features

- **[PARALLEL_EXECUTION_VISUAL.md](PARALLEL_EXECUTION_VISUAL.md)** - Visual explanation
  - Before/After diagrams
  - Performance comparison
  - Real-world examples
  - Timeline visualizations

- **[PARALLEL_EXECUTION_SUMMARY.md](PARALLEL_EXECUTION_SUMMARY.md)** - Implementation summary
  - Changes made
  - Files modified
  - Benefits
  - Results

### Authentication
- **[AUTH_MODES.md](AUTH_MODES.md)** - Authentication modes
  - QR Code mode
  - Pairing code mode
  - Configuration guide
  - Troubleshooting

## 🐛 Troubleshooting

- **[COMMON_ISSUES.md](COMMON_ISSUES.md)** - Common issues and solutions
  - Connection conflicts (440 error)
  - Multiple instances problem
  - Reconnection loops
  - Status codes reference
  - General troubleshooting

- **[TROUBLESHOOTING_RECONNECTION.md](TROUBLESHOOTING_RECONNECTION.md)** - Reconnection issues
  - Reconnection loop causes
  - Solutions and prevention
  - Code changes made

## 🧪 Testing

- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing guide
  - How to test parallel execution
  - Test scenarios
  - Expected behavior
  - Troubleshooting

- **[test/parallel-execution-test.ts](test/parallel-execution-test.ts)** - Test scenarios
  - Manual test checklist
  - Automated test guide

## 📖 Code Documentation

### Main Files
- `src/index.ts` - Main entry point with parallel event handler
- `src/config.ts` - Bot configuration
- `src/lib/case.ts` - Command handler with parallel execution
- `src/handler/plugin.ts` - Plugin system with hot-reload
- `src/lib/owner.ts` - Owner check utilities
- `src/lib/eval.ts` - Eval command handlers

### Plugin System
- `src/plugins/` - Hot-reloadable plugins directory
  - `ping.ts` - Ping command
  - `info.ts` - Bot info command
  - `admin.ts` - Admin commands
  - `groupinfo.ts` - Group info command
  - `slowtest.ts` - Parallel execution test plugin

## 🎓 Learning Path

### For Beginners
1. Read [README.md](README.md) - Understand basic concepts
2. Read [TESTING_GUIDE.md](TESTING_GUIDE.md) - Learn how to test
3. Try the test scenarios
4. Create your first plugin

### For Advanced Users
1. Read [PARALLEL_EXECUTION.md](PARALLEL_EXECUTION.md) - Deep dive into parallel execution
2. Read [PARALLEL_EXECUTION_VISUAL.md](PARALLEL_EXECUTION_VISUAL.md) - Understand performance
3. Study the source code
4. Optimize your plugins

### For Developers
1. Read all documentation above
2. Study [PARALLEL_EXECUTION_SUMMARY.md](PARALLEL_EXECUTION_SUMMARY.md) - Implementation details
3. Review code in `src/` directory
4. Contribute improvements

## 🔍 Quick Reference

### Common Tasks

**Start the bot:**
```bash
bun start
```

**Create a plugin:**
See [README.md#hot-reloadable-plugins](README.md#-hot-reloadable-plugins)

**Test parallel execution:**
See [TESTING_GUIDE.md](TESTING_GUIDE.md)

**Configure authentication:**
See [AUTH_MODES.md](AUTH_MODES.md)

**Debug issues:**
See [README.md#troubleshooting](README.md#-troubleshooting)

## 📊 Documentation Map

```
📚 Documentation
│
├── 🚀 Getting Started
│   └── README.md
│
├── 🎯 Core Features
│   ├── Parallel Execution
│   │   ├── PARALLEL_EXECUTION.md (Technical)
│   │   ├── PARALLEL_EXECUTION_VISUAL.md (Visual)
│   │   └── PARALLEL_EXECUTION_SUMMARY.md (Summary)
│   │
│   └── Authentication
│       └── AUTH_MODES.md
│
├── 🧪 Testing
│   ├── TESTING_GUIDE.md
│   └── test/parallel-execution-test.ts
│
└── 📖 Code Documentation
    ├── src/index.ts
    ├── src/lib/case.ts
    ├── src/handler/plugin.ts
    └── src/plugins/
```

## 🆘 Need Help?

1. Check [README.md#troubleshooting](README.md#-troubleshooting)
2. Review relevant documentation above
3. Check console logs for errors
4. Review test scenarios in [TESTING_GUIDE.md](TESTING_GUIDE.md)

## 📝 Contributing to Documentation

When adding new features:
1. Update relevant documentation
2. Add examples and test cases
3. Update this index if needed
4. Keep documentation in sync with code

---

**Last Updated:** 2025-12-08  
**Version:** 1.0.0 (Parallel Execution Release)
