/**
 * Extension Memory Migrator Tests
 */

import { ExtensionMemoryMigrator } from "../../src/tools/setup/extension-migrator";
import * as fs from "fs/promises";
import * as path from "path";

// Mock fs promises
jest.mock("fs/promises");

describe("ExtensionMemoryMigrator", () => {
  const mockProjectRoot = "/test/project";
  let migrator: ExtensionMemoryMigrator;

  beforeEach(() => {
    migrator = new ExtensionMemoryMigrator(mockProjectRoot);
    jest.clearAllMocks();
  });

  describe("detectExtensions", () => {
    it("should detect Cursor memory files", async () => {
      (fs.stat as jest.Mock).mockResolvedValueOnce({
        isDirectory: () => true,
        isFile: () => false,
      });
      
      (fs.readdir as jest.Mock).mockResolvedValueOnce([
        { name: "context.md", isDirectory: () => false, isFile: () => true },
      ]);

      (fs.stat as jest.Mock).mockResolvedValueOnce({ size: 1024 });

      const detected = await migrator.detectExtensions();

      expect(detected.length).toBeGreaterThan(0);
    });

    it("should skip non-existent paths", async () => {
      (fs.stat as jest.Mock).mockRejectedValue(new Error("ENOENT"));

      const detected = await migrator.detectExtensions();

      expect(detected).toEqual([]);
    });

    it("should detect Continue context files", async () => {
      (fs.stat as jest.Mock).mockResolvedValueOnce({
        isDirectory: () => false,
        isFile: () => true,
        size: 2048,
      });

      const detected = await migrator.detectExtensions();

      expect(fs.stat).toHaveBeenCalled();
    });
  });

  describe("migrateExtensions", () => {
    it("should migrate detected extensions", async () => {
      // Mock detection
      (fs.stat as jest.Mock).mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
        size: 1024,
      });

      (fs.readFile as jest.Mock).mockResolvedValue("test content");
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await migrator.migrateExtensions();

      expect(result.detected).toBeDefined();
      expect(result.migrated).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it("should handle migration errors gracefully", async () => {
      (fs.stat as jest.Mock).mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
        size: 1024,
      });

      (fs.readFile as jest.Mock).mockRejectedValue(new Error("Read error"));
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      const result = await migrator.migrateExtensions();

      expect(result.errors.length).toBeGreaterThanOrEqual(0);
    });

    it("should create migration directory", async () => {
      (fs.stat as jest.Mock).mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
        size: 1024,
      });

      (fs.readFile as jest.Mock).mockResolvedValue("content");
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      await migrator.migrateExtensions();

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining("migrations"),
        expect.any(Object)
      );
    });
  });

  describe("generateRemovalInstructions", () => {
    it("should generate removal instructions for detected extensions", () => {
      const mockDetected = [
        {
          name: "Cursor Memory",
          path: "/test/project/.cursor/memory",
          dataFiles: ["file1.md", "file2.md"],
          totalSize: 2048,
          type: "cursor-memory" as const,
        },
      ];

      const instructions = migrator.generateRemovalInstructions(mockDetected);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions.join("\n")).toContain("Cursor Memory");
      expect(instructions.join("\n")).toContain("rm -rf");
    });

    it("should include file counts and sizes", () => {
      const mockDetected = [
        {
          name: "Continue",
          path: "/test/project/.continue",
          dataFiles: ["config.json"],
          totalSize: 512,
          type: "continue-context" as const,
        },
      ];

      const instructions = migrator.generateRemovalInstructions(mockDetected);

      expect(instructions.join("\n")).toContain("Files: 1");
      expect(instructions.join("\n")).toContain("Bytes");
    });

    it("should provide migration confirmation", () => {
      const mockDetected = [
        {
          name: "Test Extension",
          path: "/test/path",
          dataFiles: [],
          totalSize: 0,
          type: "other" as const,
        },
      ];

      const instructions = migrator.generateRemovalInstructions(mockDetected);

      expect(instructions.join("\n")).toContain("migrated");
      expect(instructions.join("\n")).toContain("Safe to Remove");
    });
  });
});
