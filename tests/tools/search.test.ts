/**
 * Search Tool Tests
 */

import { searchTool } from "../../src/tools/search";
import { HybridMemoryManager } from "../../src/memory/hybrid-manager";
import { ConfigLoader } from "../../src/utils/config-loader";

jest.mock("../../src/memory/hybrid-manager");
jest.mock("../../src/utils/config-loader");

describe("Search Tool", () => {
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
      search: jest.fn(),
      isRedisEnabled: jest.fn(),
    } as any;

    (HybridMemoryManager as jest.Mock).mockImplementation(() => mockHybridMemory);
  });

  describe("Basic Functionality", () => {
    it("should return search results", async () => {
      const mockResults = [
        {
          source: "git" as const,
          type: "implementation",
          path: "auth.md",
          content: "Authentication implementation",
          relevance: 0.95,
        },
      ];

      mockHybridMemory.search.mockResolvedValue(mockResults);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "authentication" });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("authentication");
    });

    it("should display result count", async () => {
      mockHybridMemory.search.mockResolvedValue([
        { source: "git" as const, content: "Test 1", relevance: 0.9 },
        { source: "git" as const, content: "Test 2", relevance: 0.8 },
      ]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(false);

      const result = await searchTool({ query: "test" });

      expect(result.content[0].text).toContain("Found 2 result(s)");
    });

    it("should show search mode", async () => {
      mockHybridMemory.search.mockResolvedValue([]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "test" });

      expect(result.content[0].text).toContain("Hybrid (Git + Redis)");
    });

    it("should show git-only mode when redis disabled", async () => {
      mockHybridMemory.search.mockResolvedValue([]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(false);

      const result = await searchTool({ query: "test" });

      expect(result.content[0].text).toContain("Git-only");
    });
  });

  describe("Result Display", () => {
    it("should display relevance percentage", async () => {
      mockHybridMemory.search.mockResolvedValue([
        { source: "git" as const, content: "Test content", relevance: 0.85 },
      ]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "test" });

      expect(result.content[0].text).toContain("85% match");
    });

    it("should display result type", async () => {
      mockHybridMemory.search.mockResolvedValue([
        { source: "git" as const, type: "decision", content: "Test", relevance: 0.9 },
      ]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "test" });

      expect(result.content[0].text).toContain("Type: decision");
    });

    it("should display file path", async () => {
      mockHybridMemory.search.mockResolvedValue([
        { source: "git" as const, path: "docs/guide.md", content: "Test", relevance: 0.9 },
      ]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "test" });

      expect(result.content[0].text).toContain("Path: docs/guide.md");
    });

    it("should display content snippet", async () => {
      mockHybridMemory.search.mockResolvedValue([
        { source: "git" as const, content: "This is a test content snippet", relevance: 0.9 },
      ]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "test" });

      expect(result.content[0].text).toContain("This is a test content snippet");
    });

    it("should truncate long content", async () => {
      const longContent = "a".repeat(200);
      mockHybridMemory.search.mockResolvedValue([
        { source: "git" as const, content: longContent, relevance: 0.9 },
      ]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "test" });

      const text = result.content[0].text;
      expect(text).not.toContain(longContent);
      expect(text).toContain("...");
    });

    it("should display source uppercase", async () => {
      mockHybridMemory.search.mockResolvedValue([
        { source: "redis" as const, content: "Test", relevance: 0.9 },
      ]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "test" });

      expect(result.content[0].text).toContain("[REDIS]");
    });
  });

  describe("No Results", () => {
    it("should show no results message", async () => {
      mockHybridMemory.search.mockResolvedValue([]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "nonexistent" });

      expect(result.content[0].text).toContain("No matches found");
    });

    it("should provide suggestions when no results", async () => {
      mockHybridMemory.search.mockResolvedValue([]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "xyz" });

      expect(result.content[0].text).toContain("Suggestions:");
      expect(result.content[0].text).toContain("Try different keywords");
    });
  });

  describe("Parameters", () => {
    it("should use default parameters", async () => {
      mockHybridMemory.search.mockResolvedValue([]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      await searchTool({ query: "test" });

      expect(mockHybridMemory.search).toHaveBeenCalledWith("test", 10);
    });

    it("should accept custom maxResults", async () => {
      mockHybridMemory.search.mockResolvedValue([]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      await searchTool({ query: "test", maxResults: 5 });

      expect(mockHybridMemory.search).toHaveBeenCalledWith("test", 5);
    });

    it("should accept sources parameter", async () => {
      mockHybridMemory.search.mockResolvedValue([]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      await searchTool({ query: "test", sources: ["git"] });

      expect(mockHybridMemory.search).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle search errors", async () => {
      mockHybridMemory.search.mockRejectedValue(new Error("Search failed"));

      const result = await searchTool({ query: "test" });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Search failed");
    });

    it("should handle non-Error exceptions", async () => {
      mockHybridMemory.search.mockRejectedValue("String error");

      const result = await searchTool({ query: "test" });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("String error");
    });

    it("should handle config loading errors", async () => {
      (ConfigLoader.load as jest.Mock).mockImplementation(() => {
        throw new Error("Config error");
      });

      const result = await searchTool({ query: "test" });

      expect(result.isError).toBe(true);
    });
  });

  describe("Multiple Results", () => {
    it("should display multiple results", async () => {
      mockHybridMemory.search.mockResolvedValue([
        { source: "git" as const, content: "Result 1", relevance: 0.9 },
        { source: "git" as const, content: "Result 2", relevance: 0.8 },
        { source: "redis" as const, content: "Result 3", relevance: 0.7 },
      ]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "test" });

      const text = result.content[0].text;
      expect(text).toContain("1.");
      expect(text).toContain("2.");
      expect(text).toContain("3.");
    });

    it("should number results sequentially", async () => {
      mockHybridMemory.search.mockResolvedValue([
        { source: "git" as const, content: "A", relevance: 0.9 },
        { source: "git" as const, content: "B", relevance: 0.8 },
      ]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "test" });

      const text = result.content[0].text;
      expect(text).toMatch(/1\./);
      expect(text).toMatch(/2\./);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty query", async () => {
      mockHybridMemory.search.mockResolvedValue([]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "" });

      expect(result.content).toBeDefined();
    });

    it("should handle newlines in content", async () => {
      mockHybridMemory.search.mockResolvedValue([
        { source: "git" as const, content: "Line 1\nLine 2\nLine 3", relevance: 0.9 },
      ]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "test" });

      const text = result.content[0].text;
      // Content is displayed in snippet which replaces newlines with spaces
      expect(text).toContain("Line 1");
    });

    it("should handle special characters in query", async () => {
      mockHybridMemory.search.mockResolvedValue([]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "test@#$%" });

      expect(result.content[0].text).toContain("test@#$%");
    });

    it("should handle undefined optional fields", async () => {
      mockHybridMemory.search.mockResolvedValue([
        { source: "git" as const, content: "Test", relevance: 0.9 },
      ]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      const result = await searchTool({ query: "test" });

      expect(result.content).toBeDefined();
    });
  });

  describe("Integration", () => {
    it("should create HybridMemoryManager with config", async () => {
      mockHybridMemory.search.mockResolvedValue([]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      await searchTool({ query: "test" });

      expect(HybridMemoryManager).toHaveBeenCalledWith(mockConfig);
    });

    it("should load config before searching", async () => {
      mockHybridMemory.search.mockResolvedValue([]);
      mockHybridMemory.isRedisEnabled.mockReturnValue(true);

      await searchTool({ query: "test" });

      expect(ConfigLoader.load).toHaveBeenCalled();
    });
  });
});
