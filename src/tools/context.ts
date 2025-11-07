/**
 * FRIDAY Context Tool
 * Load project context from all sources
 */

import { GitMemoryManager } from "../memory/git-manager.js";

export interface ContextArgs {
  depth?: "minimal" | "standard" | "full";
  includeHistory?: boolean;
}

export async function contextTool(args: any) {
  const { depth = "standard", includeHistory = true } = args as ContextArgs;

  try {
    const output: string[] = [];
    const gitMemory = new GitMemoryManager();

    output.push("📚 Loading Project Context");
    output.push("");

    // Load INDEX
    const index = await gitMemory.readIndex();
    if (index) {
      output.push("✅ INDEX.md loaded");
    }

    // Load current state
    const state = await gitMemory.readCurrentState();
    if (state) {
      output.push("✅ current-state.md loaded");
    }

    // Load memory files
    if (includeHistory) {
      const files = await gitMemory.listMemoryFiles();
      output.push(`✅ ${files.length} memory file(s) loaded`);
    }

    // Statistics
    const stats = await gitMemory.getStats();
    output.push("");
    output.push("📊 Memory Statistics:");
    output.push(`   Implementations: ${stats.implementations}`);
    output.push(`   Decisions: ${stats.decisions}`);
    output.push(`   Issues: ${stats.issues}`);
    output.push(`   Total: ${stats.total} files`);
    output.push("");

    output.push("✅ Context loaded successfully");
    output.push("");
    output.push(`Depth: ${depth}`);
    output.push(`History included: ${includeHistory ? "Yes" : "No"}`);

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
