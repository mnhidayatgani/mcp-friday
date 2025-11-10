/**
 * Sync Tool Tests
 */

import { syncTool } from "../../src/tools/sync";
import { HybridMemoryManager } from "../../src/memory/hybrid-manager";
import { ConfigLoader } from "../../src/utils/config-loader";

jest.mock("../../src/memory/hybrid-manager");
jest.mock("../../src/utils/config-loader");

describe("Sync Tool", () => {
  let mockHybridMemory: jest.Mocked<HybridMemoryManager>;
  let mockConfig: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      projectRoot: "/test/project",
      upstash: {
        url: "https://test.upstash.io",
        token: "test-token",
      },
    };

    (ConfigLoader.load as jest.Mock).mockReturnValue(mockConfig);

    mockHybridMemory = {
      initialize: jest.fn(),
      getRedisHealth: jest.fn(),
      syncGitToRedis: jest.fn(),
    } as any;

    (HybridMemoryManager as jest.Mock).mockImplementation(() => mockHybridMemory);
  });

  describe("Basic Functionality", () => {
    it("should perform git-to-redis sync", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({
        connected: true,
      });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({
        synced: 5,
        errors: [],
      });

      const result = await syncTool({});

      expect(result.content[0].text).toContain("Sync Operation");
      expect(result.content[0].text).toContain("Synced 5 file(s)");
    });

    it("should show sync direction", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({ synced: 0, errors: [] });

      const result = await syncTool({ direction: "git-to-redis" });

      expect(result.content[0].text).toContain("Direction: git-to-redis");
    });

    it("should show force flag", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({ synced: 0, errors: [] });

      const result = await syncTool({ force: true });

      expect(result.content[0].text).toContain("Force: true");
    });
  });

  describe("Redis Not Configured", () => {
    it("should warn when redis not configured", async () => {
      (ConfigLoader.load as jest.Mock).mockReturnValue({
        projectRoot: "/test/project",
      });

      const result = await syncTool({});

      expect(result.content[0].text).toContain("Upstash Redis not configured");
      expect(result.content[0].text).toContain("console.upstash.com");
    });

    it("should provide setup instructions", async () => {
      (ConfigLoader.load as jest.Mock).mockReturnValue({
        projectRoot: "/test/project",
      });

      const result = await syncTool({});

      expect(result.content[0].text).toContain("UPSTASH_REDIS_REST_URL");
      expect(result.content[0].text).toContain("UPSTASH_REDIS_REST_TOKEN");
    });
  });

  describe("Redis Connection", () => {
    it("should verify redis connection", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({
        connected: true,
      });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({ synced: 0, errors: [] });

      const result = await syncTool({});

      expect(result.content[0].text).toContain("Redis connection verified");
    });

    it("should handle connection failure", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({
        connected: false,
        error: "Connection timeout",
      });

      const result = await syncTool({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Redis connection failed");
      expect(result.content[0].text).toContain("Connection timeout");
    });
  });

  describe("Sync Directions", () => {
    it("should sync git to redis", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({ synced: 3, errors: [] });

      const result = await syncTool({ direction: "git-to-redis" });

      expect(result.content[0].text).toContain("Syncing Git → Redis");
      expect(mockHybridMemory.syncGitToRedis).toHaveBeenCalled();
    });

    it("should warn for redis-to-git direction", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });

      const result = await syncTool({ direction: "redis-to-git" });

      expect(result.content[0].text).toContain("not yet implemented");
    });

    it("should warn for bidirectional sync", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });

      const result = await syncTool({ direction: "bidirectional" });

      expect(result.content[0].text).toContain("not yet implemented");
    });
  });

  describe("Sync Results", () => {
    it("should show synced count", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({
        synced: 10,
        errors: [],
      });

      const result = await syncTool({});

      expect(result.content[0].text).toContain("Synced 10 file(s)");
    });

    it("should show errors if any", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({
        synced: 5,
        errors: ["Error 1", "Error 2"],
      });

      const result = await syncTool({});

      expect(result.content[0].text).toContain("Errors encountered:");
      expect(result.content[0].text).toContain("Error 1");
      expect(result.content[0].text).toContain("Error 2");
    });

    it("should show success message", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({ synced: 5, errors: [] });

      const result = await syncTool({});

      expect(result.content[0].text).toContain("Sync Complete");
    });
  });

  describe("Default Parameters", () => {
    it("should use git-to-redis by default", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({ synced: 0, errors: [] });

      const result = await syncTool({});

      expect(result.content[0].text).toContain("Direction: git-to-redis");
    });

    it("should use force=false by default", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({ synced: 0, errors: [] });

      const result = await syncTool({});

      expect(result.content[0].text).toContain("Force: false");
    });
  });

  describe("Error Handling", () => {
    it("should handle initialization errors", async () => {
      mockHybridMemory.initialize.mockRejectedValue(new Error("Init failed"));

      const result = await syncTool({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Sync failed");
    });

    it("should handle sync errors", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockRejectedValue(new Error("Sync error"));

      const result = await syncTool({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Sync error");
    });

    it("should handle non-Error exceptions", async () => {
      mockHybridMemory.initialize.mockRejectedValue("String error");

      const result = await syncTool({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("String error");
    });

    it("should handle config loading errors", async () => {
      (ConfigLoader.load as jest.Mock).mockImplementation(() => {
        throw new Error("Config error");
      });

      const result = await syncTool({});

      expect(result.isError).toBe(true);
    });
  });

  describe("Integration", () => {
    it("should initialize hybrid memory", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({ synced: 0, errors: [] });

      await syncTool({});

      expect(mockHybridMemory.initialize).toHaveBeenCalled();
    });

    it("should check health before syncing", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({ synced: 0, errors: [] });

      await syncTool({});

      expect(mockHybridMemory.getRedisHealth).toHaveBeenCalled();
    });

    it("should load config", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({ synced: 0, errors: [] });

      await syncTool({});

      expect(ConfigLoader.load).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero synced files", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({ synced: 0, errors: [] });

      const result = await syncTool({});

      expect(result.content[0].text).toContain("Synced 0 file(s)");
    });

    it("should handle empty errors array", async () => {
      mockHybridMemory.initialize.mockResolvedValue(undefined);
      mockHybridMemory.getRedisHealth.mockResolvedValue({ connected: true });
      mockHybridMemory.syncGitToRedis.mockResolvedValue({ synced: 5, errors: [] });

      const result = await syncTool({});

      expect(result.content[0].text).not.toContain("Errors encountered");
    });
  });
});
