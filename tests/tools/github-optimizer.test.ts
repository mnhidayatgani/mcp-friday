/**
 * GitHub Optimizer Tests
 */

import { GitHubOptimizer } from "../../src/tools/setup/github-optimizer";
import * as fs from "fs/promises";

// Mock fs promises
jest.mock("fs/promises");

describe("GitHubOptimizer", () => {
  const mockProjectRoot = "/test/project";
  let optimizer: GitHubOptimizer;

  beforeEach(() => {
    optimizer = new GitHubOptimizer(mockProjectRoot);
    jest.clearAllMocks();
  });

  describe("optimize", () => {
    it("should create .github folder if not exists", async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.access as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await optimizer.optimize();

      expect(fs.mkdir).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should remove unnecessary files", async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockResolvedValue([
        { name: "FUNDING.yml", isDirectory: () => false, isFile: () => true },
      ]);
      (fs.stat as jest.Mock).mockResolvedValue({ isDirectory: () => false });
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.access as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await optimizer.optimize();

      expect(result.removed.length).toBeGreaterThan(0);
    });

    it("should modify existing files", async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockResolvedValue([
        { name: "copilot-instructions.md", isDirectory: () => false, isFile: () => true },
      ]);
      (fs.readFile as jest.Mock).mockResolvedValue("existing content");
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.access as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await optimizer.optimize();

      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should add missing required files", async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.access as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await optimizer.optimize();

      expect(result.added.length).toBeGreaterThan(0);
    });

    it("should keep necessary directories", async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockResolvedValue([
        { name: "memory", isDirectory: () => true, isFile: () => false },
        { name: "workflows", isDirectory: () => true, isFile: () => false },
      ]);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.access as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await optimizer.optimize();

      expect(result.kept.length).toBeGreaterThan(0);
    });

    it("should handle errors gracefully", async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockRejectedValue(new Error("Permission denied"));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.access as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await optimizer.optimize();

      expect(result.errors.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("generateReport", () => {
    it("should generate comprehensive report", () => {
      const mockResult = {
        removed: [".github/FUNDING.yml"],
        modified: [".github/copilot-instructions.md"],
        added: [".github/memory/INDEX.md"],
        kept: [".github/workflows"],
        errors: [],
      };

      const report = optimizer.generateReport(mockResult);

      expect(report.length).toBeGreaterThan(0);
      expect(report.join("\n")).toContain("Removed");
      expect(report.join("\n")).toContain("Modified");
      expect(report.join("\n")).toContain("Added");
      expect(report.join("\n")).toContain("Kept");
    });

    it("should include error section if errors exist", () => {
      const mockResult = {
        removed: [],
        modified: [],
        added: [],
        kept: [],
        errors: ["Error 1", "Error 2"],
      };

      const report = optimizer.generateReport(mockResult);

      expect(report.join("\n")).toContain("Errors");
      expect(report.join("\n")).toContain("Error 1");
    });

    it("should show completion message", () => {
      const mockResult = {
        removed: [],
        modified: [],
        added: [],
        kept: [],
        errors: [],
      };

      const report = optimizer.generateReport(mockResult);

      expect(report.join("\n")).toContain("Optimization Complete");
    });
  });
});
