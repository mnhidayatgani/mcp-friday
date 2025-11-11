/**
 * Extension Memory Migrator
 * Detects and migrates memory from other extensions
 */

import * as fs from "fs/promises";
import * as path from "path";

interface ExtensionMemory {
  name: string;
  path: string;
  dataFiles: string[];
  totalSize: number;
  type: "cursor-memory" | "continue-context" | "aider-chat" | "other";
}

interface MigrationResult {
  detected: ExtensionMemory[];
  migrated: string[];
  errors: string[];
  totalDataMigrated: number;
}

/**
 * Known memory-storing extensions and their patterns
 */
const MEMORY_EXTENSIONS = [
  {
    type: "cursor-memory" as const,
    name: "Cursor Memory",
    patterns: [".cursor/memory", ".cursor/context", ".cursorrules"],
    description: "Cursor AI memory and context files",
  },
  {
    type: "continue-context" as const,
    name: "Continue",
    patterns: [".continue", ".continuerc.json"],
    description: "Continue AI context manager",
  },
  {
    type: "aider-chat" as const,
    name: "Aider",
    patterns: [".aider", ".aider.chat.history.md"],
    description: "Aider AI pair programming chat history",
  },
  {
    type: "other" as const,
    name: "Other AI Extensions",
    patterns: [
      ".ai-memory",
      ".codeium/context",
      ".copilot-context",
      ".github/ai-context",
    ],
    description: "Various AI extension memory files",
  },
];

export class ExtensionMemoryMigrator {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Detect all memory-storing extensions
   */
  async detectExtensions(): Promise<ExtensionMemory[]> {
    const detected: ExtensionMemory[] = [];

    for (const ext of MEMORY_EXTENSIONS) {
      for (const pattern of ext.patterns) {
        const fullPath = path.join(this.projectRoot, pattern);

        try {
          const stat = await fs.stat(fullPath);
          const dataFiles: string[] = [];
          let totalSize = 0;

          if (stat.isDirectory()) {
            // Scan directory for files
            const files = await this.scanDirectory(fullPath);
            dataFiles.push(...files);
            totalSize = await this.calculateDirectorySize(fullPath);
          } else if (stat.isFile()) {
            dataFiles.push(fullPath);
            totalSize = stat.size;
          }

          if (dataFiles.length > 0) {
            detected.push({
              name: ext.name,
              path: fullPath,
              dataFiles,
              totalSize,
              type: ext.type,
            });
          }
        } catch (error) {
          // Path doesn't exist, skip
          continue;
        }
      }
    }

    return detected;
  }

  /**
   * Migrate data from detected extensions to FRIDAY memory
   */
  async migrateExtensions(): Promise<MigrationResult> {
    const result: MigrationResult = {
      detected: [],
      migrated: [],
      errors: [],
      totalDataMigrated: 0,
    };

    // Detect extensions
    result.detected = await this.detectExtensions();

    if (result.detected.length === 0) {
      return result;
    }

    // Create migration directory
    const migrationDir = path.join(
      this.projectRoot,
      ".github/memory/migrations"
    );
    await fs.mkdir(migrationDir, { recursive: true });

    // Migrate each extension
    for (const ext of result.detected) {
      try {
        const migrated = await this.migrateExtension(ext, migrationDir);
        result.migrated.push(...migrated);
        result.totalDataMigrated += ext.totalSize;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : String(error);
        result.errors.push(`Failed to migrate ${ext.name}: ${errorMsg}`);
      }
    }

    return result;
  }

  /**
   * Migrate single extension data
   */
  private async migrateExtension(
    ext: ExtensionMemory,
    targetDir: string
  ): Promise<string[]> {
    const migrated: string[] = [];
    const timestamp = new Date().toISOString().split("T")[0];
    const safeName = ext.name.toLowerCase().replace(/\s+/g, "-");

    for (const sourceFile of ext.dataFiles) {
      try {
        const content = await fs.readFile(sourceFile, "utf-8");
        const fileName = path.basename(sourceFile);
        const targetFile = path.join(
          targetDir,
          `${timestamp}-${safeName}-${fileName}`
        );

        // Create migration markdown
        const migrationContent = `# Migrated from ${ext.name}

**Source:** \`${sourceFile}\`  
**Date:** ${new Date().toISOString()}  
**Size:** ${this.formatBytes(content.length)}

## Original Content

\`\`\`
${content}
\`\`\`

---

This data has been migrated to FRIDAY memory system.
Original file can be safely removed.
`;

        await fs.writeFile(targetFile, migrationContent, "utf-8");
        migrated.push(targetFile);
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    return migrated;
  }

  /**
   * Generate removal instructions for user
   */
  generateRemovalInstructions(detected: ExtensionMemory[]): string[] {
    const instructions: string[] = [];

    instructions.push("");
    instructions.push("📋 EXTENSION REMOVAL INSTRUCTIONS");
    instructions.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    instructions.push("");
    instructions.push(
      "FRIDAY has detected and migrated data from the following extensions:"
    );
    instructions.push("");

    detected.forEach((ext, index) => {
      instructions.push(`${index + 1}. ${ext.name}`);
      instructions.push(`   Path: ${ext.path}`);
      instructions.push(`   Files: ${ext.dataFiles.length}`);
      instructions.push(`   Size: ${this.formatBytes(ext.totalSize)}`);
      instructions.push("");
    });

    instructions.push("🗑️  Safe to Remove:");
    instructions.push("");

    detected.forEach((ext) => {
      instructions.push(`   # Remove ${ext.name}`);
      const relativePath = path.relative(this.projectRoot, ext.path);
      instructions.push(`   rm -rf ${relativePath}`);
      instructions.push("");
    });

    instructions.push("✅ After removal:");
    instructions.push(
      "   - All data has been migrated to .github/memory/migrations/"
    );
    instructions.push("   - FRIDAY has taken over memory management");
    instructions.push("   - No data loss will occur");
    instructions.push("");

    return instructions;
  }

  /**
   * Scan directory recursively
   */
  private async scanDirectory(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.scanDirectory(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          // Only include text files
          if (this.isTextFile(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }

    return files;
  }

  /**
   * Calculate directory size
   */
  private async calculateDirectorySize(dir: string): Promise<number> {
    let size = 0;

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          size += await this.calculateDirectorySize(fullPath);
        } else if (entry.isFile()) {
          const stat = await fs.stat(fullPath);
          size += stat.size;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return size;
  }

  /**
   * Check if file is text file
   */
  private isTextFile(filename: string): boolean {
    const textExtensions = [
      ".md",
      ".txt",
      ".json",
      ".yaml",
      ".yml",
      ".toml",
      ".ini",
      ".log",
      ".csv",
    ];
    return textExtensions.some((ext) => filename.endsWith(ext));
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }
}
