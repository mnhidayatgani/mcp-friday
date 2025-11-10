/**
 * Project Analyzer Tests
 */

import { ProjectAnalyzer } from "../../src/utils/project-analyzer";
import * as fs from "fs/promises";

jest.mock("fs/promises");

describe("ProjectAnalyzer", () => {
  let analyzer: ProjectAnalyzer;
  const mockProjectRoot = "/test/project";

  beforeEach(() => {
    jest.clearAllMocks();
    analyzer = new ProjectAnalyzer(mockProjectRoot);
  });

  describe("Constructor", () => {
    it("should create analyzer with project root", () => {
      expect(analyzer).toBeDefined();
      expect(analyzer).toBeInstanceOf(ProjectAnalyzer);
    });
  });

  describe("analyze", () => {
    beforeEach(() => {
      // Mock basic project structure
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      (fs.readFile as jest.Mock).mockResolvedValue("");
    });

    it("should return complete analysis", async () => {
      const result = await analyzer.analyze();

      expect(result).toHaveProperty("architecture");
      expect(result).toHaveProperty("patterns");
      expect(result).toHaveProperty("tech");
      expect(result).toHaveProperty("files");
      expect(result).toHaveProperty("conventions");
      expect(result).toHaveProperty("risks");
    });

    it("should analyze architecture", async () => {
      const result = await analyzer.analyze();

      expect(result.architecture).toHaveProperty("type");
      expect(result.architecture).toHaveProperty("structure");
      expect(result.architecture).toHaveProperty("layers");
      expect(Array.isArray(result.architecture.layers)).toBe(true);
    });

    it("should analyze patterns", async () => {
      const result = await analyzer.analyze();

      expect(result.patterns).toHaveProperty("design");
      expect(result.patterns).toHaveProperty("architectural");
      expect(result.patterns).toHaveProperty("code");
      expect(Array.isArray(result.patterns.design)).toBe(true);
    });

    it("should analyze tech stack", async () => {
      const result = await analyzer.analyze();

      expect(result.tech).toHaveProperty("languages");
      expect(result.tech).toHaveProperty("frameworks");
      expect(result.tech).toHaveProperty("libraries");
      expect(result.tech).toHaveProperty("tools");
    });

    it("should analyze files", async () => {
      const result = await analyzer.analyze();

      expect(result.files).toHaveProperty("entry");
      expect(result.files).toHaveProperty("config");
      expect(result.files).toHaveProperty("important");
      expect(result.files).toHaveProperty("tests");
    });

    it("should analyze conventions", async () => {
      const result = await analyzer.analyze();

      expect(result.conventions).toHaveProperty("naming");
      expect(result.conventions).toHaveProperty("fileStructure");
      expect(result.conventions).toHaveProperty("imports");
      expect(result.conventions).toHaveProperty("exports");
    });

    it("should analyze risks", async () => {
      const result = await analyzer.analyze();

      expect(result.risks).toHaveProperty("level");
      expect(result.risks).toHaveProperty("areas");
      expect(result.risks).toHaveProperty("warnings");
      expect(["low", "medium", "high"]).toContain(result.risks.level);
    });
  });

  describe("Error Handling", () => {
    it("should handle file access errors", async () => {
      (fs.access as jest.Mock).mockRejectedValue(new Error("Access denied"));
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      (fs.readFile as jest.Mock).mockResolvedValue("");

      const result = await analyzer.analyze();

      expect(result).toBeDefined();
    });

    it("should handle readdir errors", async () => {
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockRejectedValue(new Error("Read error"));
      (fs.readFile as jest.Mock).mockResolvedValue("");

      const result = await analyzer.analyze();

      expect(result).toBeDefined();
    });

    it("should handle readFile errors", async () => {
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      (fs.readFile as jest.Mock).mockRejectedValue(new Error("File error"));

      const result = await analyzer.analyze();

      expect(result).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty project", async () => {
      (fs.access as jest.Mock).mockRejectedValue(new Error("Not found"));
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      (fs.readFile as jest.Mock).mockResolvedValue("");

      const result = await analyzer.analyze();

      expect(result.architecture.type).toBeDefined();
      expect(result.tech.languages).toBeDefined();
    });

    it("should handle missing package.json", async () => {
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      (fs.readFile as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await analyzer.analyze();

      expect(result).toBeDefined();
    });
  });
});
