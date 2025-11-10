/**
 * Smart Search Strategy Tests
 */

import { SmartSearchStrategy, formatSmartSearchResults } from "../../src/tools/smart-search";
import * as fs from "fs/promises";
import * as path from "path";

// Mock filesystem
jest.mock("fs/promises");

describe("SmartSearchStrategy", () => {
  let strategy: SmartSearchStrategy;
  const mockProjectRoot = "/mock/project";

  beforeEach(() => {
    strategy = new SmartSearchStrategy(mockProjectRoot);
    jest.clearAllMocks();
  });

  describe("search", () => {
    it("should search local files first", async () => {
      // Mock local files
      (fs.readdir as jest.Mock).mockResolvedValue([
        { name: "auth.md", isFile: () => true, isDirectory: () => false },
      ]);
      
      (fs.readFile as jest.Mock).mockResolvedValue(
        "Authentication implementation using JWT tokens for user login"
      );

      const result = await strategy.search("authentication");

      expect(result.searchPath).toContain("local");
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("should include searchPath in results", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      const result = await strategy.search("test query");

      expect(result.searchPath).toBeInstanceOf(Array);
      expect(result.searchPath.length).toBeGreaterThan(0);
    });

    it("should provide recommendations", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      const result = await strategy.search("authentication");

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should search Context7 when local insufficient", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      const result = await strategy.search("authentication");

      expect(result.searchPath).toContain("context7");
    });

    it("should return query in results", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      const query = "user authentication";
      const result = await strategy.search(query);

      expect(result.query).toBe(query);
    });

    it("should return total results count", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      const result = await strategy.search("database");

      expect(result.totalResults).toBeGreaterThanOrEqual(0);
      expect(result.totalResults).toBe(result.results.length);
    });

    it("should handle feature context", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      const result = await strategy.search("auth", "Next.js application");

      expect(result).toBeDefined();
      expect(result.query).toBe("auth");
    });

    it("should find local markdown files", async () => {
      const strategy = new SmartSearchStrategy(mockProjectRoot);
      
      (fs.readdir as jest.Mock).mockResolvedValue([
        { name: "feature.md", isFile: () => true, isDirectory: () => false },
        { name: "README.md", isFile: () => true, isDirectory: () => false },
      ]);
      
      (fs.readFile as jest.Mock).mockResolvedValue(
        "Feature documentation with authentication details"
      );

      const result = await strategy.search("authentication");

      expect(result).toBeDefined();
      expect(result.query).toBe("authentication");
    });

    it("should calculate relevance scores", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([
        { name: "auth.md", isFile: () => true, isDirectory: () => false },
      ]);
      
      (fs.readFile as jest.Mock).mockResolvedValue(
        "Complete authentication system with login and registration"
      );

      const result = await strategy.search("authentication");

      if (result.results.length > 0) {
        expect(result.results[0].relevance).toBeGreaterThan(0);
        expect(result.results[0].relevance).toBeLessThanOrEqual(1);
      }
    });

    it("should include source in results", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      const result = await strategy.search("database");

      result.results.forEach(r => {
        expect(["local", "upstash", "context7"]).toContain(r.source);
      });
    });
  });

  describe("formatSmartSearchResults", () => {
    it("should format results with header", () => {
      const mockResult = {
        query: "test query",
        results: [],
        searchPath: ["local"],
        totalResults: 0,
        recommendations: [],
      };

      const formatted = formatSmartSearchResults(mockResult);

      expect(formatted).toContain("Smart Search Results");
      expect(formatted).toContain("test query");
    });

    it("should display search path", () => {
      const mockResult = {
        query: "test",
        results: [],
        searchPath: ["local", "upstash", "context7"],
        totalResults: 0,
        recommendations: [],
      };

      const formatted = formatSmartSearchResults(mockResult);

      expect(formatted).toContain("local");
      expect(formatted).toContain("upstash");
      expect(formatted).toContain("context7");
    });

    it("should display results with relevance", () => {
      const mockResult = {
        query: "test",
        results: [
          {
            source: "local" as const,
            title: "Test Doc",
            content: "Test content",
            relevance: 0.85,
            path: "test.md",
          },
        ],
        searchPath: ["local"],
        totalResults: 1,
        recommendations: [],
      };

      const formatted = formatSmartSearchResults(mockResult);

      expect(formatted).toContain("Test Doc");
      expect(formatted).toContain("85%");
    });

    it("should display recommendations", () => {
      const mockResult = {
        query: "test",
        results: [],
        searchPath: ["local"],
        totalResults: 0,
        recommendations: ["Review existing patterns", "Check documentation"],
      };

      const formatted = formatSmartSearchResults(mockResult);

      expect(formatted).toContain("Recommendations:");
      expect(formatted).toContain("Review existing patterns");
      expect(formatted).toContain("Check documentation");
    });

    it("should show no results message", () => {
      const mockResult = {
        query: "test",
        results: [],
        searchPath: ["local"],
        totalResults: 0,
        recommendations: [],
      };

      const formatted = formatSmartSearchResults(mockResult);

      expect(formatted).toContain("No results found");
    });

    it("should include source icons", () => {
      const mockResult = {
        query: "test",
        results: [
          {
            source: "local" as const,
            title: "Local Doc",
            content: "Content",
            relevance: 0.9,
          },
          {
            source: "context7" as const,
            title: "Library Doc",
            content: "Library content",
            relevance: 0.7,
          },
        ],
        searchPath: ["local", "context7"],
        totalResults: 2,
        recommendations: [],
      };

      const formatted = formatSmartSearchResults(mockResult);

      expect(formatted).toContain("📂"); // Local icon
      expect(formatted).toContain("🌐"); // Context7 icon
    });

    it("should truncate long content previews", () => {
      const longContent = "a".repeat(500);
      const mockResult = {
        query: "test",
        results: [
          {
            source: "local" as const,
            title: "Long Doc",
            content: longContent,
            relevance: 0.8,
          },
        ],
        searchPath: ["local"],
        totalResults: 1,
        recommendations: [],
      };

      const formatted = formatSmartSearchResults(mockResult);

      expect(formatted.length).toBeLessThan(longContent.length + 500);
    });

    it("should display file paths when available", () => {
      const mockResult = {
        query: "test",
        results: [
          {
            source: "local" as const,
            title: "Test",
            content: "Content",
            relevance: 0.8,
            path: "docs/test.md",
          },
        ],
        searchPath: ["local"],
        totalResults: 1,
        recommendations: [],
      };

      const formatted = formatSmartSearchResults(mockResult);

      expect(formatted).toContain("docs/test.md");
    });

    it("should handle multiple results", () => {
      const mockResult = {
        query: "test",
        results: [
          { source: "local" as const, title: "Doc 1", content: "Content 1", relevance: 0.9 },
          { source: "local" as const, title: "Doc 2", content: "Content 2", relevance: 0.8 },
          { source: "context7" as const, title: "Doc 3", content: "Content 3", relevance: 0.7 },
        ],
        searchPath: ["local", "context7"],
        totalResults: 3,
        recommendations: ["Use Doc 1"],
      };

      const formatted = formatSmartSearchResults(mockResult);

      expect(formatted).toContain("Doc 1");
      expect(formatted).toContain("Doc 2");
      expect(formatted).toContain("Doc 3");
      expect(formatted).toContain("Found 3 Results");
    });

    it("should format with proper separators", () => {
      const mockResult = {
        query: "test",
        results: [],
        searchPath: ["local"],
        totalResults: 0,
        recommendations: [],
      };

      const formatted = formatSmartSearchResults(mockResult);

      expect(formatted).toContain("━━━");
      expect(formatted.split("\n").length).toBeGreaterThan(5);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty query", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      const result = await strategy.search("");

      expect(result).toBeDefined();
      expect(result.query).toBe("");
    });

    it("should handle filesystem errors gracefully", async () => {
      (fs.readdir as jest.Mock).mockRejectedValue(new Error("Permission denied"));
      
      const result = await strategy.search("test");

      expect(result).toBeDefined();
      expect(result.results).toBeInstanceOf(Array);
    });

    it("should handle missing directories", async () => {
      (fs.readdir as jest.Mock).mockRejectedValue({ code: "ENOENT" });
      
      const result = await strategy.search("test");

      expect(result).toBeDefined();
    });

    it("should handle very long queries", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      const longQuery = "authentication ".repeat(100);
      const result = await strategy.search(longQuery);

      expect(result.query).toBe(longQuery);
    });

    it("should handle special characters in query", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      const result = await strategy.search("auth@#$%^&*()");

      expect(result).toBeDefined();
    });

    it("should handle non-markdown files in directory", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([
        { name: "test.txt", isFile: () => true, isDirectory: () => false },
        { name: "test.js", isFile: () => true, isDirectory: () => false },
      ]);
      
      const result = await strategy.search("test");

      expect(result).toBeDefined();
    });

    it("should handle nested directories", async () => {
      (fs.readdir as jest.Mock).mockImplementation((dir) => {
        if (dir.includes("nested")) {
          return Promise.resolve([
            { name: "file.md", isFile: () => true, isDirectory: () => false },
          ]);
        }
        return Promise.resolve([
          { name: "nested", isFile: () => false, isDirectory: () => true },
        ]);
      });
      
      (fs.readFile as jest.Mock).mockResolvedValue("Nested content");

      const result = await strategy.search("test");

      expect(result).toBeDefined();
    });

    it("should handle binary file read errors", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([
        { name: "binary.md", isFile: () => true, isDirectory: () => false },
      ]);
      
      (fs.readFile as jest.Mock).mockRejectedValue(new Error("Binary file"));

      const result = await strategy.search("test");

      expect(result).toBeDefined();
    });
  });

  describe("Performance", () => {
    it("should limit number of results", async () => {
      const manyFiles = Array.from({ length: 100 }, (_, i) => ({
        name: `file${i}.md`,
        isFile: () => true,
        isDirectory: () => false,
      }));
      
      (fs.readdir as jest.Mock).mockResolvedValue(manyFiles);
      (fs.readFile as jest.Mock).mockResolvedValue("Test content with query match");

      const result = await strategy.search("query");

      // Should limit results to reasonable number
      expect(result.results.length).toBeLessThanOrEqual(10);
    });

    it("should handle concurrent searches", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);

      const searches = [
        strategy.search("auth"),
        strategy.search("database"),
        strategy.search("testing"),
      ];

      const results = await Promise.all(searches);

      expect(results).toHaveLength(3);
      results.forEach(r => expect(r).toBeDefined());
    });
  });
});
