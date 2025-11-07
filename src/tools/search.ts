/**
 * FRIDAY Search Tool
 * Hybrid search across all memory sources
 */

import { GitMemoryManager } from "../memory/git-manager.js";

export interface SearchArgs {
  query: string;
  sources?: string[];
  maxResults?: number;
}

export async function searchTool(args: any) {
  const {
    query,
    sources = ["git", "redis", "context7"],
    maxResults = 10,
  } = args as SearchArgs;

  try {
    const output: string[] = [];
    const results: any[] = [];

    // Search Git memory
    if (sources.includes("git")) {
      const gitMemory = new GitMemoryManager();
      const gitResults = await gitMemory.searchMemory(query);

      for (const result of gitResults.slice(0, maxResults)) {
        results.push({
          source: "git",
          type: result.type,
          path: result.path,
          snippet: result.content.substring(0, 200) + "...",
          modified: result.modified,
        });
      }
    }

    output.push(`🔍 Search Results for: "${query}"`);
    output.push("");
    output.push(`Found ${results.length} result(s)`);
    output.push("");

    for (const result of results) {
      output.push(`📄 [${result.source}] ${result.type}`);
      output.push(`   Path: ${result.path}`);
      output.push(`   Modified: ${result.modified.toISOString()}`);
      output.push(`   ${result.snippet}`);
      output.push("");
    }

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
          text: `❌ Search failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
