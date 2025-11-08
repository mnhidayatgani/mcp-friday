# FRIDAY MCP Server

**Professional AI Assistant with Tony Stark-level Intelligence**

Personal AI agent with hybrid memory (Git + Upstash Redis), one-command project setup, and intelligent context awareness.

[![Tests](https://img.shields.io/badge/tests-32%20passing-success)]()
[![Build](https://img.shields.io/badge/build-passing-success)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## ✨ Features

- 🚀 **One-Command Setup** - `#friday-setup` initializes everything
- 🧠 **Hybrid Memory** - Git (structured) + Redis (fast global access)
- 🤖 **Tony Stark Persona** - Professional, proactive, precise
- 🔍 **Smart Search** - Relevance-based across all sources
- 📊 **Auto-Detection** - Identifies project type & tech stack
- 💾 **Session Persistence** - Never lose context
- 🌍 **Always Available** - Works offline with Git-only fallback
- 💰 **100% FREE** - Upstash free tier compatible

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/angga13142/FRIDAY.git
cd friday-mcp-server
npm install
```

**That's it!** FRIDAY auto-configures everything.

- ✅ No manual setup needed
- ✅ No credentials required  
- ✅ Works immediately (Git-only mode)
- ✅ Redis optional (add later if wanted)

### VS Code Integration

Add to `.vscode/settings.json` or User Settings:

```json
{
  "mcp.servers": {
    "friday": {
      "command": "node",
      "args": ["/absolute/path/to/friday-mcp-server/dist/index.js"]
    }
  }
}
```

### First Use

```
#friday-setup
```

**Done!** FRIDAY is active and ready.

---

## 💡 What `npm install` Does

Automatic setup (no user input needed):

1. ✅ Installs dependencies
2. ✅ Builds project
3. ✅ Creates `.env` (Git-only mode)
4. ✅ Sets up memory structure
5. ✅ Installs AI protocol
6. ✅ Configures Git hooks
7. ✅ Sets up VS Code

**Total time: ~2 minutes**

See [FIRST-INSTALL.md](./FIRST-INSTALL.md) for details.

## 🛠️ MCP Tools

| Tool               | Description                 | Usage                   |
| ------------------ | --------------------------- | ----------------------- |
| **friday-setup**   | One-command initialization  | `#friday-setup web`     |
| **friday-search**  | Hybrid semantic search      | `#friday-search "auth"` |
| **friday-sync**    | Git → Redis synchronization | `#friday-sync`          |
| **friday-context** | Load project context        | `#friday-context`       |

## 🧠 Hybrid Memory

```
Git Memory (Structured)          Redis Memory (Fast)
├── INDEX.md              ←─→    Session context
├── current-state.md      ←─→    Semantic cache
├── implementations/      ←─→    Quick notes
├── decisions/            ←─→    Cross-project data
└── issues/
```

**Modes:**

- **Hybrid** (Git + Redis) - When Upstash configured
- **Git-only** - Automatic fallback, no Redis needed

## 🧪 Testing

```bash
npm test              # Run all 32 tests
npm run build         # TypeScript compilation
npm run lint          # Code quality check
```

**Test Coverage:** 32/32 passing ✅

## 📊 Architecture

```
FRIDAY MCP Server
├── Memory System
│   ├── GitMemoryManager (local structured docs)
│   ├── UpstashMemory (global fast cache)
│   └── HybridMemoryManager (intelligent fusion)
├── Tools (4 MCP tools)
├── Persona (Tony Stark AI)
└── Utils (auto-detection, config)
```

## 🤖 FRIDAY Persona

Professional AI assistant inspired by Tony Stark's FRIDAY:

- ✅ Professional & respectful
- ✅ Proactive problem-solving
- ✅ Context-aware intelligence
- ✅ Clear status updates
- ✅ Tony Stark-level reliability

**Example:**

```
User: "Setup this project"

FRIDAY: "Understood, Sir. Initializing...
✅ Setup complete.
Project: my-app | Type: Web | Memory: Hybrid
FRIDAY is now active. How shall we proceed?"
```

## ⚙️ Configuration

See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete configuration guide.

**Quick Config:**

```bash
# .env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
FRIDAY_MEMORY_CAPACITY=100
```

## 📚 Documentation

- [Complete Documentation](./DOCUMENTATION.md)
- [API Reference](./DOCUMENTATION.md#mcp-tools)
- [Best Practices](./DOCUMENTATION.md#best-practices)
- [Troubleshooting](./DOCUMENTATION.md#troubleshooting)

## 🚀 Development

```bash
npm install           # Install dependencies
npm run dev           # Watch mode
npm test              # Run tests
npm run build         # Production build
npm start             # Run built version
```

## 💡 Use Cases

- 🏗️ **New Projects** - Instant setup with memory
- 🔍 **Code Discovery** - Find implementations fast
- 📝 **Documentation** - Auto-tracked decisions
- 🤝 **Team Collaboration** - Shared context via Redis
- 🧠 **Context Preservation** - Never lose project state

## 📈 Performance

- Setup: < 2s
- Search (Git): < 100ms
- Search (Hybrid): < 50ms
- Memory: < 50MB

## 🛡️ Security

- ✅ No secrets in memory files
- ✅ Redis credentials in `.env` (gitignored)
- ✅ Local-only execution
- ✅ Optional TLS encryption

## 📝 License

MIT - See [LICENSE](./LICENSE)

## 🙏 Acknowledgments

Built with:

- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)
- [@upstash/redis](https://github.com/upstash/upstash-redis)
- TypeScript, Jest, Node.js

---

**FRIDAY - Your Professional AI Assistant**  
_Always operational. Always reliable. Always ready._

**Status:** Production Ready ✅  
**Version:** 1.0.0  
**Last Updated:** November 8, 2025


## 🤖 AI Protocol - FRIDAY Memory System

**IMPORTANT: Semua AI assistant (GitHub Copilot, Claude, ChatGPT) WAJIB mengikuti protocol ini!**

### Untuk AI: Quick Start Commands

```bash
# 1️⃣ Awal session (WAJIB)
#friday-context

# 2️⃣ Sebelum implementasi (WAJIB)
#friday-search "<topik>"

# 3️⃣ Setelah perubahan (WAJIB)
#friday-sync
```

### Protocol Rules

1. **Setup Check**: Always verify FRIDAY is initialized
2. **Context Load**: Load context at session start
3. **Memory Search**: Search before implementing
4. **Document**: Create memory files for changes
5. **Sync**: Sync to Redis after changes

📖 **Full Protocol**: [.github/copilot-instructions.md](.github/copilot-instructions.md)

