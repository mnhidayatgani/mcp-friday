/**
 * FRIDAY Context Tool
 * Load complete project context from hybrid memory
 */

import { responseCache } from "../cache/response-cache.js";
import { HybridMemoryManager } from "../memory/hybrid-manager.js";
import { ConfigLoader } from "../utils/config-loader.js";

export interface ContextArgs {
  depth?: "minimal" | "standard" | "full";
  includeHistory?: boolean;
}

export async function contextTool(args: any) {
  const { depth = "standard", includeHistory = true } = args as ContextArgs;

  try {
    const output: string[] = [];
    const config = ConfigLoader.load();
    const hybridMemory = new HybridMemoryManager(config);

    output.push("📚 Loading Project Context");
    output.push(`   Depth: ${depth}`);
    output.push(`   History: ${includeHistory ? "Enabled" : "Disabled"}`);
    output.push("");

    // Check if initialized
    const isInit = await hybridMemory.isInitialized();
    if (!isInit) {
      output.push("⚠️  Memory not initialized");
      output.push("   Run #friday-setup first");
      return {
        content: [{ type: "text", text: output.join("\n") }],
      };
    }

    // Load INDEX
    const cacheKey = "friday:index";
    let index = responseCache.get<string>(cacheKey);
    
    if (!index) {
      index = await hybridMemory.readIndex();
      if (index) {
        responseCache.set(cacheKey, index);
      }
    }
    
    if (index) {
      output.push("✅ INDEX.md loaded");
    }

    // Load current state
    const stateCacheKey = "friday:current-state";
    let state = responseCache.get<string>(stateCacheKey);
    
    if (!state) {
      state = await hybridMemory.readCurrentState();
      if (state) {
        responseCache.set(stateCacheKey, state);
      }
    }
    
    if (state) {
      output.push("✅ current-state.md loaded");
      
      // Extract current focus
      const focusMatch = state.match(/## 🎯 Current Focus\n\n(.+?)\n\n/s);
      if (focusMatch) {
        output.push("");
        output.push("Current Focus:");
        output.push(`   ${focusMatch[1].trim()}`);
      }
    }

    // Load memory files
    if (includeHistory) {
      const files = await hybridMemory.listMemoryFiles();
      output.push(`✅ ${files.length} memory file(s) loaded`);
    }

    output.push("");

    // Statistics
    const stats = await hybridMemory.getStats();
    output.push("📊 Memory Statistics:");
    output.push(`   Mode: ${stats.mode}`);
    output.push("");
    output.push("   Git Storage:");
    output.push(`   - Implementations: ${stats.git.implementations}`);
    output.push(`   - Decisions: ${stats.git.decisions}`);
    output.push(`   - Issues: ${stats.git.issues}`);
    output.push(`   - Total: ${stats.git.total} files`);

    if (stats.redis) {
      output.push("");
      output.push("   Redis Cache:");
      output.push(`   - Memory keys: ${stats.redis.memoryKeys}`);
      output.push(`   - Cache keys: ${stats.redis.cacheKeys}`);
      output.push(`   - Total: ${stats.redis.totalKeys} keys`);
    }

    output.push("");
    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("✅ Context Loaded Successfully");
    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("");
    output.push("FRIDAY is ready with full project context.");

    return {
      content: [
        {
          type: "text",
          text: output.join("\n"),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Context loading failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
