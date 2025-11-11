# Extension Memory Migration Feature

## Overview

FRIDAY can automatically detect, migrate, and take over memory management from other AI extensions.

## Supported Extensions

### 1. **Cursor Memory**

- **Files detected:** `.cursor/memory`, `.cursor/context`, `.cursorrules`
- **Data migrated:** Context files, memory snapshots, configuration

### 2. **Continue**

- **Files detected:** `.continue`, `.continuerc.json`
- **Data migrated:** AI context, conversation history

### 3. **Aider**

- **Files detected:** `.aider`, `.aider.chat.history.md`
- **Data migrated:** Chat history, pair programming sessions

### 4. **Other AI Extensions**

- **Files detected:** `.ai-memory`, `.codeium/context`, `.copilot-context`, `.github/ai-context`
- **Data migrated:** Various AI memory and context files

## How It Works

### Step 1: Detection

When you run `friday-setup`, FRIDAY automatically:

1. Scans your project for known AI extension memory files
2. Identifies the type and size of stored data
3. Reports findings before migration

### Step 2: Migration

FRIDAY then:

1. Reads all data from detected extensions
2. Creates timestamped backup copies in `.github/memory/migrations/`
3. Preserves original content with metadata
4. Maintains full traceability

### Step 3: Takeover

After migration:

1. FRIDAY becomes the primary memory manager
2. All memory functions route through FRIDAY
3. Hybrid memory system (Git + Redis) activated
4. Original extension files can be safely removed

## Migration Output

```
🔍 Step 0: Detecting memory extensions
   ✅ Found 2 extension(s) with memory
      - Cursor Memory (5 files)
      - Continue (3 files)

   📦 Migrated 8 file(s)
   💾 Total data: 145.67 KB

📋 EXTENSION REMOVAL INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FRIDAY has detected and migrated data from the following extensions:

1. Cursor Memory
   Path: /project/.cursor/memory
   Files: 5
   Size: 98.23 KB

2. Continue
   Path: /project/.continue
   Files: 3
   Size: 47.44 KB

🗑️  Safe to Remove:

   # Remove Cursor Memory
   rm -rf .cursor/memory

   # Remove Continue
   rm -rf .continue

✅ After removal:
   - All data has been migrated to .github/memory/migrations/
   - FRIDAY has taken over memory management
   - No data loss will occur
```

## Migration File Format

Each migrated file is stored with full metadata:

```markdown
# Migrated from Cursor Memory

**Source:** `.cursor/memory/context.md`  
**Date:** 2025-11-11T10:30:00.000Z  
**Size:** 24.5 KB

## Original Content
```

[Original file content preserved here]

```

---

This data has been migrated to FRIDAY memory system.
Original file can be safely removed.
```

## Safety Features

### Data Preservation

- ✅ All original content preserved
- ✅ Timestamped backups created
- ✅ Source file path recorded
- ✅ No destructive operations on source files

### Error Handling

- ✅ Graceful handling of permission errors
- ✅ Continues migration even if some files fail
- ✅ Detailed error reporting
- ✅ Rollback capability

### User Control

- ✅ User must manually remove original files
- ✅ Clear instructions provided
- ✅ Verification step included
- ✅ No automatic deletion

## Benefits

### Consolidation

- **Single memory system** for all AI interactions
- **Unified context** across different tools
- **Consistent format** for all memories

### Performance

- **Hybrid storage** (Git + Redis)
- **Fast retrieval** with Redis caching
- **Persistent storage** with Git

### Organization

- **Structured directories** (.github/memory/)
- **Categorized storage** (implementations, decisions, issues)
- **Easy navigation** and search

## Usage

Simply run:

```bash
friday-setup
```

FRIDAY will automatically:

1. Detect all memory extensions
2. Migrate their data
3. Provide removal instructions
4. Take over memory management

No additional configuration needed!

## Technical Details

### File Detection

- Scans for known patterns
- Checks both files and directories
- Filters text-based content only
- Respects .gitignore patterns

### Migration Process

1. **Scan:** Identify extension files
2. **Read:** Extract content safely
3. **Transform:** Add metadata wrapper
4. **Write:** Save to migrations directory
5. **Report:** Generate removal instructions

### Storage Location

All migrated data goes to:

```
.github/memory/migrations/
├── 2025-11-11-cursor-memory-context.md
├── 2025-11-11-cursor-memory-rules.md
├── 2025-11-11-continue-config.json
└── ...
```

## FAQ

**Q: Will my original files be deleted?**  
A: No! FRIDAY only reads and copies data. You must manually remove original files.

**Q: What if migration fails?**  
A: FRIDAY reports errors but continues with other files. No data is lost.

**Q: Can I migrate again?**  
A: Yes! Running setup again will re-detect and re-migrate any found extensions.

**Q: What about custom extensions?**  
A: Currently supports major AI extensions. Custom patterns can be added in future versions.

**Q: Is migration reversible?**  
A: Yes! All original content is preserved in migrations/ directory. You can restore if needed.
