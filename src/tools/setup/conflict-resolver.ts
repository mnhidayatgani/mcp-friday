/**
 * Conflict Resolver Module
 * Handles file conflicts by backing up and resolving
 */

import { promises as fs } from "fs";
import path from "path";

export class ConflictResolver {
  private githubDir: string;
  private backupDir: string;

  constructor(projectRoot: string) {
    this.githubDir = path.join(projectRoot, ".github");
    this.backupDir = path.join(this.githubDir, "backup");
  }

  /**
   * Resolve conflicts by backing up files
   */
  async resolveConflicts(conflicts: string[]): Promise<void> {
    if (conflicts.length === 0) {
      console.log("✅ No conflicts detected");
      return;
    }

    console.log(`⚠️  Found ${conflicts.length} potential conflicts`);
    console.log("   Moving to backup folder...");

    // Create backup directory
    await fs.mkdir(this.backupDir, { recursive: true });

    // Move each conflicting file
    for (const conflictFile of conflicts) {
      await this.backupFile(conflictFile);
    }

    // Add backup folder to .gitignore
    await this.addToGitignore();

    console.log(`✅ Backed up ${conflicts.length} files to .github/backup/`);
  }

  /**
   * Backup a single file
   */
  private async backupFile(filePath: string): Promise<void> {
    const relativePath = path.relative(this.githubDir, filePath);
    const backupPath = path.join(this.backupDir, relativePath);

    // Create directory structure in backup
    await fs.mkdir(path.dirname(backupPath), { recursive: true });

    // Copy file to backup
    await fs.copyFile(filePath, backupPath);

    // Remove original
    await fs.unlink(filePath);

    console.log(`   📦 Backed up: ${relativePath}`);
  }

  /**
   * Add backup folder to .gitignore
   */
  private async addToGitignore(): Promise<void> {
    const gitignorePath = path.join(this.githubDir, "..", ".gitignore");
    const backupEntry = ".github/backup/";

    try {
      let gitignoreContent = "";
      try {
        gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
      } catch {
        // .gitignore doesn't exist
      }

      // Check if already exists
      if (gitignoreContent.includes(backupEntry)) {
        return;
      }

      // Add backup entry
      const newContent =
        gitignoreContent +
        (gitignoreContent.endsWith("\n") ? "" : "\n") +
        `\n# FRIDAY backup folder (AI agents should ignore)\n` +
        `${backupEntry}\n`;

      await fs.writeFile(gitignorePath, newContent, "utf-8");
      console.log("   ✅ Added .github/backup/ to .gitignore");
    } catch (error) {
      console.warn("   ⚠️  Could not update .gitignore");
    }
  }
}
