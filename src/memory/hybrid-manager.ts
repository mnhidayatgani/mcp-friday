/**
 * Hybrid Memory Manager
 * Intelligent combination of Git + Upstash Redis
 */

import { GitMemoryManager, MemoryFile, ProjectIndex } from "./git-manager.js";
import { UpstashMemory } from "./upstash-client.js";
import { FridayConfig } from "../utils/config-loader.js";

export interface HybridSearchResult {
  source: "git" | "redis";
  content: string;
  path?: string;
  type?: string;
  relevance: number;
}

export class HybridMemoryManager {
  private git: GitMemoryManager;
  private redis?: UpstashMemory;
  private config: FridayConfig;
  private projectId: string;

  constructor(config: FridayConfig) {
    this.config = config;
    this.git = new GitMemoryManager(config.projectRoot);
    this.projectId = this.generateProjectId(config.projectRoot);

    // Initialize Redis if configured
    if (config.upstash) {
      this.redis = new UpstashMemory(
        {
          url: config.upstash.url,
          token: config.upstash.token,
        },
        this.projectId
      );
    }
  }

  /**
   * Initialize hybrid memory
   */
  async initialize(): Promise<void> {
    // Initialize Git memory
    await this.git.initialize();

    // Test Redis connection if configured
    if (this.redis) {
      const connected = await this.redis.ping();
      if (!connected) {
        console.warn("⚠️  Redis connection failed. Using Git-only memory.");
        this.redis = undefined;
      }
    }
  }

  /**
   * Check if initialized
   */
  async isInitialized(): Promise<boolean> {
    return await this.git.isInitialized();
  }

  /**
   * Create project index
   */
  async createIndex(project: ProjectIndex): Promise<void> {
    // Create in Git
    await this.git.createIndex(project);

    // Sync to Redis if available
    if (this.redis) {
      await this.redis.storeProjectIndex(project as unknown as Record<string, unknown>);
    }
  }

  /**
   * Create current state
   */
  async createCurrentState(projectName: string, projectType: string): Promise<void> {
    await this.git.createCurrentState(projectName, projectType);
  }

  /**
   * Create memory file (with auto-sync to Redis)
   */
  async createMemoryFile(
    type: "implementation" | "decision" | "issue",
    filename: string,
    content: string
  ): Promise<string> {
    // Create in Git
    const filePath = await this.git.createMemoryFile(type, filename, content);

    // Sync to Redis if available
    if (this.redis) {
      const id = filename.replace(/\.md$/, "");
      await this.redis.storeMemory(type, id, content);
    }

    return filePath;
  }

  /**
   * Hybrid search (Git + Redis)
   */
  async search(query: string, maxResults: number = 10): Promise<HybridSearchResult[]> {
    const results: HybridSearchResult[] = [];

    // Search Git
    const gitResults = await this.git.searchMemory(query);
    for (const result of gitResults) {
      results.push({
        source: "git",
        content: result.content,
        path: result.path,
        type: result.type,
        relevance: this.calculateRelevance(query, result.content),
      });
    }

    // Search Redis if available
    if (this.redis) {
      const redisResults = await this.redis.searchMemory(query);
      for (const result of redisResults) {
        results.push({
          source: "redis",
          content: result.content,
          path: result.key,
          relevance: this.calculateRelevance(query, result.content),
        });
      }
    }

    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);
  }

  /**
   * Sync Git to Redis
   */
  async syncGitToRedis(): Promise<{ synced: number; errors: string[] }> {
    if (!this.redis) {
      return { synced: 0, errors: ["Redis not configured"] };
    }

    const files = await this.git.listMemoryFiles();
    const errors: string[] = [];
    let synced = 0;

    for (const file of files) {
      try {
        const id = file.path.split("/").pop()?.replace(/\.md$/, "") || "";
        await this.redis.storeMemory(file.type, id, file.content);
        synced++;
      } catch (error) {
        errors.push(`Failed to sync ${file.path}: ${String(error)}`);
      }
    }

    // Sync index
    try {
      const index = await this.git.readIndex();
      if (index) {
        await this.redis.storeProjectIndex({ index });
      }
    } catch (error) {
      errors.push(`Failed to sync index: ${String(error)}`);
    }

    return { synced, errors };
  }

  /**
   * Get memory statistics (hybrid)
   */
  async getStats(): Promise<{
    git: { implementations: number; decisions: number; issues: number; total: number };
    redis?: { totalKeys: number; memoryKeys: number; cacheKeys: number };
    mode: "hybrid" | "git-only";
  }> {
    const gitStats = await this.git.getStats();

    const stats = {
      git: gitStats,
      mode: this.redis ? "hybrid" as const : "git-only" as const,
      redis: undefined as { totalKeys: number; memoryKeys: number; cacheKeys: number; } | undefined,
    };

    if (this.redis) {
      stats.redis = await this.redis.getStats();
    }

    return stats;
  }

  /**
   * Read index (Git with Redis fallback)
   */
  async readIndex(): Promise<string | null> {
    // Try Git first
    const gitIndex = await this.git.readIndex();
    if (gitIndex) return gitIndex;

    // Fallback to Redis
    if (this.redis) {
      const redisIndex = await this.redis.getProjectIndex() as { index?: string } | null;
      if (redisIndex?.index) return redisIndex.index;
    }

    return null;
  }

  /**
   * Read current state
   */
  async readCurrentState(): Promise<string | null> {
    return await this.git.readCurrentState();
  }

  /**
   * List all memory files
   */
  async listMemoryFiles(): Promise<MemoryFile[]> {
    return await this.git.listMemoryFiles();
  }

  /**
   * Update current state
   */
  async updateCurrentState(updates: {
    focus?: string;
    accomplishments?: string[];
    issues?: string[];
    nextSteps?: string[];
  }): Promise<void> {
    await this.git.updateCurrentState(updates);
  }

  /**
   * Check if Redis is available
   */
  isRedisEnabled(): boolean {
    return !!this.redis;
  }

  /**
   * Get Redis health
   */
  async getRedisHealth(): Promise<{ connected: boolean; error?: string }> {
    if (!this.redis) {
      return { connected: false, error: "Redis not configured" };
    }

    try {
      const connected = await this.redis.ping();
      return { connected };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Calculate relevance score (simple TF-IDF like)
   */
  private calculateRelevance(query: string, content: string): number {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();

    // Count occurrences
    const matches = contentLower.split(queryLower).length - 1;

    // Boost for title matches
    const titleBoost = contentLower.startsWith(`# ${queryLower}`) ? 2 : 1;

    // Length penalty (prefer shorter, focused content)
    const lengthPenalty = Math.max(0.5, 1 - content.length / 10000);

    return matches * titleBoost * lengthPenalty;
  }

  /**
   * Generate project ID from path
   */
  private generateProjectId(projectRoot: string): string {
    return Buffer.from(projectRoot).toString("base64").substring(0, 16);
  }
}
