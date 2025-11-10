# Context7 Integration Guide

## Overview

FRIDAY integrates with Context7 to provide real-time library documentation during smart search.

## Current Implementation

### Built-in Context7 Client

**File:** `src/memory/context7-client.ts`

**Features:**
- Library ID resolution (e.g., "react" → "/facebook/react")
- Topic-based library search
- Common library mapping (30+ libraries)
- Documentation placeholders

**Supported Libraries:**
- React, Next.js, Vue, Angular
- Express, Fastify, Nest.js
- Prisma, Mongoose, TypeORM
- Jest, Vitest, Playwright
- Tailwind CSS, Bootstrap
- Passport, NextAuth.js
- Socket.IO, Redis, PostgreSQL
- And more...

## Usage

### In Smart Search

```typescript
// Automatically called during smart search
#friday-smart-search "authentication"

// Context7 finds:
// - Passport.js
// - NextAuth.js
// - Returns documentation snippets
```

### Example Output

```
🌐 Step 3: Searching Context7 documentation...
   Found 2 library docs

1. 🌐 Passport Documentation (60% relevance)
   Library: Passport
   Preview: Authentication middleware for Node.js...

2. 🌐 NextAuth.js Documentation (60% relevance)
   Library: NextAuth.js  
   Preview: Authentication for Next.js applications...
```

## Advanced: Full MCP Integration

For complete Context7 functionality, integrate with Upstash MCP server:

### 1. Install Upstash MCP

```json
{
  "mcpServers": {
    "upstash-conte": {
      "command": "npx",
      "args": ["-y", "@upstash/conte-mcp"]
    }
  }
}
```

### 2. Available Tools

**resolve-library-id:**
```typescript
{
  "libraryName": "next.js"
}
// Returns: "/vercel/next.js"
```

**get-library-docs:**
```typescript
{
  "context7CompatibleLibraryID": "/vercel/next.js",
  "topic": "routing",
  "tokens": 5000
}
// Returns: Real-time Next.js routing documentation
```

### 3. Future Enhancement

Replace placeholder with MCP client calls:

```typescript
// Current (placeholder)
const docs = await this.context7Client.getDocs(lib.id, query);

// Future (full MCP)
const docs = await mcpClient.call("upstash-conte", "get-library-docs", {
  context7CompatibleLibraryID: lib.id,
  topic: query,
  tokens: 5000
});
```

## Library Detection

### Auto-detection

Context7 client automatically detects libraries from query:

```
"Add authentication" → Passport, NextAuth.js
"Setup database" → Prisma, Mongoose
"Write tests" → Jest, Vitest
"Real-time chat" → Socket.IO
"Style components" → Tailwind CSS
```

### Manual Specification

```typescript
#friday-smart-search "user sessions" --context "Next.js app"
// Prioritizes Next.js related libraries
```

## Configuration

### Add Custom Libraries

Edit `src/memory/context7-client.ts`:

```typescript
const knownLibraries = {
  "your-lib": {
    id: "/org/your-lib",
    name: "Your Library",
    description: "Description",
    trustScore: 9
  }
};
```

### Topic Mapping

Add custom topic detection:

```typescript
if (topicLower.includes("your-topic")) {
  libraries.push({
    id: "/org/library",
    name: "Library Name",
    description: "For your-topic",
    trustScore: 9
  });
}
```

## Benefits

### 1. Smart Recommendations
- Suggests appropriate libraries
- Based on project context
- Trust score prioritization

### 2. Fast Integration
- No manual documentation lookup
- Instant library guidance
- Best practice patterns

### 3. Always Up-to-date
- Real-time documentation (with MCP)
- Latest API references
- Version-specific guides

## Limitations (Current)

1. **Placeholder docs** - Returns links, not full content
2. **Static library list** - Pre-defined 30+ libraries
3. **No version detection** - Doesn't check project dependencies

## Upgrade Path

### Phase 1 (Current) ✅
- Static library mapping
- Topic-based detection
- Placeholder documentation

### Phase 2 (Next)
- MCP client integration
- Real-time doc fetching
- Dynamic library resolution

### Phase 3 (Future)
- Version-aware docs
- Project dependency analysis
- Code snippet extraction

## Example Workflows

### Workflow 1: Authentication

```
User: "Add user authentication"

FRIDAY Smart Search:
1. 📂 Local: No auth docs found
2. ☁️  Upstash: No cache
3. 🌐 Context7: Found Passport + NextAuth.js
   
Result: Suggests authentication libraries with docs
```

### Workflow 2: Database

```
User: "Setup PostgreSQL with ORM"

FRIDAY Smart Search:
1. 📂 Local: Found database-setup.md
2. 🌐 Context7: Found Prisma + TypeORM
   
Result: Local pattern + library docs combined
```

### Workflow 3: Testing

```
User: "Write unit tests"

FRIDAY Smart Search:
1. 📂 Local: Found test-patterns.md (Jest)
2. ✅ Sufficient local docs
3. No Context7 search needed
   
Result: Uses existing project patterns
```

## Troubleshooting

### Library Not Found

**Problem:** Context7 doesn't recognize library

**Solution:**
1. Add to `knownLibraries` map
2. Or use full MCP integration
3. Or specify manually in query

### Wrong Library Suggested

**Problem:** Context7 suggests incorrect library

**Solution:**
1. Add more context to query
2. Use `--context` parameter
3. Review topic detection logic

### No Documentation Returned

**Problem:** Context7 returns empty results

**Solution:**
1. Check library ID format
2. Verify topic keywords
3. Try broader search terms

## API Reference

### Context7Client Methods

```typescript
class Context7Client {
  // Resolve library name to ID
  async resolveLibrary(name: string): Promise<Context7Library | null>
  
  // Get library documentation
  async getDocs(id: string, topic?: string): Promise<Context7Docs | null>
  
  // Search libraries by topic
  async searchLibraries(topic: string): Promise<Context7Library[]>
}
```

### Types

```typescript
interface Context7Library {
  id: string;          // "/org/repo"
  name: string;        // "Library Name"
  description: string; // Description
  trustScore: number;  // 1-10
}

interface Context7Docs {
  content: string;     // Documentation text
  library: string;     // Library name
  relevance: number;   // 0-1 score
}
```

## Related

- [Smart Search Strategy](./SMART_SEARCH_STRATEGY.md)
- [Upstash Integration](./UPSTASH_INTEGRATION.md)
- [MCP Tools](./MCP_TOOLS.md)

---

**Ready for production** with placeholder docs.  
**Upgrade to full MCP** for real-time documentation.
