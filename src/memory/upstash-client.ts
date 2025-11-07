/**
 * Upstash Redis Memory Client
 * Handles session storage and semantic cache
 */

import { Redis } from "@upstash/redis";

export interface UpstashConfig {
  url: string;
  token: string;
}

export interface SessionContext {
  projectId: string;
  userId?: string;
  lastQuery?: string;
  history: string[];
  timestamp: Date;
}

export class UpstashMemory {
  private redis: Redis;
  private projectId: string;

  constructor(config: UpstashConfig, projectId: string) {
    this.redis = new Redis({
      url: config.url,
      token: config.token,
    });
    this.projectId = projectId;
  }

  /**
   * Store session context
   */
  async storeSession(sessionId: string, context: SessionContext): Promise<void> {
    const key = `friday:session:${sessionId}`;
    await this.redis.setex(
      key,
      86400, // 24 hours TTL
      JSON.stringify(context)
    );
  }

  /**
   * Get session context
   */
  async getSession(sessionId: string): Promise<SessionContext | null> {
    const key = `friday:session:${sessionId}`;
    const data = await this.redis.get<string>(key);

    if (!data) return null;

    return typeof data === "string" ? JSON.parse(data) : data;
  }

  /**
   * Store memory content
   */
  async storeMemory(
    type: string,
    id: string,
    content: string
  ): Promise<void> {
    const key = `friday:${this.projectId}:memory:${type}:${id}`;
    await this.redis.set(key, content);
  }

  /**
   * Get memory content
   */
  async getMemory(type: string, id: string): Promise<string | null> {
    const key = `friday:${this.projectId}:memory:${type}:${id}`;
    return await this.redis.get<string>(key);
  }

  /**
   * List all memory keys for project
   */
  async listMemoryKeys(): Promise<string[]> {
    const pattern = `friday:${this.projectId}:memory:*`;
    const keys = await this.redis.keys(pattern);
    return keys;
  }

  /**
   * Search memory (simple text search)
   */
  async searchMemory(query: string): Promise<Array<{ key: string; content: string }>> {
    const keys = await this.listMemoryKeys();
    const results: Array<{ key: string; content: string }> = [];

    for (const key of keys) {
      const content = await this.redis.get<string>(key);
      if (content && typeof content === "string" && content.toLowerCase().includes(query.toLowerCase())) {
        results.push({ key, content });
      }
    }

    return results;
  }

  /**
   * Store project index
   */
  async storeProjectIndex(index: any): Promise<void> {
    const key = `friday:${this.projectId}:index`;
    await this.redis.set(key, JSON.stringify(index));
  }

  /**
   * Get project index
   */
  async getProjectIndex(): Promise<any | null> {
    const key = `friday:${this.projectId}:index`;
    const data = await this.redis.get<string>(key);

    if (!data) return null;

    return typeof data === "string" ? JSON.parse(data) : data;
  }

  /**
   * Cache query result
   */
  async cacheQuery(query: string, result: any, ttl: number = 3600): Promise<void> {
    const key = `friday:cache:${this.projectId}:${Buffer.from(query).toString("base64")}`;
    await this.redis.setex(key, ttl, JSON.stringify(result));
  }

  /**
   * Get cached query result
   */
  async getCachedQuery(query: string): Promise<any | null> {
    const key = `friday:cache:${this.projectId}:${Buffer.from(query).toString("base64")}`;
    const data = await this.redis.get<string>(key);

    if (!data) return null;

    return typeof data === "string" ? JSON.parse(data) : data;
  }

  /**
   * Sync Git memory to Redis
   */
  async syncFromGit(memoryFiles: Array<{ type: string; id: string; content: string }>): Promise<number> {
    let synced = 0;

    for (const file of memoryFiles) {
      await this.storeMemory(file.type, file.id, file.content);
      synced++;
    }

    return synced;
  }

  /**
   * Health check
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === "PONG";
    } catch {
      return false;
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryKeys: number;
    cacheKeys: number;
  }> {
    const allMemoryKeys = await this.listMemoryKeys();
    const cachePattern = `friday:cache:${this.projectId}:*`;
    const cacheKeys = await this.redis.keys(cachePattern);

    return {
      totalKeys: allMemoryKeys.length + cacheKeys.length,
      memoryKeys: allMemoryKeys.length,
      cacheKeys: cacheKeys.length,
    };
  }
}
