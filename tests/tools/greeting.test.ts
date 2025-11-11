/**
 * Greeting Tool Tests
 */

import { greetingTool } from "../../src/tools/greeting";
import * as fs from "fs/promises";

jest.mock("fs/promises");

describe("Greeting Tool", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return greeting response", async () => {
    (fs.readFile as jest.Mock).mockResolvedValue("Phase 1: Initial development");
    (fs.readdir as jest.Mock).mockResolvedValue([]);

    const result = await greetingTool();

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  it("should include greeting text", async () => {
    (fs.readFile as jest.Mock).mockResolvedValue("Current development phase");
    (fs.readdir as jest.Mock).mockResolvedValue([]);

    const result = await greetingTool();

    expect(result.content[0]).toHaveProperty("text");
    expect(result.content[0].type).toBe("text");
    if (result.content[0].type === "text") {
      expect(result.content[0].text).toContain("FRIDAY");
    }
  });

  it("should include time-based greeting", async () => {
    (fs.readFile as jest.Mock).mockResolvedValue("Phase 1");
    (fs.readdir as jest.Mock).mockResolvedValue([]);

    const result = await greetingTool();
    expect(result.content[0].type).toBe("text");
    if (result.content[0].type === "text") {
      const text = result.content[0].text;
      const hasGreeting = 
        text.includes("Good morning") ||
        text.includes("Good afternoon") ||
        text.includes("Good evening");

      expect(hasGreeting).toBe(true);
    }
  });

  it("should include project status", async () => {
    (fs.readFile as jest.Mock).mockResolvedValue("Phase 2: Feature development");
    (fs.readdir as jest.Mock).mockResolvedValue(["impl1.md", "impl2.md"]);

    const result = await greetingTool();
    expect(result.content[0].type).toBe("text");
    if (result.content[0].type === "text") {
      expect(result.content[0].text).toContain("Project Status");
    }
  });

  it("should handle missing memory files", async () => {
    (fs.readFile as jest.Mock).mockRejectedValue(new Error("File not found"));
    (fs.readdir as jest.Mock).mockRejectedValue(new Error("Directory not found"));

    const result = await greetingTool();

    expect(result).toHaveProperty("content");
    expect(result.content[0].type).toBe("text");
    if (result.content[0].type === "text") {
      expect(result.content[0].text).toBeTruthy();
    }
  });

  it("should include recommendations", async () => {
    (fs.readFile as jest.Mock).mockResolvedValue("Phase 1");
    (fs.readdir as jest.Mock).mockResolvedValue([]);

    const result = await greetingTool();
    expect(result.content[0].type).toBe("text");
    if (result.content[0].type === "text") {
      expect(result.content[0].text).toContain("Recommendations");
    }
  });

  it("should mention completed tasks", async () => {
    (fs.readFile as jest.Mock).mockResolvedValue("Phase 2");
    (fs.readdir as jest.Mock).mockResolvedValue([
      "auth-system.md",
      "database-setup.md",
    ]);

    const result = await greetingTool();
    expect(result.content[0].type).toBe("text");
    if (result.content[0].type === "text") {
      expect(result.content[0].text).toContain("implementations");
    }
  });

  it("should format output as text", async () => {
    (fs.readFile as jest.Mock).mockResolvedValue("Phase 1");
    (fs.readdir as jest.Mock).mockResolvedValue([]);

    const result = await greetingTool();

    expect(result.content[0].type).toBe("text");
  });
});
