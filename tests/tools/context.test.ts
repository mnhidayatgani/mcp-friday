/**
 * Context Tool Tests
 */

import { HybridMemoryManager } from "../../src/memory/hybrid-manager";
import { contextTool } from "../../src/tools/context";
import { ConfigLoader } from "../../src/utils/config-loader";

jest.mock("../../src/memory/hybrid-manager");
jest.mock("../../src/utils/config-loader");
jest.mock("../../src/cache/response-cache", () => ({
  responseCache: {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    clear: jest.fn(),
  },
}));

describe("Context Tool", () => {
  let mockHybridMemory: jest.Mocked<HybridMemoryManager>;
  let mockConfig: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      projectRoot: "/test/project",
    };

    (ConfigLoader.load as jest.Mock).mockReturnValue(mockConfig);

    mockHybridMemory = {
      isInitialized: jest.fn(),
      readIndex: jest.fn(),
      readCurrentState: jest.fn(),
      listMemoryFiles: jest.fn(),
      getStats: jest.fn(),
    } as any;

    (HybridMemoryManager as jest.Mock).mockImplementation(() => mockHybridMemory);
  });

  describe("Basic Functionality", () => {
    it("should load project context", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue("# INDEX");
      mockHybridMemory.readCurrentState.mockResolvedValue("## 🎯 Current Focus\n\nImplementing auth\n\n");
      mockHybridMemory.listMemoryFiles.mockResolvedValue([
        { name: "file1.md", path: "implementations/file1.md", type: "implementation" },
        { name: "file2.md", path: "decisions/file2.md", type: "decision" },
      ] as any);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "hybrid",
        git: { implementations: 5, decisions: 3, issues: 2, total: 10 },
        redis: { memoryKeys: 8, cacheKeys: 12, totalKeys: 20 },
      });

      const result = await contextTool({});

      expect(result.content[0].text).toContain("Loading Project Context");
    });

    it("should show depth level", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(false);

      const result = await contextTool({ depth: "full" });

      expect(result.content[0].text).toContain("Depth: full");
    });

    it("should show history setting", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(false);

      const result = await contextTool({ includeHistory: false });

      expect(result.content[0].text).toContain("History: Disabled");
    });
  });

  describe("Not Initialized", () => {
    it("should warn when not initialized", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(false);

      const result = await contextTool({});

      expect(result.content[0].text).toContain("Memory not initialized");
      expect(result.content[0].text).toContain("Run #friday-setup first");
    });

    it("should not load files when not initialized", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(false);

      await contextTool({});

      expect(mockHybridMemory.readIndex).not.toHaveBeenCalled();
    });
  });

  describe("Loading Content", () => {
    it("should load INDEX.md", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue("# Project INDEX");
      mockHybridMemory.readCurrentState.mockResolvedValue(null);
      mockHybridMemory.listMemoryFiles.mockResolvedValue([]);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "git-only",
        git: { implementations: 0, decisions: 0, issues: 0, total: 0 },
      });

      const result = await contextTool({});

      expect(result.content[0].text).toContain("INDEX.md loaded");
    });

    it("should load current-state.md", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue(null);
      mockHybridMemory.readCurrentState.mockResolvedValue("## Current State\n\nWorking on feature X");
      mockHybridMemory.listMemoryFiles.mockResolvedValue([]);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "git-only",
        git: { implementations: 0, decisions: 0, issues: 0, total: 0 },
      });

      const result = await contextTool({});

      expect(result.content[0].text).toContain("current-state.md loaded");
    });

    it("should extract current focus", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue(null);
      mockHybridMemory.readCurrentState.mockResolvedValue(
        "## 🎯 Current Focus\n\nBuilding authentication system\n\n## Other Section"
      );
      mockHybridMemory.listMemoryFiles.mockResolvedValue([]);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "git-only",
        git: { implementations: 0, decisions: 0, issues: 0, total: 0 },
      });

      const result = await contextTool({});

      expect(result.content[0].text).toContain("Current Focus:");
      expect(result.content[0].text).toContain("Building authentication system");
    });

    it("should load memory files when history enabled", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue(null);
      mockHybridMemory.readCurrentState.mockResolvedValue(null);
      mockHybridMemory.listMemoryFiles.mockResolvedValue([
        { name: "impl1.md", path: "implementations/impl1.md", type: "implementation" },
        { name: "impl2.md", path: "implementations/impl2.md", type: "implementation" },
        { name: "decision1.md", path: "decisions/decision1.md", type: "decision" },
      ] as any);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "git-only",
        git: { implementations: 2, decisions: 1, issues: 0, total: 3 },
      });

      const result = await contextTool({ includeHistory: true });

      expect(result.content[0].text).toContain("3 memory file(s) loaded");
    });

    it("should not load memory files when history disabled", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue(null);
      mockHybridMemory.readCurrentState.mockResolvedValue(null);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "git-only",
        git: { implementations: 0, decisions: 0, issues: 0, total: 0 },
      });

      await contextTool({ includeHistory: false });

      expect(mockHybridMemory.listMemoryFiles).not.toHaveBeenCalled();
    });
  });

  describe("Statistics", () => {
    it("should display git statistics", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue(null);
      mockHybridMemory.readCurrentState.mockResolvedValue(null);
      mockHybridMemory.listMemoryFiles.mockResolvedValue([]);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "git-only",
        git: { implementations: 5, decisions: 3, issues: 2, total: 10 },
      });

      const result = await contextTool({});

      const text = result.content[0].text;
      expect(text).toContain("Memory Statistics:");
      expect(text).toContain("Implementations: 5");
      expect(text).toContain("Decisions: 3");
      expect(text).toContain("Issues: 2");
      expect(text).toContain("Total: 10 files");
    });

    it("should display redis statistics when available", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue(null);
      mockHybridMemory.readCurrentState.mockResolvedValue(null);
      mockHybridMemory.listMemoryFiles.mockResolvedValue([]);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "hybrid",
        git: { implementations: 5, decisions: 3, issues: 2, total: 10 },
        redis: { memoryKeys: 8, cacheKeys: 12, totalKeys: 20 },
      });

      const result = await contextTool({});

      const text = result.content[0].text;
      expect(text).toContain("Redis Cache:");
      expect(text).toContain("Memory keys: 8");
      expect(text).toContain("Cache keys: 12");
      expect(text).toContain("Total: 20 keys");
    });

    it("should show mode", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue(null);
      mockHybridMemory.readCurrentState.mockResolvedValue(null);
      mockHybridMemory.listMemoryFiles.mockResolvedValue([]);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "hybrid",
        git: { implementations: 0, decisions: 0, issues: 0, total: 0 },
        redis: { memoryKeys: 0, cacheKeys: 0, totalKeys: 0 },
      });

      const result = await contextTool({});

      expect(result.content[0].text).toContain("Mode: hybrid");
    });
  });

  describe("Success Message", () => {
    it("should show success message", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue(null);
      mockHybridMemory.readCurrentState.mockResolvedValue(null);
      mockHybridMemory.listMemoryFiles.mockResolvedValue([]);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "git-only",
        git: { implementations: 0, decisions: 0, issues: 0, total: 0 },
      });

      const result = await contextTool({});

      expect(result.content[0].text).toContain("Context Loaded Successfully");
      expect(result.content[0].text).toContain("FRIDAY is ready");
    });
  });

  describe("Default Parameters", () => {
    it("should use standard depth by default", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(false);

      const result = await contextTool({});

      expect(result.content[0].text).toContain("Depth: standard");
    });

    it("should include history by default", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(false);

      const result = await contextTool({});

      expect(result.content[0].text).toContain("History: Enabled");
    });
  });

  describe("Error Handling", () => {
    it("should handle initialization errors", async () => {
      mockHybridMemory.isInitialized.mockRejectedValue(new Error("Init error"));

      const result = await contextTool({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Context loading failed");
    });

    it("should handle stats errors", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue(null);
      mockHybridMemory.readCurrentState.mockResolvedValue(null);
      mockHybridMemory.listMemoryFiles.mockResolvedValue([]);
      mockHybridMemory.getStats.mockRejectedValue(new Error("Stats error"));

      const result = await contextTool({});

      expect(result.isError).toBe(true);
    });

    it("should handle config loading errors", async () => {
      (ConfigLoader.load as jest.Mock).mockImplementation(() => {
        throw new Error("Config error");
      });

      const result = await contextTool({});

      expect(result.isError).toBe(true);
    });

    it("should handle non-Error exceptions", async () => {
      mockHybridMemory.isInitialized.mockRejectedValue("String error");

      const result = await contextTool({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("String error");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null INDEX", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue(null);
      mockHybridMemory.readCurrentState.mockResolvedValue(null);
      mockHybridMemory.listMemoryFiles.mockResolvedValue([]);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "git-only",
        git: { implementations: 0, decisions: 0, issues: 0, total: 0 },
      });

      const result = await contextTool({});

      expect(result.content).toBeDefined();
    });

    it("should handle missing current focus", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue(null);
      mockHybridMemory.readCurrentState.mockResolvedValue("## Other Section\n\nContent");
      mockHybridMemory.listMemoryFiles.mockResolvedValue([]);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "git-only",
        git: { implementations: 0, decisions: 0, issues: 0, total: 0 },
      });

      const result = await contextTool({});

      expect(result.content).toBeDefined();
    });

    it("should handle empty memory files", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(true);
      mockHybridMemory.readIndex.mockResolvedValue(null);
      mockHybridMemory.readCurrentState.mockResolvedValue(null);
      mockHybridMemory.listMemoryFiles.mockResolvedValue([]);
      mockHybridMemory.getStats.mockResolvedValue({
        mode: "git-only",
        git: { implementations: 0, decisions: 0, issues: 0, total: 0 },
      });

      const result = await contextTool({ includeHistory: true });

      expect(result.content[0].text).toContain("0 memory file(s) loaded");
    });
  });

  describe("Integration", () => {
    it("should create HybridMemoryManager with config", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(false);

      await contextTool({});

      expect(HybridMemoryManager).toHaveBeenCalledWith(mockConfig);
    });

    it("should load config before running", async () => {
      mockHybridMemory.isInitialized.mockResolvedValue(false);

      await contextTool({});

      expect(ConfigLoader.load).toHaveBeenCalled();
    });
  });
});
