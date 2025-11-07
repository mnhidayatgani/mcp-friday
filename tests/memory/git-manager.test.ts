/**
 * Git Memory Manager Tests
 * Testing with precision and reliability
 */

import { GitMemoryManager } from "../../src/memory/git-manager";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

describe("GitMemoryManager", () => {
  let tempDir: string;
  let gitMemory: GitMemoryManager;

  beforeEach(async () => {
    // Create temp directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "friday-test-"));
    gitMemory = new GitMemoryManager(tempDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("initialize()", () => {
    it("should create memory directory structure", async () => {
      await gitMemory.initialize();

      const memoryDir = path.join(tempDir, ".github", "memory");
      const implementationsDir = path.join(memoryDir, "implementations");
      const decisionsDir = path.join(memoryDir, "decisions");
      const issuesDir = path.join(memoryDir, "issues");
      const archiveDir = path.join(memoryDir, "archive");

      expect(await fs.access(memoryDir).then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access(implementationsDir).then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access(decisionsDir).then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access(issuesDir).then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access(archiveDir).then(() => true).catch(() => false)).toBe(true);
    });
  });

  describe("isInitialized()", () => {
    it("should return false when not initialized", async () => {
      const result = await gitMemory.isInitialized();
      expect(result).toBe(false);
    });

    it("should return true when initialized", async () => {
      await gitMemory.initialize();
      const result = await gitMemory.isInitialized();
      expect(result).toBe(true);
    });
  });

  describe("createIndex()", () => {
    it("should create INDEX.md with project info", async () => {
      await gitMemory.initialize();

      const project = {
        name: "test-project",
        type: "web",
        techStack: ["React", "TypeScript"],
        created: new Date(),
        updated: new Date(),
      };

      await gitMemory.createIndex(project);

      const indexPath = path.join(tempDir, ".github", "memory", "INDEX.md");
      const content = await fs.readFile(indexPath, "utf-8");

      expect(content).toContain("test-project");
      expect(content).toContain("web");
      expect(content).toContain("React");
      expect(content).toContain("TypeScript");
    });
  });

  describe("createCurrentState()", () => {
    it("should create current-state.md", async () => {
      await gitMemory.initialize();
      await gitMemory.createCurrentState("test-project", "web");

      const statePath = path.join(tempDir, ".github", "memory", "current-state.md");
      const content = await fs.readFile(statePath, "utf-8");

      expect(content).toContain("test-project");
      expect(content).toContain("web");
      expect(content).toContain("Current Focus");
    });
  });

  describe("createMemoryFile()", () => {
    it("should create implementation file", async () => {
      await gitMemory.initialize();

      const filename = "test-feature.md";
      const content = "# Test Feature\n\nImplementation details...";

      const filePath = await gitMemory.createMemoryFile(
        "implementation",
        filename,
        content
      );

      const savedContent = await fs.readFile(filePath, "utf-8");
      expect(savedContent).toBe(content);
    });

    it("should create decision file", async () => {
      await gitMemory.initialize();

      const filename = "architecture-decision.md";
      const content = "# Architecture Decision\n\nRationale...";

      await gitMemory.createMemoryFile("decision", filename, content);

      const decisionsDir = path.join(tempDir, ".github", "memory", "decisions");
      const files = await fs.readdir(decisionsDir);

      expect(files).toContain(filename);
    });
  });

  describe("listMemoryFiles()", () => {
    it("should list all memory files", async () => {
      await gitMemory.initialize();

      await gitMemory.createMemoryFile("implementation", "feature1.md", "Content 1");
      await gitMemory.createMemoryFile("decision", "decision1.md", "Content 2");
      await gitMemory.createMemoryFile("issue", "bug1.md", "Content 3");

      const files = await gitMemory.listMemoryFiles();

      expect(files).toHaveLength(3);
      expect(files.map(f => f.type)).toContain("implementation");
      expect(files.map(f => f.type)).toContain("decision");
      expect(files.map(f => f.type)).toContain("issue");
    });

    it("should return empty array when no files exist", async () => {
      await gitMemory.initialize();

      const files = await gitMemory.listMemoryFiles();

      expect(files).toHaveLength(0);
    });
  });

  describe("searchMemory()", () => {
    it("should find files matching query", async () => {
      await gitMemory.initialize();

      await gitMemory.createMemoryFile(
        "implementation",
        "auth.md",
        "Authentication feature using JWT tokens"
      );
      await gitMemory.createMemoryFile(
        "implementation",
        "payment.md",
        "Payment integration with Stripe"
      );

      const results = await gitMemory.searchMemory("authentication");

      expect(results).toHaveLength(1);
      expect(results[0].content).toContain("Authentication");
    });

    it("should be case-insensitive", async () => {
      await gitMemory.initialize();

      await gitMemory.createMemoryFile(
        "implementation",
        "test.md",
        "UPPERCASE content"
      );

      const results = await gitMemory.searchMemory("uppercase");

      expect(results).toHaveLength(1);
    });
  });

  describe("getStats()", () => {
    it("should return correct statistics", async () => {
      await gitMemory.initialize();

      await gitMemory.createMemoryFile("implementation", "f1.md", "Content");
      await gitMemory.createMemoryFile("implementation", "f2.md", "Content");
      await gitMemory.createMemoryFile("decision", "d1.md", "Content");
      await gitMemory.createMemoryFile("issue", "i1.md", "Content");

      const stats = await gitMemory.getStats();

      expect(stats.implementations).toBe(2);
      expect(stats.decisions).toBe(1);
      expect(stats.issues).toBe(1);
      expect(stats.total).toBe(4);
    });
  });
});
