/**
 * Git Memory Manager
 * Handles .github/memory/ structure operations
 */

import { promises as fs } from "fs";
import path from "path";

export interface MemoryFile {
  path: string;
  content: string;
  type: "implementation" | "decision" | "issue";
  created: Date;
  modified: Date;
}

export interface ProjectIndex {
  name: string;
  type: string;
  techStack: string[];
  created: Date;
  updated: Date;
}

export class GitMemoryManager {
  private memoryDir: string;

  constructor(projectRoot: string = process.cwd()) {
    this.memoryDir = path.join(projectRoot, ".github", "memory");
  }

  /**
   * Initialize memory structure
   */
  async initialize(): Promise<void> {
    const dirs = [
      this.memoryDir,
      path.join(this.memoryDir, "implementations"),
      path.join(this.memoryDir, "decisions"),
      path.join(this.memoryDir, "issues"),
      path.join(this.memoryDir, "archive"),
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Check if memory is initialized
   */
  async isInitialized(): Promise<boolean> {
    try {
      await fs.access(this.memoryDir);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create INDEX.md
   */
  async createIndex(project: ProjectIndex): Promise<void> {
    const indexPath = path.join(this.memoryDir, "INDEX.md");
    const content = `# Memory Index

**Project:** ${project.name}  
**Type:** ${project.type}  
**Tech Stack:** ${project.techStack.join(", ")}  
**Created:** ${project.created.toISOString()}  
**Last Updated:** ${project.updated.toISOString()}

---

## 📂 Memory Structure

- **implementations/** - Feature implementations & code changes
- **decisions/** - Architecture decisions & rationale
- **issues/** - Bug fixes & problem solutions
- **archive/** - Old/completed items

## 📊 Quick Stats

- Implementations: 0
- Decisions: 0
- Issues: 0

---

## 🔄 Recent Activity

(No activity yet)

---

*This file is auto-generated and maintained by FRIDAY.*
`;

    await fs.writeFile(indexPath, content, "utf-8");
  }

  /**
   * Create current-state.md
   */
  async createCurrentState(projectName: string, projectType: string): Promise<void> {
    const statePath = path.join(this.memoryDir, "current-state.md");
    const content = `# Project Current State

**Project:** ${projectName}  
**Type:** ${projectType}  
**Status:** Initial Setup  
**Last Updated:** ${new Date().toISOString()}

---

## 🎯 Current Focus

- Project initialization
- FRIDAY persona activation
- Memory system setup

## 📋 Recent Accomplishments

- ✅ FRIDAY MCP server initialized
- ✅ Memory structure created
- ✅ Ready for development

## ⚠️ Known Issues

(None currently)

## 🔜 Next Steps

1. Start implementing core features
2. Set up development environment
3. Configure integrations

---

*Maintained by FRIDAY AI Agent*
`;

    await fs.writeFile(statePath, content, "utf-8");
  }

  /**
   * Read INDEX.md
   */
  async readIndex(): Promise<string | null> {
    try {
      const indexPath = path.join(this.memoryDir, "INDEX.md");
      return await fs.readFile(indexPath, "utf-8");
    } catch {
      return null;
    }
  }

  /**
   * Read current-state.md
   */
  async readCurrentState(): Promise<string | null> {
    try {
      const statePath = path.join(this.memoryDir, "current-state.md");
      return await fs.readFile(statePath, "utf-8");
    } catch {
      return null;
    }
  }

  /**
   * Create memory file
   */
  async createMemoryFile(
    type: "implementation" | "decision" | "issue",
    filename: string,
    content: string
  ): Promise<string> {
    const typeDir = path.join(this.memoryDir, `${type}s`);
    const filePath = path.join(typeDir, filename);

    await fs.writeFile(filePath, content, "utf-8");
    return filePath;
  }

  /**
   * List all memory files
   */
  async listMemoryFiles(): Promise<MemoryFile[]> {
    const files: MemoryFile[] = [];
    const types: Array<"implementation" | "decision" | "issue"> = [
      "implementation",
      "decision",
      "issue",
    ];

    for (const type of types) {
      const typeDir = path.join(this.memoryDir, `${type}s`);
      try {
        const filenames = await fs.readdir(typeDir);
        for (const filename of filenames) {
          if (filename.endsWith(".md")) {
            const filePath = path.join(typeDir, filename);
            const content = await fs.readFile(filePath, "utf-8");
            const stats = await fs.stat(filePath);

            files.push({
              path: filePath,
              content,
              type,
              created: stats.birthtime,
              modified: stats.mtime,
            });
          }
        }
      } catch {
        // Directory doesn't exist or is empty
      }
    }

    return files;
  }

  /**
   * Search memory files
   */
  async searchMemory(query: string): Promise<MemoryFile[]> {
    const allFiles = await this.listMemoryFiles();
    const lowerQuery = query.toLowerCase();

    return allFiles.filter((file) =>
      file.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get memory statistics
   */
  async getStats(): Promise<{
    implementations: number;
    decisions: number;
    issues: number;
    total: number;
  }> {
    const files = await this.listMemoryFiles();

    return {
      implementations: files.filter((f) => f.type === "implementation").length,
      decisions: files.filter((f) => f.type === "decision").length,
      issues: files.filter((f) => f.type === "issue").length,
      total: files.length,
    };
  }

  /**
   * Update current-state.md
   */
  async updateCurrentState(updates: {
    focus?: string;
    accomplishments?: string[];
    issues?: string[];
    nextSteps?: string[];
  }): Promise<void> {
    const statePath = path.join(this.memoryDir, "current-state.md");
    let content = await this.readCurrentState();

    if (!content) {
      throw new Error("current-state.md not found");
    }

    const timestamp = new Date().toISOString();

    // Update timestamp
    content = content.replace(
      /\*\*Last Updated:\*\* .+/,
      `**Last Updated:** ${timestamp}`
    );

    // Update focus if provided
    if (updates.focus) {
      content = content.replace(
        /## 🎯 Current Focus\n\n.+?\n\n/s,
        `## 🎯 Current Focus\n\n${updates.focus}\n\n`
      );
    }

    await fs.writeFile(statePath, content, "utf-8");
  }
}
