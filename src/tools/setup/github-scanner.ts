/**
 * GitHub Scanner Module
 * Scans and analyzes existing .github/ folder
 */

import { promises as fs } from "fs";
import path from "path";

export interface GitHubScanResult {
  exists: boolean;
  files: string[];
  hasCopilotInstructions: boolean;
  hasMemory: boolean;
  hasWorkflows: boolean;
  conflicts: string[];
  userConfigs: Map<string, string>;
}

export class GitHubScanner {
  private githubDir: string;

  constructor(projectRoot: string) {
    this.githubDir = path.join(projectRoot, ".github");
  }

  /**
   * Scan entire .github/ folder
   */
  async scan(): Promise<GitHubScanResult> {
    const result: GitHubScanResult = {
      exists: false,
      files: [],
      hasCopilotInstructions: false,
      hasMemory: false,
      hasWorkflows: false,
      conflicts: [],
      userConfigs: new Map(),
    };

    // Check if .github exists
    try {
      await fs.access(this.githubDir);
      result.exists = true;
    } catch {
      console.log("📁 .github/ folder not found - will create");
      return result;
    }

    console.log("🔍 Scanning .github/ folder...");

    // Recursively scan all files
    result.files = await this.scanDirectory(this.githubDir);

    // Check for specific files
    result.hasCopilotInstructions = result.files.some((f) =>
      f.includes("copilot-instructions.md")
    );
    result.hasMemory = result.files.some((f) => f.includes("memory/"));
    result.hasWorkflows = result.files.some((f) => f.includes("workflows/"));

    // Read user configurations
    for (const file of result.files) {
      if (file.endsWith(".md")) {
        const content = await fs.readFile(file, "utf-8");
        const relativePath = path.relative(this.githubDir, file);
        result.userConfigs.set(relativePath, content);
      }
    }

    // Detect conflicts
    result.conflicts = this.detectConflicts(result.files);

    console.log(`   Found ${result.files.length} files`);
    console.log(`   Copilot instructions: ${result.hasCopilotInstructions ? "✅" : "❌"}`);
    console.log(`   Memory system: ${result.hasMemory ? "✅" : "❌"}`);
    console.log(`   Workflows: ${result.hasWorkflows ? "✅" : "❌"}`);
    console.log(`   Conflicts detected: ${result.conflicts.length}`);

    return result;
  }

  /**
   * Recursively scan directory
   */
  private async scanDirectory(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip node_modules, .git, etc.
        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === "backup"
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          const subFiles = await this.scanDirectory(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }

    return files;
  }

  /**
   * Detect conflicting files
   */
  private detectConflicts(files: string[]): string[] {
    const conflicts: string[] = [];

    // Files that might conflict with FRIDAY
    const conflictPatterns = [
      /memory-system/i,
      /ai-protocol/i,
      /agent-instructions/i,
      /memory-instructions/i,
    ];

    for (const file of files) {
      const basename = path.basename(file);
      for (const pattern of conflictPatterns) {
        if (pattern.test(basename)) {
          conflicts.push(file);
          break;
        }
      }
    }

    return conflicts;
  }

  /**
   * Read copilot-instructions.md if exists
   */
  async readCopilotInstructions(): Promise<string | null> {
    const copilotPath = path.join(this.githubDir, "copilot-instructions.md");
    try {
      return await fs.readFile(copilotPath, "utf-8");
    } catch {
      return null;
    }
  }
}
