# FRIDAY Setup - Deep Project Analysis

## 🔬 Intelligent First-Time Setup

### What Happens When You Run `#friday-setup`

```
┌─────────────────────────────────────────────┐
│  User: #friday-setup                        │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │ Check if installed │
         └─────────┬──────────┘
                   │
        ┌──────────▼───────────┐
        │ Already Installed?   │
        └──┬───────────────┬───┘
     NO    │               │ YES
           │               │
           │               └──→ Use existing docs
           │                   Skip analysis
           │
┌──────────▼───────────────────────────────────┐
│ FIRST TIME SETUP - Deep Analysis             │
├──────────────────────────────────────────────┤
│                                              │
│ 1. 🏗️  Analyze Architecture                 │
│    → Structure: MVC, Feature-based, DDD?     │
│    → Layers: Presentation, Business, Data    │
│    → Type: Monolith, Microservices?          │
│                                              │
│ 2. 🎨 Detect Patterns                        │
│    → Design: Factory, Singleton, Observer    │
│    → Architectural: Repository, Service      │
│    → Code: Hooks, Promises, Async/Await      │
│                                              │
│ 3. 💻 Identify Tech Stack                    │
│    → Languages: TypeScript, JavaScript       │
│    → Frameworks: React, Next.js, Express     │
│    → Tools: Jest, ESLint, Prettier           │
│                                              │
│ 4. 📁 Map Important Files                    │
│    → Entry points: index.ts, app.tsx         │
│    → Config: tsconfig.json, .env             │
│    → Tests: __tests__/, *.test.ts            │
│                                              │
│ 5. 📏 Analyze Conventions                    │
│    → Naming: camelCase, PascalCase           │
│    → Structure: Feature-based, Type-based    │
│    → Imports: Relative, Absolute             │
│                                              │
│ 6. ⚠️  Assess Risks                          │
│    → High-risk: auth/, payment/, database/   │
│    → Warnings: Don't modify without care     │
│    → Level: Low, Medium, High                │
│                                              │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│ Create Documentation (Auto)                  │
├──────────────────────────────────────────────┤
│                                              │
│ 📝 PROJECT-ANALYSIS.md                       │
│    - Complete architecture breakdown         │
│    - All patterns detected                   │
│    - Tech stack inventory                    │
│    - Risk assessment                         │
│                                              │
│ 📝 ARCHITECTURE.md                           │
│    - Structure reference                     │
│    - File organization rules                 │
│    - When to create new files                │
│                                              │
│ 📝 CONVENTIONS.md                            │
│    - Naming conventions                      │
│    - Import/export patterns                  │
│    - Code style guide                        │
│                                              │
│ 📝 INDEX.md                                  │
│    - Project overview                        │
│    - Quick reference                         │
│                                              │
│ 📝 current-state.md                          │
│    - Current status                          │
│    - Recent changes                          │
│                                              │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│ AI Must Read (Before Coding)                 │
├──────────────────────────────────────────────┤
│ 1. PROJECT-ANALYSIS.md                       │
│ 2. ARCHITECTURE.md                           │
│ 3. CONVENTIONS.md                            │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│ ✅ Ready for Development                     │
│    - AI understands project                  │
│    - Knows patterns to follow                │
│    - Aware of risks                          │
│    - Follows conventions                     │
└──────────────────────────────────────────────┘
```

---

## 📊 What Gets Analyzed

### 1. Architecture Detection

**Identifies:**
- **Type:** Monolith, Microservices, Serverless
- **Structure:** MVC, Feature-based, Domain-Driven Design
- **Layers:** Presentation, Business Logic, Data Access

**Example Output:**
```
Architecture: Feature-based Monolith
Layers:
  - UI Components
  - Business Logic
  - Data Access
  - Shared Utilities
```

---

### 2. Pattern Recognition

**Detects:**
- **Design Patterns:** Factory, Singleton, Observer, Builder
- **Architectural Patterns:** Repository, Service Layer, Middleware
- **Code Patterns:** Async/Await, Hooks, Promises

**Example Output:**
```
Patterns Found:
  - Repository Pattern (data access)
  - Service Layer (business logic)
  - React Hooks (state management)
  - Async/Await (async operations)
```

---

### 3. Tech Stack Inventory

**Identifies:**
- **Languages:** TypeScript, JavaScript, Python
- **Frameworks:** Next.js, React, Express, NestJS
- **Libraries:** All dependencies from package.json
- **Tools:** Jest, ESLint, Prettier, Webpack

**Example Output:**
```
Tech Stack:
  Languages: TypeScript, JavaScript
  Frameworks: Next.js 14, React 18
  Testing: Jest, React Testing Library
  Tooling: ESLint, Prettier, Husky
```

---

### 4. File Mapping

**Finds:**
- **Entry Points:** index.ts, main.ts, app.tsx
- **Config Files:** tsconfig.json, .env, next.config.js
- **Important Files:** README.md, package.json
- **Test Files:** __tests__/, *.test.ts

**Example Output:**
```
Key Files:
  Entry: src/app/page.tsx
  Config: next.config.js, tsconfig.json
  Tests: __tests__/ (45 test files)
```

---

### 5. Convention Analysis

**Determines:**
- **Naming:** camelCase, PascalCase, snake_case
- **File Structure:** Feature-based, Type-based, Domain-based
- **Imports:** Relative (@/), Absolute (src/)
- **Exports:** Named, Default, Namespace

**Example Output:**
```
Conventions:
  Naming: camelCase for variables, PascalCase for components
  Structure: Feature-based (src/features/)
  Imports: Absolute with @ alias
  Exports: Named exports preferred
```

---

### 6. Risk Assessment

**Identifies:**
- **High-Risk Areas:** auth/, payment/, database/
- **Sensitive Operations:** migrations, billing
- **Critical Files:** .env, database config
- **Warnings:** What to avoid modifying

**Example Output:**
```
⚠️  Risk Level: HIGH

Sensitive Areas:
  - src/auth/ (authentication logic)
  - src/payment/ (payment processing)
  - prisma/migrations/ (database schema)

Warnings:
  - Don't modify auth without thorough testing
  - Payment logic requires extra care
  - Database migrations are critical
```

---

## 📚 Generated Documentation

### PROJECT-ANALYSIS.md

Complete breakdown of the project:

```markdown
# Project Analysis & Documentation

## 🏗️ Architecture
**Type:** Monolith
**Structure:** Feature-based
**Layers:**
- UI Layer (React components)
- Business Layer (services)
- Data Layer (repositories)

## 💻 Tech Stack
**Languages:** TypeScript, JavaScript
**Frameworks:** Next.js 14, React 18
**Tools:** Jest, ESLint, Prettier

## 🎨 Patterns & Conventions
**Design Patterns:**
- Repository Pattern
- Service Layer

**Conventions:**
- Naming: camelCase
- Structure: Feature-based
- Imports: Absolute (@/)

## 📁 Key Files
**Entry Points:**
- src/app/page.tsx

**Configuration:**
- next.config.js
- tsconfig.json

## ⚠️ Risk Assessment
**Risk Level:** MEDIUM

**Sensitive Areas:**
- src/auth/ (authentication)

**Warnings:**
- Test auth changes thoroughly
```

---

### ARCHITECTURE.md

Structure reference for AI:

```markdown
# Project Architecture Reference

**For AI Assistant: READ THIS BEFORE MAKING CHANGES**

## Structure
This project follows **Feature-based** architecture.

**Layers:**
- features (user-facing features)
- shared (reusable components)
- core (business logic)

## File Organization
**Pattern:** feature-based

When adding new features:
- Create new folder in src/features/
- Keep all related files together
- Export public API from index
```

---

### CONVENTIONS.md

Coding standards to follow:

```markdown
# Coding Conventions & Standards

**IMPORTANT: Follow these conventions when writing code**

## Naming Conventions
**Style:** camelCase

Examples:
- Variables: `userName`, `isActive`
- Functions: `getUserData()`, `handleSubmit()`
- Files: `userService.ts`, `authHelper.ts`

## Import/Export Patterns
**Imports:** absolute (@/)
**Exports:** named

## Architectural Patterns
This project uses:
- Repository Pattern
- Service Layer

**Follow these patterns when adding new code!**
```

---

## 🎯 Benefits

### For AI Assistant:

✅ **Understands project BEFORE coding**
- Knows architecture
- Recognizes patterns
- Aware of conventions
- Identifies risks

✅ **Codes safely**
- Follows existing patterns
- Respects conventions
- Avoids high-risk areas
- No breaking changes

✅ **Maintains consistency**
- Same naming style
- Same structure
- Same patterns
- Same approach

---

### For Users:

✅ **Zero setup required**
- No configuration needed
- No credentials to enter
- Just run #friday-setup

✅ **Complete documentation**
- Architecture documented
- Patterns identified
- Conventions recorded
- Risks assessed

✅ **Safe development**
- AI aware of risks
- Warnings for sensitive areas
- No accidental breaks

---

## 🔄 Workflow

### First Time (New Project):

```
1. User: #friday-setup
2. FRIDAY: Analyzes project (2-5 seconds)
3. FRIDAY: Creates documentation
4. FRIDAY: Ready for coding
5. AI: Reads docs (silent)
6. AI: Understands project
7. User: Starts requesting features
8. AI: Codes following patterns
```

### Subsequent Times (Existing Setup):

```
1. User: #friday-setup
2. FRIDAY: Detects existing docs
3. FRIDAY: Skips analysis
4. FRIDAY: Uses existing knowledge
5. AI: Reads docs (silent)
6. User: Starts requesting features
```

---

## ⚡ Performance

**Analysis Time:**
- Small project (<100 files): ~2 seconds
- Medium project (100-500 files): ~5 seconds
- Large project (500+ files): ~10 seconds

**One-time cost** - Analysis only runs on first setup!

---

## 🛡️ Safety Guarantees

### Read-Only Operation:
✅ Only reads files  
✅ Never modifies code  
✅ No destructive actions  
✅ Safe to run anytime

### Risk Identification:
✅ Detects sensitive areas  
✅ Warns about high-risk code  
✅ Prevents accidental damage  
✅ Guides safe modifications

---

## 📖 Example: Real Project

**Project:** E-commerce website (Next.js)

**Analysis Results:**
```
🔬 Deep Project Analysis
   Analyzing architecture, patterns, and conventions...

📊 Analysis Complete:
   Architecture: Feature-based Monolith
   Patterns: 7 detected (Repository, Service Layer, Hooks)
   Tech Stack: Next.js 14, React, PostgreSQL
   Risk Level: HIGH

⚠️  Warnings:
   - Don't modify payment processing without testing
   - Auth logic requires careful handling
   - Database migrations are critical

📝 Created PROJECT-ANALYSIS.md (complete breakdown)
📝 Created ARCHITECTURE.md (structure reference)
📝 Created CONVENTIONS.md (coding standards)

✅ FRIDAY Setup Complete!
   AI now understands your project structure.
```

**What AI Learned:**
- Architecture: Feature-based (src/features/)
- Patterns: Repository + Service Layer
- Naming: camelCase
- High-risk: auth/, payment/, database/
- Entry point: src/app/page.tsx
- Tests: __tests__/ (Jest)

**Result:**
When user asks to add a feature, AI:
1. Follows feature-based structure
2. Uses Repository pattern
3. Uses camelCase naming
4. Avoids modifying payment code
5. Creates tests in __tests__/

**Zero risk of breaking existing code!** ✅

---

## 🚀 Get Started

```bash
# In your project
#friday-setup

# FRIDAY will:
# 1. Analyze your project
# 2. Create documentation
# 3. Be ready to code safely
```

**That's it! No configuration, no setup, just intelligent analysis.** 🧠✨
