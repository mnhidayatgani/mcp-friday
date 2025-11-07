/**
 * Hybrid Memory Manager Tests
 * Comprehensive testing of Git + Redis integration
 */

import { HybridMemoryManager } from "../../src/memory/hybrid-manager";
import { FridayConfig } from "../../src/utils/config-loader";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

describe("HybridMemoryManager", () => {
  let tempDir: string;
  let config: FridayConfig;
  let hybridMemory: HybridMemoryManager;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "friday-hybrid-"));
    config = {
      projectRoot: tempDir,
      memory: {
        capacity: 100,
        lifecycle: {
          staleThreshold: 30,
          archiveThreshold: 90,
          cleanupThreshold: 180,
        },
      },
    };
    hybridMemory = new HybridMemoryManager(config);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("Git-only mode", () => {
    it("should initialize without Redis", async () => {
      await hybridMemory.initialize();
      const isInit = await hybridMemory.isInitialized();
      expect(isInit).toBe(true);
    });

    it("should not have Redis enabled", () => {
      expect(hybridMemory.isRedisEnabled()).toBe(false);
    });

    it("should create project index", async () => {
      await hybridMemory.initialize();
      await hybridMemory.createIndex({
        name: "test-project",
        type: "web",
        techStack: ["React"],
        created: new Date(),
        updated: new Date(),
      });

      const index = await hybridMemory.readIndex();
      expect(index).toContain("test-project");
    });

    it("should create memory files", async () => {
      await hybridMemory.initialize();
      const filePath = await hybridMemory.createMemoryFile(
        "implementation",
        "test-feature.md",
        "# Test Feature"
      );

      expect(filePath).toContain("test-feature.md");
    });

    it("should search memory", async () => {
      await hybridMemory.initialize();
      await hybridMemory.createMemoryFile(
        "implementation",
        "auth.md",
        "Authentication feature"
      );

      const results = await hybridMemory.search("authentication");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].source).toBe("git");
    });

    it("should get statistics", async () => {
      await hybridMemory.initialize();
      await hybridMemory.createMemoryFile("implementation", "f1.md", "Content");
      await hybridMemory.createMemoryFile("decision", "d1.md", "Content");

      const stats = await hybridMemory.getStats();
      expect(stats.mode).toBe("git-only");
      expect(stats.git.implementations).toBe(1);
      expect(stats.git.decisions).toBe(1);
    });
  });

  describe("Relevance scoring", () => {
    it("should rank matches by relevance", async () => {
      await hybridMemory.initialize();
      await hybridMemory.createMemoryFile(
        "implementation",
        "exact.md",
        "# authentication\nThis is about authentication and authentication system"
      );
      await hybridMemory.createMemoryFile(
        "implementation",
        "partial.md",
        "This mentions authentication briefly"
      );

      const results = await hybridMemory.search("authentication");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].source).toBe("git");
      expect(results[0].relevance).toBeGreaterThan(0);
    });
  });

  describe("File operations", () => {
    it("should list all memory files", async () => {
      await hybridMemory.initialize();
      await hybridMemory.createMemoryFile("implementation", "f1.md", "C1");
      await hybridMemory.createMemoryFile("decision", "d1.md", "C2");
      await hybridMemory.createMemoryFile("issue", "i1.md", "C3");

      const files = await hybridMemory.listMemoryFiles();
      expect(files).toHaveLength(3);
    });

    it("should update current state", async () => {
      await hybridMemory.initialize();
      await hybridMemory.createCurrentState("test", "web");
      
      await hybridMemory.updateCurrentState({
        focus: "New focus area",
      });

      const state = await hybridMemory.readCurrentState();
      expect(state).toContain("New focus area");
    });
  });

  describe("Redis health (without Redis)", () => {
    it("should report Redis as not connected", async () => {
      const health = await hybridMemory.getRedisHealth();
      expect(health.connected).toBe(false);
      expect(health.error).toBeDefined();
    });
  });
});
