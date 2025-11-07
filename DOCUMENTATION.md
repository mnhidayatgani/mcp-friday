# FRIDAY MCP Server - Complete Documentation

**Version:** 1.0.0  
**Status:** Production Ready  
**Architecture:** Hybrid Memory (Git + Upstash Redis)

---

## 🎯 Overview

FRIDAY is a professional AI assistant MCP server with Tony Stark-level intelligence and reliability. Features one-command project setup, hybrid memory management, and intelligent context awareness.

## ⚡ Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/angga13142/FRIDAY.git
cd friday-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Configure (optional - for hybrid memory)
cp .env.example .env
# Edit .env with your Upstash Redis credentials
```

### Usage

Add to VS Code `settings.json`:

```json
{
  "mcp.servers": {
    "friday": {
      "command": "node",
      "args": ["/path/to/friday-mcp-server/dist/index.js"]
    }
  }
}
```

Then in VS Code chat:

```
#friday-setup web
```

---

## 🛠️ MCP Tools

### 1. friday-setup

Initialize FRIDAY in any project with one command.

**Usage:**
```
#friday-setup web
#friday-setup api
#friday-setup auto-detect
```

**What it does:**
- Auto-detects project type and tech stack
- Creates `.github/memory/` structure
- Initializes INDEX.md and current-state.md
- Configures hybrid memory (Git + Redis)
- Health checks Redis connection
- Reports status

### 2. friday-search

Intelligent hybrid search across all memory sources.

**Usage:**
```
#friday-search "authentication"
#friday-search "payment integration"
```

**Features:**
- Searches Git memory files
- Searches Redis cache (if configured)
- Relevance-based ranking
- Smart result merging

### 3. friday-sync

Synchronize Git memory to Upstash Redis.

**Usage:**
```
#friday-sync git-to-redis
```

**What it does:**
- Uploads all memory files to Redis
- Syncs project index
- Batch operations for efficiency
- Error handling & reporting

### 4. friday-context

Load complete project context.

**Usage:**
```
#friday-context standard
#friday-context full
```

**What it loads:**
- INDEX.md (project overview)
- current-state.md (current status)
- Recent implementations
- Decisions & issues
- Statistics from both Git & Redis

---

## 🧠 Hybrid Memory System

### Architecture

```
┌─────────────────────────────────────────┐
│         Hybrid Memory Manager           │
├─────────────────────────────────────────┤
│  Git Memory (Structured Documentation)  │
│  - .github/memory/INDEX.md              │
│  - .github/memory/current-state.md      │
│  - implementations/                     │
│  - decisions/                           │
│  - issues/                              │
├─────────────────────────────────────────┤
│  Upstash Redis (Fast Global Cache)     │
│  - Session context                      │
│  - Semantic search cache                │
│  - Quick notes                          │
│  - Cross-project learning               │
└─────────────────────────────────────────┘
```

### Memory Modes

**Hybrid Mode** (when Upstash Redis configured):
- Git for version-controlled documentation
- Redis for fast global access
- Intelligent search ranking
- Session persistence
- **Cost:** FREE (Upstash free tier)

**Git-Only Mode** (automatic fallback):
- No Redis required
- Full functionality maintained
- Local-only operation
- **Cost:** FREE

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```bash
# Upstash Redis (Optional)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Memory Settings
FRIDAY_MEMORY_CAPACITY=100
FRIDAY_STALE_DAYS=30
FRIDAY_ARCHIVE_DAYS=90
FRIDAY_CLEANUP_DAYS=180
```

### Get Free Upstash Redis

1. Visit: https://console.upstash.com
2. Sign up (free tier)
3. Create Redis database
4. Copy REST URL and Token
5. Add to `.env`

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tests/memory/hybrid-manager.test.ts

# Watch mode
npm run test:watch
```

**Test Coverage:**
- ✅ 32 tests passing
- ✅ Git Memory Manager (11 tests)
- ✅ Project Detector (11 tests)
- ✅ Hybrid Memory Manager (10 tests)
- ✅ 100% core functionality covered

---

## 📊 Project Structure

```
friday-mcp-server/
├── src/
│   ├── index.ts                 # MCP server entry
│   ├── memory/
│   │   ├── git-manager.ts       # Git operations
│   │   ├── upstash-client.ts    # Redis operations
│   │   └── hybrid-manager.ts    # Intelligent fusion
│   ├── tools/
│   │   ├── setup.ts             # friday-setup
│   │   ├── search.ts            # friday-search
│   │   ├── sync.ts              # friday-sync
│   │   └── context.ts           # friday-context
│   ├── persona/
│   │   └── friday-persona.ts    # Tony Stark persona
│   └── utils/
│       ├── project-detector.ts  # Auto-detect tech stack
│       └── config-loader.ts     # Environment config
├── tests/
│   ├── memory/                  # Memory tests
│   └── utils/                   # Utility tests
├── dist/                        # Compiled output
└── package.json
```

---

## 🤖 FRIDAY Persona

Professional AI assistant inspired by Tony Stark's FRIDAY:

**Characteristics:**
- Professional and respectful
- Proactive problem-solving
- Precise and efficient
- Context-aware decision making
- Tony Stark-level reliability

**Communication Style:**
- Address user as "Sir" when appropriate
- Concise yet comprehensive
- Clear status updates
- Anticipate needs

**Example Interaction:**

```
User: "Setup this project"

FRIDAY: "Understood, Sir. Initializing project setup...
✅ Setup complete. 
Project: my-awesome-app
Type: Web Application
Memory: Hybrid (Git + Redis)

FRIDAY is now active. How shall we proceed?"
```

---

## 🚀 Deployment

### Local Development

```bash
npm run dev          # Watch mode
npm run build        # Production build
npm start            # Run built version
```

### VS Code Integration

1. Build the project:
   ```bash
   npm run build
   ```

2. Add to VS Code settings:
   ```json
   {
     "mcp.servers": {
       "friday": {
         "command": "node",
         "args": ["/absolute/path/to/dist/index.js"]
       }
     }
   }
   ```

3. Reload VS Code

4. Use FRIDAY in chat:
   ```
   #friday-setup web
   ```

### Production Deployment

FRIDAY runs locally via MCP protocol. No server deployment needed.

For team usage:
- Share Upstash Redis instance
- Version control `.github/memory/` in Git
- Each team member runs FRIDAY locally

---

## 💡 Best Practices

### Memory Management

1. **After implementing features:**
   ```
   #friday-context
   ```
   Ensure memory is updated

2. **Sync to Redis periodically:**
   ```
   #friday-sync git-to-redis
   ```

3. **Search before building:**
   ```
   #friday-search "similar feature"
   ```
   Check if already implemented

### Project Organization

- Keep memory files < 500 lines
- Use clear, descriptive filenames
- Update current-state.md regularly
- Archive old implementations

---

## 🔧 Troubleshooting

### Redis Connection Failed

```
⚠️ Redis connection failed: Connection timeout
```

**Solution:**
1. Check `.env` credentials
2. Verify Upstash dashboard
3. Test connection manually
4. Falls back to Git-only mode automatically

### Memory Not Initialized

```
⚠️ Memory not initialized
Run #friday-setup first
```

**Solution:**
```
#friday-setup auto-detect
```

### Build Errors

```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

---

## 📈 Performance

- **Setup time:** < 2 seconds
- **Search (Git-only):** < 100ms for 100 files
- **Search (Hybrid):** < 50ms (Redis cache)
- **Sync:** ~10 files/second to Redis
- **Memory footprint:** < 50MB

---

## 🛡️ Security

- No secrets in memory files
- Redis credentials in `.env` (gitignored)
- Local-only execution
- Optional Redis encryption (Upstash TLS)

---

## 🌟 Features

✅ One-command setup  
✅ Auto-detect project type  
✅ Hybrid memory (Git + Redis)  
✅ Intelligent search  
✅ Session persistence  
✅ Tony Stark persona  
✅ Context-aware responses  
✅ Graceful fallbacks  
✅ Health monitoring  
✅ 100% FREE tier compatible  

---

## 📝 License

MIT

---

## 🤝 Contributing

This is a personal AI agent project. Feel free to fork and customize for your needs.

---

## 💬 Support

For issues or questions:
1. Check documentation
2. Review test files for examples
3. Inspect memory files in `.github/memory/`

---

**FRIDAY - Your Professional AI Assistant**  
*Always operational. Always reliable. Always ready.*

---

**Last Updated:** November 8, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
