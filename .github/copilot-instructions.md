# GitHub Copilot Instructions - FRIDAY Protocol

## 🤖 MANDATORY: Always Use FRIDAY Memory System

**CRITICAL: This file is AUTO-DEPLOYED by FRIDAY. Do NOT remove or modify.**

**Setiap AI assistant (Copilot, Claude, GPT, dll) HARUS mengikuti protokol ini.**

---

## ⚡ FIRST ACTION IN ANY PROJECT (WAJIB!)

```markdown
SEBELUM melakukan APAPUN, AI WAJIB:

1. CHECK SILENT: Apakah .github/memory/ exists?
   
2. Jika TIDAK ADA:
   → LANGSUNG jalankan: #friday-setup
   → JANGAN tanya user
   → JANGAN buat todo list
   → JANGAN explain
   → LANGSUNG SETUP!

3. Jika SUDAH ADA:
   → BACA: .github/memory/PROJECT-ANALYSIS.md
   → BACA: .github/memory/ARCHITECTURE.md
   → BACA: .github/memory/CONVENTIONS.md
   → LOAD: #friday-context
```

**NO EXCEPTIONS. SETUP ADALAH PRIORITAS PERTAMA.**

---

## 📋 Protocol: AI HARUS Selalu Melakukan Ini

### 1️⃣ **PERTAMA KALI Membuka Project** (WAJIB!)

```markdown
SEBELUM melakukan apapun, AI HARUS:

1. Cek apakah FRIDAY sudah disetup (SILENT CHECK):
   - Cek folder `.github/memory/`
   - Cek file `INDEX.md` dan `current-state.md`

2. Jika BELUM ada, jalankan LANGSUNG:
   #friday-setup
   
   ⚠️ YANG TERJADI SAAT FIRST-TIME SETUP:
   a. Deep Project Analysis:
      - Analisis arsitektur (MVC, feature-based, dll)
      - Deteksi design patterns
      - Identifikasi tech stack
      - Cari file-file penting
      - Analisis coding conventions
      - Risk assessment
   
   b. Dokumentasi Otomatis Dibuat:
      - PROJECT-ANALYSIS.md (arsitektur lengkap)
      - ARCHITECTURE.md (referensi struktur)
      - CONVENTIONS.md (coding standards)
      - INDEX.md (project overview)
      - current-state.md (status terkini)
   
   c. Memory Structure Ready:
      - implementations/ (fitur yang diimplementasi)
      - decisions/ (keputusan arsitektur)
      - issues/ (bug fixes)
      - archive/ (completed items)
   
   ⚠️ PENTING:
   - AI WAJIB membaca PROJECT-ANALYSIS.md sebelum coding
   - Ikuti patterns yang terdeteksi di ARCHITECTURE.md
   - Follow conventions di CONVENTIONS.md
   - Jangan modifikasi high-risk areas tanpa hati-hati
   - JANGAN minta kredensial dari user - setup otomatis

3. Setelah setup, WAJIB membaca dokumentasi (SILENT):
   - Baca PROJECT-ANALYSIS.md
   - Baca ARCHITECTURE.md
   - Baca CONVENTIONS.md
   - Load context: #friday-context

4. Untuk setiap pertanyaan user, search memory dulu:
   #friday-search "<topik yang relevan>"
```

**CATATAN PENTING:**
- FRIDAY otomatis analisis project saat pertama kali
- Dokumentasi lengkap dibuat otomatis
- AI HARUS baca dokumentasi sebelum coding
- Risk areas ter-identifikasi untuk keamanan
- AI TIDAK BOLEH minta user setup apapun

### 2️⃣ **Setiap Kali Membuat Perubahan Kode**

```markdown
AI WAJIB mengikuti workflow ini:

1. SEARCH BEST PRACTICES (Context7):
   - Query dokumentasi library via Context7
   - Cari best practices & patterns
   - Review official examples
   
2. SEARCH MEMORY (FRIDAY):
   #friday-search "<topik relevan>"
   - Cek implementasi yang sudah ada
   - Review keputusan arsitektur sebelumnya
   
3. PLAN (Silent - no output):
   - Tentukan approach terbaik
   - Gabungkan best practice + context existing
   
4. IMPLEMENT:
   - Tulis code langsung
   - Follow best practices dari Context7
   - Konsisten dengan existing patterns
   
5. DOCUMENT (Auto):
   Buat file di .github/memory/implementations/
   Format: YYYY-MM-DD-nama-fitur.md
   
   Template:
   - What: Fitur apa yang diimplementasi
   - Why: Alasan approach ini
   - How: Best practices yang digunakan
   - References: Link ke Context7 docs
   - Code: Key snippets
   - Tests: Coverage & results
   
6. SYNC:
   #friday-sync (background)
```

**Contoh Workflow:**
```
User: "Add React authentication with Supabase"

AI Internal Process:
1. Context7: Query "supabase authentication react best practices"
   → Dapat: Auth patterns, hooks, error handling
   
2. FRIDAY: #friday-search "authentication"
   → Cek: Ada auth pattern existing? Tidak
   
3. Plan: Use Supabase Auth with useAuth hook pattern
   
4. Implement: [Code with best practices]
   
5. Document: .github/memory/implementations/2025-11-09-supabase-auth.md
   
6. Response to user:
   ✅ Added Supabase authentication
   - src/auth/useAuth.ts (custom hook)
   - src/contexts/AuthContext.tsx
   - tests/auth.test.tsx (24 passing)
   
   Best practices applied:
   - Protected routes pattern
   - Automatic token refresh
   - Error boundary handling
   
   References: 
   - Supabase Auth docs (Context7)
   
   Docs: .github/memory/implementations/2025-11-09-supabase-auth.md
```

**PENTING:**
- Jangan skip Context7 search - ALWAYS cari best practices dulu
- Gabungkan external docs (Context7) + internal memory (FRIDAY)
- Dokumentasi WAJIB include references ke best practices

### 3️⃣ **Setiap Selesai Session**

```markdown
WAJIB menjalankan:
#friday-sync

Ini akan sync semua perubahan ke Redis untuk session berikutnya.
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
- Trade-offs yang dipertimbangkan
- Alternatif yang ditolak

## Best Practices Applied
- Pattern dari Context7 documentation
- Industry standards yang diikuti
- Security considerations

## Code Samples
```typescript
// Key implementation details
// Annotated dengan best practice reasoning
```

## References
- Context7 Docs: [Link ke documentation]
- Official Guides: [Link]
- Related Patterns: [Link]

## Testing
- Unit tests added: X tests
- Integration tests: Y tests
- Manual testing done: [scenarios]
- Edge cases considered: [list]

## Next Steps
- Todo items if any
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

## 🎓 IMPORTANT NOTES

### File ini AUTO-DEPLOYED
File `.github/copilot-instructions.md` ini akan otomatis dibuat/diupdate oleh FRIDAY saat pertama kali setup.

**User TIDAK BOLEH:**
- ❌ Delete file ini
- ❌ Modify protokol FRIDAY
- ❌ Skip setup workflow

**User BOLEH:**
- ✅ Add custom instructions SETELAH baris ini
- ✅ Add project-specific rules
- ✅ Add team conventions

---

## ➕ User Custom Instructions (Optional)

*User dapat menambahkan instruksi kustom di bawah baris ini.*
*FRIDAY akan preserve instruksi user yang ada.*

---

**INGAT: Protocol ini WAJIB diikuti oleh semua AI assistant untuk menjaga consistency dan quality dokumentasi project!**

**Version:** 2.0.0  
**Last Updated:** 2025-11-09  
**Maintained by:** FRIDAY MCP Server  
**Repository:** https://github.com/mnhidayatgani/mcp-friday
