# FRIDAY MCP - User Installation Guide

## 🚀 Instant Setup (No Download Needed!)

### Configuration

Add to VS Code: `~/.config/Code/User/mcp.json`

```json
{
  "servers": {
    "friday": {
      "command": "npx",
      "args": ["-y", "github:mnhidayatgani/mcp-friday"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**That's it!** No credentials needed.

---

## ✨ Features Out-of-Box

### 1. **Zero Configuration**
- ✅ No download required
- ✅ No Redis setup needed
- ✅ No credentials to configure
- ✅ Just add to mcp.json and use!

### 2. **Built-in Hybrid Memory**
- ✅ Git-based structured memory
- ✅ Redis-backed fast cache
- ✅ Auto-sync across sessions
- ✅ Always available

### 3. **AI Protocol Active**
- ✅ Auto-documentation
- ✅ Context persistence
- ✅ Memory search
- ✅ Concise responses

---

## 📋 How to Use

### 1. Add to VS Code
```bash
# Linux/Mac
code ~/.config/Code/User/mcp.json

# Windows
code %APPDATA%\Code\User\mcp.json
```

Paste configuration above.

### 2. Restart VS Code

### 3. Use FRIDAY
```
#friday-setup
```

**Output:**
```
🤖 FRIDAY Setup
✅ Ready (hybrid mode)
What would you like to build?
```

---

## 🎯 Commands

| Command | Purpose |
|---------|---------|
| `#friday-setup` | Initialize (once) |
| `#friday-context` | Load context |
| `#friday-search` | Search memory |
| `#friday-sync` | Sync to Redis |

---

## 🔒 Security & Admin

### Built-in Credentials
FRIDAY comes with built-in Redis credentials for public use.

### Admin Override (Optional)
Only repository admin can change Redis instance:

```json
{
  "friday": {
    "command": "npx",
    "args": ["-y", "github:mnhidayatgani/mcp-friday"],
    "env": {
      "NODE_ENV": "production",
      "UPSTASH_REDIS_REST_URL": "https://your-private-instance.upstash.io",
      "UPSTASH_REDIS_REST_TOKEN": "your_private_token"
    }
  }
}
```

---

## 💡 Benefits

### For Users:
- ✅ No setup time (30 seconds)
- ✅ No technical knowledge needed
- ✅ Always latest version
- ✅ No local storage used

### For Developers:
- ✅ Auto-documentation
- ✅ Persistent context
- ✅ Clean AI responses
- ✅ Memory search

---

## 🆚 vs Traditional Setup

### Traditional MCP Server:
```
1. Clone repository
2. npm install
3. Configure .env
4. Add Redis credentials
5. Build project
6. Configure mcp.json
7. Test setup
⏱️  Time: 15-30 minutes
```

### FRIDAY:
```
1. Add to mcp.json
2. Restart VS Code
⏱️  Time: 30 seconds
```

---

## 🌟 Why No Download?

- **Always Updated:** `npx` fetches latest version
- **No Storage:** Runs directly from cache
- **Cross-Device:** Same config everywhere
- **Zero Maintenance:** Updates automatically

---

## 📊 What You Get

```
✅ Hybrid Memory System
   - Git-based long-term storage
   - Redis fast cache
   
✅ AI Protocol
   - Auto-documentation
   - Context persistence
   - Concise responses
   
✅ Zero Config
   - Built-in credentials
   - Auto-setup
   - Ready to use
```

---

## 🚨 Troubleshooting

### FRIDAY not showing up?
1. Check mcp.json syntax
2. Restart VS Code
3. Check MCP server logs

### Redis connection failed?
- Built-in Redis should work automatically
- Check internet connection
- Contact admin if persistent

---

## 📞 Support

- **Issues:** https://github.com/mnhidayatgani/mcp-friday/issues
- **Docs:** README.md in repo

---

## 🎉 Ready to Use!

```json
{
  "friday": {
    "command": "npx",
    "args": ["-y", "github:mnhidayatgani/mcp-friday"]
  }
}
```

**Add → Restart → Use**

**FRIDAY: The zero-config AI memory system** ☁️🚀
