# FRIDAY First Install Guide

## 🚀 Quick Install

### One Command Install:

```bash
git clone https://github.com/angga13142/FRIDAY.git
cd friday-mcp-server
npm install
```

**That's it!** FRIDAY auto-setup runs on `npm install`.

---

## ✅ What Happens Automatically

### During `npm install`:

1. **✅ Dependencies installed**
2. **✅ Project built** (`npm run build`)
3. **✅ Auto-setup runs** (`postinstall` hook):
   - Creates `.env` (Git-only mode default)
   - Sets up `.github/memory/` structure
   - Installs AI protocol files
   - Configures Git hooks
   - Sets up VS Code settings
   - Initializes FRIDAY

**NO manual configuration needed!**

---

## 🎯 After Install

### 1. Add to VS Code MCP

Add to `~/.config/Code/User/mcp.json` (Linux/Mac):

```json
{
  "mcpServers": {
    "friday": {
      "command": "node",
      "args": ["/absolute/path/to/friday-mcp-server/dist/index.js"],
      "cwd": "/absolute/path/to/friday-mcp-server"
    }
  }
}
```

### 2. Restart VS Code

### 3. Use FRIDAY

```
#friday-setup
```

**Done! FRIDAY is active.**

---

## 🔧 Modes

### Git-Only Mode (Default)
- ✅ No Redis needed
- ✅ Works offline
- ✅ Git-based memory only
- ✅ Perfect for single developer

### Hybrid Mode (Optional)
- ✅ Git + Redis
- ✅ Faster context loading
- ✅ Cross-device sync
- ✅ Team collaboration

---

## 🌟 Add Redis (Optional)

If you want hybrid mode:

1. Visit: https://console.upstash.com
2. Create free Redis database
3. Copy credentials
4. Add to `.env`:
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```
5. Restart FRIDAY

**But it works great without Redis too!**

---

## 🚨 NO MANUAL SETUP NEEDED

### ❌ You DON'T need to:
- Manually create folders
- Run setup scripts
- Configure Redis first
- Edit configuration files
- Install additional tools

### ✅ Everything is automatic:
- `npm install` does everything
- Defaults to Git-only mode
- Redis is completely optional
- AI protocol auto-active
- VS Code auto-configured

---

## 📊 Installation Checklist

After `npm install` completes:

- [x] Dependencies installed
- [x] Project built
- [x] `.env` created
- [x] Memory structure ready
- [x] AI protocol active
- [x] Git hooks installed
- [x] VS Code configured
- [x] FRIDAY initialized

**Status: ✅ Ready to use!**

---

## 🎓 First Use

```bash
# In VS Code, after adding to MCP:
#friday-setup

# Output (example):
🤖 FRIDAY Setup
✅ Ready
   Mode: git-only
What shall we build?
```

**That's it!** No credentials, no complex setup.

---

## 💡 Why This Approach?

### Traditional Install:
```
1. Clone
2. npm install
3. Create .env
4. Add credentials
5. Run setup script
6. Configure MCP
7. Test
8. Debug issues
(30 minutes)
```

### FRIDAY Install:
```
1. Clone
2. npm install
3. Add to MCP
(2 minutes)
```

---

## 🤖 AI Behavior

When user runs `#friday-setup`:

**❌ AI should NOT:**
- Ask for credentials
- Show long setup explanations
- Create todo lists
- Request Redis configuration

**✅ AI should:**
- Silent check if setup exists
- Run setup if needed (no output)
- Show simple "Ready" message
- Start working immediately

---

## 📞 Support

### If Something Goes Wrong:

```bash
# Re-run install
rm -rf node_modules dist .github/memory
npm install

# Or manual setup
node first-install.js
```

### Get Help:
- GitHub Issues: https://github.com/angga13142/FRIDAY/issues
- Docs: README.md

---

**FRIDAY: Zero-config AI memory system** 🚀

*Install once, use everywhere. No credentials required.*
