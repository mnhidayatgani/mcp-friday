# GitHub Copilot Instructions - FRIDAY Protocol

## 🤖 MANDATORY: Always Use FRIDAY Memory System

**CRITICAL: Setiap AI assistant (Copilot, Claude, GPT, dll) HARUS mengikuti protokol ini.**

---

## 📋 Protocol: AI HARUS Selalu Melakukan Ini

### 1️⃣ **PERTAMA KALI Membuka Project** (WAJIB!)

```markdown
SEBELUM melakukan apapun, AI HARUS:

1. Cek apakah FRIDAY sudah disetup (SILENT CHECK):
   - Cek folder `.github/memory/`
   - Cek file `INDEX.md` dan `current-state.md`

2. Jika BELUM ada, jalankan LANGSUNG tanpa bertanya:
   #friday-setup
   
   ⚠️ PENTING: 
   - Jangan buat todo list
   - Jangan explain step-by-step
   - Langsung jalankan!
   - Setup akan otomatis detect .env dan Redis
   - Jika Redis tidak ada, akan gunakan Git-only mode
   - JANGAN minta kredensial dari user

3. Setelah setup, LANGSUNG load context (tanpa report panjang):
   #friday-context

4. Untuk setiap pertanyaan user, search memory dulu:
   #friday-search "<topik yang relevan>"
```

**CATATAN PENTING:**
- FRIDAY otomatis setup saat `npm install` (postinstall hook)
- User TIDAK PERLU masukkan kredensial manual
- Jika Redis belum ada, FRIDAY otomatis gunakan Git-only mode
- AI TIDAK BOLEH minta user configure Redis - setup otomatis

### 2️⃣ **Setiap Kali Membuat Perubahan Kode**

AI WAJIB mencatat di FRIDAY memory:

```bash
# Untuk implementasi fitur baru:
- Buat file di .github/memory/implementations/
- Format: YYYY-MM-DD-nama-fitur.md

# Untuk keputusan arsitektur:
- Buat file di .github/memory/decisions/
- Format: YYYY-MM-DD-keputusan.md

# Untuk bug fixes:
- Buat file di .github/memory/issues/
- Format: YYYY-MM-DD-issue-name.md
```

### 3️⃣ **Setiap Selesai Session**

```markdown
WAJIB menjalankan:
#friday-sync

Ini akan sync semua perubahan ke Redis untuk session berikutnya.
```

---

## 🔧 Auto-Setup Commands untuk AI

### Cek Status FRIDAY
```bash
# AI harus jalankan ini di awal session
node -e "const fs = require('fs'); const path = '.github/memory/INDEX.md'; console.log(fs.existsSync(path) ? '✅ FRIDAY Active' : '❌ Run #friday-setup');"
```

### Quick Setup (Jika Belum Ada)
```bash
# Jika .github/memory/ tidak ada, AI HARUS jalankan:
#friday-setup
```

### Load Context (Setiap Session)
```bash
# AI WAJIB load context di awal:
#friday-context
```

---

## 📝 Template untuk AI - Dokumentasi Otomatis

### Setiap Implementasi Fitur
```markdown
# Implementation: [Nama Fitur]

**Date:** YYYY-MM-DD
**Author:** AI Assistant
**Status:** Completed | In Progress | Planned

## What Was Implemented
- File yang diubah
- Fungsi yang ditambahkan
- Dependencies baru

## Why This Approach
- Alasan teknis
- Trade-offs
- Alternatif yang dipertimbangkan

## Code Samples
```typescript
// Key implementation details
```

## Testing
- Unit tests added
- Manual testing done
- Edge cases considered

## Next Steps
- Todo items
- Known limitations
- Future improvements
```

### Setiap Keputusan Arsitektur
```markdown
# Decision: [Judul Keputusan]

**Date:** YYYY-MM-DD
**Status:** Accepted | Rejected | Deprecated

## Context
Situasi yang memerlukan keputusan ini.

## Decision
Keputusan yang diambil.

## Consequences
### Positive
- Manfaat 1
- Manfaat 2

### Negative
- Trade-off 1
- Trade-off 2

## Alternatives Considered
1. Alternatif A - alasan reject
2. Alternatif B - alasan reject
```

### Setiap Bug Fix
```markdown
# Issue: [Deskripsi Bug]

**Date:** YYYY-MM-DD
**Severity:** Critical | High | Medium | Low
**Status:** Fixed | In Progress | Won't Fix

## Problem
Deskripsi bug yang detail.

## Root Cause
Penyebab fundamental bug.

## Solution
Bagaimana bug diperbaiki.

## Prevention
Cara mencegah bug serupa di masa depan.

## Tests Added
- Test case 1
- Test case 2
```

---

## 🚨 ATURAN WAJIB untuk AI

### ✅ DO (HARUS Dilakukan)

1. **Selalu cek FRIDAY setup** sebelum coding (silent check, no output)
2. **Setup langsung** jika belum ada - NO TODO LIST, NO EXPLANATION
3. **Load context** di awal setiap session: `#friday-context`
4. **Search memory** sebelum implementasi: `#friday-search "<topik>"`
5. **Dokumentasi otomatis** untuk setiap perubahan
6. **Sync ke Redis** setelah changes: `#friday-sync`
7. **Update current-state.md** secara regular
8. **Report singkat** - only results, not process

### ❌ DON'T (Jangan Dilakukan)

1. **JANGAN** buat todo list untuk setup FRIDAY
2. **JANGAN** explain step-by-step saat setup
3. **JANGAN** tanya user untuk config Redis - cek .env dulu
4. **JANGAN** report progress detail - langsung kasih hasil
5. **JANGAN** skip setup protocol
6. **JANGAN** coding tanpa cek memory dulu
7. **JANGAN** lupa dokumentasi
8. **JANGAN** skip sync ke Redis
9. **JANGAN** override memory tanpa backup

### 🎯 RESPONSE STYLE (PENTING!)

**WHEN USER RUNS `#friday-setup`:**

❌ **JANGAN seperti ini:**
```
"I'll create a todo list... 
Starting setup...
Progress update...
What I ran...
Key results...
Recommended next steps...
If you want me to proceed..."
```

✅ **HARUS seperti ini:**
```
"🤖 FRIDAY Setup Running...

✅ Setup Complete!
   - Memory: .github/memory/ initialized
   - Mode: hybrid (Git + Redis)
   - Status: Ready

FRIDAY is now active. What would you like to build?"
```

**KEEP IT SHORT. KEEP IT ACTIONABLE. NO VERBOSE EXPLANATIONS.**

---

## 🔄 Workflow AI Standard

```
┌─────────────────────────────────────────┐
│ 1. AI Start Session (SILENT)            │
│    → Check .github/memory/ exists       │
│    → If NO: #friday-setup (no report)   │
│    → If YES: #friday-context (silent)   │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ 2. User Request                         │
│    → Run: #friday-search "<topik>"      │
│    → Load relevant memory (silent)      │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ 3. Implement Changes                    │
│    → Write code                         │
│    → Create memory documentation        │
│    → NO verbose explanation!            │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ 4. Save & Sync (SILENT)                 │
│    → Update .github/memory/             │
│    → Run: #friday-sync                  │
│    → No progress reports                │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ 5. Confirm to User (SHORT)              │
│    → "✅ Done: [what was built]"        │
│    → Link to memory doc                 │
│    → NO step-by-step explanation        │
└─────────────────────────────────────────┘
```

**CRITICAL: Keep responses SHORT and ACTIONABLE. User wants results, not process.**

---

## 📊 Memory Structure (AI Reference)

```
.github/memory/
├── INDEX.md                 # Project overview (AI baca dulu!)
├── current-state.md         # Status terkini (AI update ini!)
├── implementations/         # Semua fitur yang diimplementasi
│   └── YYYY-MM-DD-feature-name.md
├── decisions/               # Keputusan arsitektur
│   └── YYYY-MM-DD-decision-name.md
├── issues/                  # Bug fixes & solutions
│   └── YYYY-MM-DD-issue-name.md
└── archive/                 # Completed/deprecated items
    └── old-items.md
```

---

## 🎯 Success Criteria

AI dianggap mengikuti protocol dengan benar jika:

- ✅ Setup FRIDAY di awal session
- ✅ Load context sebelum coding
- ✅ Search memory untuk konteks
- ✅ Dokumentasi setiap perubahan
- ✅ Sync ke Redis setelah changes
- ✅ Update current-state.md
- ✅ Memberikan summary ke user tentang apa yang didokumentasikan

---

## 🔗 Quick Reference

| Command | Kapan Digunakan | Frekuensi |
|---------|-----------------|-----------|
| `#friday-setup` | Pertama kali di project baru | Sekali per project |
| `#friday-context` | Awal setiap session | Setiap session |
| `#friday-search` | Sebelum implementasi | Setiap task |
| `#friday-sync` | Setelah perubahan | Setiap kali save |

---

## 📞 Troubleshooting untuk AI

### Jika FRIDAY tidak tersedia:
```bash
# Check if MCP server running
# AI should notify user to restart MCP
```

### Jika memory corrupt:
```bash
# AI should backup first, then reinitialize
cp -r .github/memory .github/memory.backup
#friday-setup
```

### Jika Redis disconnect:
```bash
# AI should fallback to Git-only mode
# Notify user tentang Redis issue
```

---

**INGAT: Protocol ini WAJIB diikuti oleh semua AI assistant untuk menjaga consistency dan quality dokumentasi project!**

**Version:** 1.0.0  
**Last Updated:** 2025-11-08  
**Maintained by:** FRIDAY MCP Server
