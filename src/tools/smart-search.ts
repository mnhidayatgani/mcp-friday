/**
 * Smart Search Strategy
 * Searches local → Upstash → Context7 in order
 */

import { promises as fs } from "fs";
import path from "path";
import { GitMemoryManager } from "../memory/git-manager.js";
import { Context7Client } from "../memory/context7-client.js";
import { ConfigLoader } from "../utils/config-loader.js";

interface SearchResult {
  source: "local" | "upstash" | "context7";
  title: string;
  content: string;
  relevance: number;
  path?: string;
}

interface SmartSearchResult {
  query: string;
  results: SearchResult[];
  searchPath: string[];
  totalResults: number;
  recommendations: string[];
}

export class SmartSearchStrategy {
  private projectRoot: string;
  private gitManager: GitMemoryManager;
  private context7Client: Context7Client;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.gitManager = new GitMemoryManager(projectRoot);
    this.context7Client = new Context7Client();
  }

  /**
   * Smart search: Local → Upstash → Context7
   */
  async search(query: string, featureContext?: string): Promise<SmartSearchResult> {
    const results: SearchResult[] = [];
    const searchPath: string[] = [];
    const recommendations: string[] = [];

    console.log(`🔍 Smart Search: "${query}"`);
    console.log("");

    // STEP 1: Search Local Documents
    console.log("📂 Step 1: Searching local documents...");
    searchPath.push("local");
    
    const localResults = await this.searchLocal(query);
    results.push(...localResults);
    
    console.log(`   Found ${localResults.length} local results`);

    // STEP 2: Check if local results are sufficient
    const sufficientLocal = this.isSufficient(localResults, query);
    
    if (sufficientLocal) {
      console.log("   ✅ Sufficient local documentation found");
      recommendations.push("Use existing local patterns and implementations");
      
      return {
        query,
        results,
        searchPath,
        totalResults: results.length,
        recommendations,
      };
    }

    console.log("   ⚠️  Local docs insufficient, searching Upstash...");
    console.log("");

    // STEP 2: Search Upstash Cache
    console.log("☁️  Step 2: Searching Upstash cache...");
    searchPath.push("upstash");
    
    const upstashResults = await this.searchUpstash(query);
    results.push(...upstashResults);
    
    console.log(`   Found ${upstashResults.length} cached results`);

    const sufficientUpstash = this.isSufficient(results, query);
    
    if (sufficientUpstash) {
      console.log("   ✅ Sufficient documentation found in cache");
      recommendations.push("Review cached implementations from similar projects");
      
      return {
        query,
        results,
        searchPath,
        totalResults: results.length,
        recommendations,
      };
    }

    console.log("   ⚠️  Cache insufficient, searching Context7...");
    console.log("");

    // STEP 3: Search Context7 (External Libraries)
    console.log("🌐 Step 3: Searching Context7 documentation...");
    searchPath.push("context7");
    
    const context7Results = await this.searchContext7(query, featureContext);
    results.push(...context7Results);
    
    console.log(`   Found ${context7Results.length} library docs`);

    // Generate recommendations based on all sources
    recommendations.push(...this.generateRecommendations(results, query));

    return {
      query,
      results,
      searchPath,
      totalResults: results.length,
      recommendations,
    };
  }

  /**
   * Search local documents (.github/memory, README, docs/)
   */
  private async searchLocal(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const searchPaths = [
      path.join(this.projectRoot, ".github", "memory"),
      path.join(this.projectRoot, "docs"),
      this.projectRoot, // For README, CONTRIBUTING, etc.
    ];

    for (const searchPath of searchPaths) {
      try {
        const files = await this.findMarkdownFiles(searchPath);
        
        for (const file of files) {
          const content = await fs.readFile(file, "utf-8");
          const relevance = this.calculateRelevance(content, query);
          
          if (relevance > 0.3) {
            results.push({
              source: "local",
              title: path.basename(file, ".md"),
              content: this.extractRelevantSection(content, query),
              relevance,
              path: path.relative(this.projectRoot, file),
            });
          }
        }
      } catch {
        // Path doesn't exist, continue
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  /**
   * Search Upstash cache
   */
  private async searchUpstash(query: string): Promise<SearchResult[]> {
    // Placeholder for Upstash integration
    // Will be implemented when Upstash client supports search
    return [];
  }

  /**
   * Search Context7 for library documentation
   */
  private async searchContext7(query: string, context?: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    // Search for relevant libraries
    const libraries = await this.context7Client.searchLibraries(query);
    
    for (const lib of libraries.slice(0, 3)) {
      const docs = await this.context7Client.getDocs(lib.id, query);
      
      if (docs) {
        results.push({
          source: "context7" as const,
          title: `${lib.name} Documentation`,
          content: docs.content,
          relevance: docs.relevance,
        });
      }
    }
    
    return results;
  }

  /**
   * Find all markdown files recursively
   */
  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith(".")) {
          const subFiles = await this.findMarkdownFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          files.push(fullPath);
        }
      }
    } catch {
      // Directory doesn't exist
    }
    
    return files;
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(content: string, query: string): number {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/);
    
    let score = 0;
    
    // Exact phrase match
    if (lowerContent.includes(lowerQuery)) {
      score += 0.5;
    }
    
    // Word matches
    const wordMatches = queryWords.filter(word => 
      lowerContent.includes(word)
    ).length;
    
    score += (wordMatches / queryWords.length) * 0.5;
    
    return Math.min(score, 1);
  }

  /**
   * Extract relevant section around query matches
   */
  private extractRelevantSection(content: string, query: string): string {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index === -1) {
      // Return first 500 chars if no exact match
      return content.slice(0, 500) + "...";
    }
    
    // Extract 300 chars before and after match
    const start = Math.max(0, index - 300);
    const end = Math.min(content.length, index + 300);
    
    return "..." + content.slice(start, end) + "...";
  }

  /**
   * Check if results are sufficient
   */
  private isSufficient(results: SearchResult[], query: string): boolean {
    if (results.length === 0) return false;
    
    // Need at least 2 relevant results with good relevance
    const goodResults = results.filter(r => r.relevance > 0.5);
    return goodResults.length >= 2;
  }

  /**
   * Detect libraries mentioned in query
   */
  private detectLibraries(query: string, context?: string): string[] {
    const text = `${query} ${context || ""}`.toLowerCase();
    const libraries: string[] = [];
    
    const commonLibs = [
      "react", "vue", "angular", "next.js", "express",
      "fastify", "nest.js", "prisma", "typeorm", "mongoose",
      "jest", "vitest", "playwright", "cypress",
      "tailwind", "bootstrap", "material-ui",
    ];
    
    for (const lib of commonLibs) {
      if (text.includes(lib)) {
        libraries.push(lib);
      }
    }
    
    return libraries;
  }

  /**
   * Generate recommendations based on search results
   */
  private generateRecommendations(results: SearchResult[], query: string): string[] {
    const recommendations: string[] = [];
    
    const localCount = results.filter(r => r.source === "local").length;
    const upstashCount = results.filter(r => r.source === "upstash").length;
    const context7Count = results.filter(r => r.source === "context7").length;
    
    if (localCount > 0) {
      recommendations.push("Review existing implementations in .github/memory/");
    }
    
    if (upstashCount > 0) {
      recommendations.push("Check cached patterns from previous projects");
    }
    
    if (context7Count > 0) {
      recommendations.push("Consult official library documentation");
    }
    
    if (results.length === 0) {
      recommendations.push("Create new implementation from scratch");
      recommendations.push("Document the approach in .github/memory/");
    }
    
    return recommendations;
  }
}

/**
 * Format search results for display
 */
export function formatSmartSearchResults(result: SmartSearchResult): string {
  const lines: string[] = [];
  
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push(`🔍 Smart Search Results: "${result.query}"`);
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("");
  
  lines.push("📊 Search Path:");
  result.searchPath.forEach((source, i) => {
    const icon = source === "local" ? "📂" : source === "upstash" ? "☁️" : "🌐";
    lines.push(`   ${i + 1}. ${icon} ${source}`);
  });
  lines.push("");
  
  if (result.results.length > 0) {
    lines.push(`📋 Found ${result.totalResults} Results:`);
    lines.push("");
    
    result.results.forEach((r, i) => {
      const sourceIcon = r.source === "local" ? "📂" : r.source === "upstash" ? "☁️" : "🌐";
      lines.push(`${i + 1}. ${sourceIcon} ${r.title} (${(r.relevance * 100).toFixed(0)}% relevance)`);
      if (r.path) {
        lines.push(`   Path: ${r.path}`);
      }
      lines.push(`   Preview: ${r.content.slice(0, 150)}...`);
      lines.push("");
    });
  } else {
    lines.push("❌ No results found");
    lines.push("");
  }
  
  if (result.recommendations.length > 0) {
    lines.push("💡 Recommendations:");
    result.recommendations.forEach(rec => {
      lines.push(`   • ${rec}`);
    });
    lines.push("");
  }
  
  return lines.join("\n");
}
