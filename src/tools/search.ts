/**
 * FRIDAY Search Tool
 * Hybrid search across Git + Redis with intelligent ranking
 */

import { HybridMemoryManager } from "../memory/hybrid-manager.js";
import { ConfigLoader } from "../utils/config-loader.js";

export interface SearchArgs {
  query: string;
  sources?: string[];
  maxResults?: number;
}

export async function searchTool(args: any) {
  const {
    query,
    sources = ["git", "redis"],
    maxResults = 10,
  } = args as SearchArgs;

  try {
    const config = ConfigLoader.load();
    const hybridMemory = new HybridMemoryManager(config);

    const results = await hybridMemory.search(query, maxResults);

    const output: string[] = [];
    output.push(`🔍 Search Results for: "${query}"`);
    output.push("");
    output.push(`Found ${results.length} result(s)`);
    output.push(`Mode: ${hybridMemory.isRedisEnabled() ? "Hybrid (Git + Redis)" : "Git-only"}`);
    output.push("");

    if (results.length === 0) {
      output.push("No matches found.");
      output.push("");
      output.push("Suggestions:");
      output.push("- Try different keywords");
      output.push("- Check spelling");
      output.push("- Use broader search terms");
    } else {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const relevance = Math.round(result.relevance * 100);

        output.push(`${i + 1}. [${result.source.toUpperCase()}] ${relevance}% match`);
        if (result.type) {
          output.push(`   Type: ${result.type}`);
        }
        if (result.path) {
          output.push(`   Path: ${result.path}`);
        }
        const snippet = result.content.substring(0, 150).replace(/\n/g, " ");
        output.push(`   ${snippet}...`);
        output.push("");
      }
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
