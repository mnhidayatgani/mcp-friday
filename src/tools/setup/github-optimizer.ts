/**
 * GitHub Folder Optimizer
 * Refactors .github/ folder structure for optimal FRIDAY integration
 */

import * as fs from "fs/promises";
import * as path from "path";

interface OptimizationResult {
  removed: string[];
  modified: string[];
  added: string[];
  kept: string[];
  errors: string[];
}

interface FileAction {
  path: string;
  action: "remove" | "modify" | "add" | "keep";
  reason: string;
}

export class GitHubOptimizer {
  private projectRoot: string;
  private githubPath: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.githubPath = path.join(projectRoot, ".github");
  }

  /**
   * Optimize .github folder structure
   */
  async optimize(): Promise<OptimizationResult> {
    const result: OptimizationResult = {
      removed: [],
      modified: [],
      added: [],
      kept: [],
      errors: [],
    };

    try {
      // Ensure .github exists
      await fs.mkdir(this.githubPath, { recursive: true });

      // Analyze current structure
      const actions = await this.analyzeStructure();

      // Execute actions
      for (const action of actions) {
        try {
          switch (action.action) {
            case "remove":
              await this.removeFile(action.path);
              result.removed.push(action.path);
              break;
            case "modify":
              await this.modifyFile(action.path);
              result.modified.push(action.path);
              break;
            case "add":
              await this.addFile(action.path);
              result.added.push(action.path);
              break;
            case "keep":
              result.kept.push(action.path);
              break;
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          result.errors.push(`${action.path}: ${errorMsg}`);
        }
      }

      // Ensure required structure
      await this.ensureRequiredStructure(result);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Optimization failed: ${errorMsg}`);
    }

    return result;
  }

  /**
   * Analyze current .github structure and determine actions
   */
  private async analyzeStructure(): Promise<FileAction[]> {
    const actions: FileAction[] = [];

    try {
      const entries = await fs.readdir(this.githubPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(this.githubPath, entry.name);
        const relativePath = path.relative(this.projectRoot, fullPath);

        if (entry.isDirectory()) {
          const dirAction = this.analyzeDirectory(entry.name);
          if (dirAction) {
            actions.push({ path: relativePath, ...dirAction });
          }
        } else if (entry.isFile()) {
          const fileAction = this.analyzeFile(entry.name);
          if (fileAction) {
            actions.push({ path: relativePath, ...fileAction });
          }
        }
      }
    } catch {
      // .github might not exist yet
    }

    // Check for missing required files
    const required = this.getRequiredFiles();
    for (const req of required) {
      const exists = actions.some(a => a.path.includes(req.name));
      if (!exists) {
        actions.push({
          path: path.join(".github", req.name),
          action: "add",
          reason: req.reason,
        });
      }
    }

    return actions;
  }

  /**
   * Analyze directory and determine action
   */
  private analyzeDirectory(name: string): { action: FileAction["action"]; reason: string } | null {
    const keep = ["memory", "workflows", "hooks"];
    const remove = ["ISSUE_TEMPLATE", "PULL_REQUEST_TEMPLATE", "scripts"];

    if (keep.includes(name)) {
      return { action: "keep", reason: "Required by FRIDAY" };
    }

    if (remove.includes(name)) {
      return { action: "remove", reason: "Not needed for FRIDAY memory system" };
    }

    // Check if directory has useful content
    if (name.startsWith(".") || name.startsWith("_")) {
      return { action: "remove", reason: "Hidden/temporary directory" };
    }

    return { action: "keep", reason: "Potentially useful" };
  }

  /**
   * Analyze file and determine action
   */
  private analyzeFile(name: string): { action: FileAction["action"]; reason: string } | null {
    // Files to remove
    const removePatterns = [
      "FUNDING.yml",
      "stale.yml",
      "lock.yml",
      "AI-PROTOCOL.md",
      "CODEOWNERS",
      ".DS_Store",
    ];

    if (removePatterns.some(pattern => name.includes(pattern))) {
      return { action: "remove", reason: "Redundant or system file" };
    }

    // Files to modify
    const modifyPatterns = ["copilot-instructions.md", "RESPONSE-STYLE.md", "WORKFLOW.md"];

    if (modifyPatterns.includes(name)) {
      return { action: "modify", reason: "Needs FRIDAY integration updates" };
    }

    // Files to keep
    const keepPatterns = ["dependabot.yml", "workflows"];

    if (keepPatterns.some(pattern => name.includes(pattern))) {
      return { action: "keep", reason: "GitHub automation" };
    }

    return null;
  }

  /**
   * Get required files list
   */
  private getRequiredFiles(): { name: string; reason: string }[] {
    return [
      {
        name: "copilot-instructions.md",
        reason: "FRIDAY protocol enforcement",
      },
      {
        name: "memory/INDEX.md",
        reason: "Memory index file",
      },
      {
        name: "memory/current-state.md",
        reason: "Current project state",
      },
    ];
  }

  /**
   * Remove file or directory
   */
  private async removeFile(relativePath: string): Promise<void> {
    const fullPath = path.join(this.projectRoot, relativePath);

    try {
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await fs.rm(fullPath, { recursive: true, force: true });
      } else {
        await fs.unlink(fullPath);
      }
    } catch {
      // File might not exist
    }
  }

  /**
   * Modify file with FRIDAY-specific content
   */
  private async modifyFile(relativePath: string): Promise<void> {
    const fullPath = path.join(this.projectRoot, relativePath);
    const fileName = path.basename(relativePath);

    let content = await fs.readFile(fullPath, "utf-8");

    // Apply modifications based on file type
    if (fileName === "copilot-instructions.md") {
      content = this.optimizeCopilotInstructions(content);
    } else if (fileName === "RESPONSE-STYLE.md") {
      content = this.optimizeResponseStyle(content);
    } else if (fileName === "WORKFLOW.md") {
      content = this.optimizeWorkflow(content);
    }

    await fs.writeFile(fullPath, content, "utf-8");
  }

  /**
   * Add new file
   */
  private async addFile(relativePath: string): Promise<void> {
    const fullPath = path.join(this.projectRoot, relativePath);
    const fileName = path.basename(relativePath);

    // Create directory if needed
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Add file based on type
    if (fileName === "copilot-instructions.md") {
      await this.createCopilotInstructions(fullPath);
    } else if (fileName === "INDEX.md") {
      await this.createIndex(fullPath);
    } else if (fileName === "current-state.md") {
      await this.createCurrentState(fullPath);
    }
  }

  /**
   * Optimize copilot instructions
   */
  private optimizeCopilotInstructions(content: string): string {
    // Ensure FRIDAY protocol is at the top
    if (!content.includes("FRIDAY Protocol")) {
      const header = `# GitHub Copilot Instructions - FRIDAY Protocol

## ⚠️ ABSOLUTE REQUIREMENT - NO EXCEPTIONS ⚠️

**YOU MUST RESPOND IN ENGLISH ONLY**

## 🤖 FRIDAY Protocol (MANDATORY)

Before responding to ANY user request, ALWAYS:

1. **Load Context**: \`#friday-context\`
2. **Search Memory**: \`#friday-search [topic]\`
3. **Use FRIDAY Tools**: All 19 available tools

---

`;
      content = header + content;
    }

    // Remove redundant sections
    content = content.replace(/## Old Instructions[\s\S]*?(?=##|$)/g, "");
    content = content.replace(/## Deprecated[\s\S]*?(?=##|$)/g, "");

    return content;
  }

  /**
   * Optimize response style
   */
  private optimizeResponseStyle(content: string): string {
    // Ensure concise responses
    if (!content.includes("CONCISE RESPONSES")) {
      const style = `
## CONCISE RESPONSES

- Short and efficient
- Key information only
- No lengthy reports
- No excessive formatting
`;
      content = content + style;
    }

    return content;
  }

  /**
   * Optimize workflow
   */
  private optimizeWorkflow(content: string): string {
    // Ensure FRIDAY workflow is included
    if (!content.includes("FRIDAY Workflow")) {
      const workflow = `
## FRIDAY Workflow

1. **Start Session**: \`#friday-greeting\`
2. **Load Context**: \`#friday-context\`
3. **Search**: \`#friday-search [topic]\`
4. **Work**: Implement features
5. **Sync**: \`#friday-sync\`
`;
      content = content + workflow;
    }

    return content;
  }

  /**
   * Create copilot instructions
   */
  private async createCopilotInstructions(fullPath: string): Promise<void> {
    const content = `# GitHub Copilot Instructions - FRIDAY Protocol

## ⚠️ ABSOLUTE REQUIREMENT ⚠️

**RESPOND IN ENGLISH ONLY - REGARDLESS OF USER'S LANGUAGE**

## 🤖 FRIDAY Protocol

Before ANY task:
1. Load context: \`#friday-context\`
2. Search memory: \`#friday-search [topic]\`
3. Use FRIDAY tools

## 🎯 Response Style

- Concise and efficient
- British English only
- Address as "Sir" or "Ma'am"
- Professional tone

## 📋 Quick Reference

| Tool | Purpose |
|------|---------|
| \`friday-setup\` | Initialize FRIDAY |
| \`friday-context\` | Load context |
| \`friday-search\` | Search memory |
| \`friday-sync\` | Sync to Redis |

---

**FRIDAY Protocol is mandatory. No exceptions.**
`;

    await fs.writeFile(fullPath, content, "utf-8");
  }

  /**
   * Create INDEX.md
   */
  private async createIndex(fullPath: string): Promise<void> {
    const content = `# Project Memory Index

**Created:** ${new Date().toISOString()}

## Status

Active development with FRIDAY memory system.

## Structure

- \`implementations/\` - Feature implementations
- \`decisions/\` - Architecture decisions
- \`issues/\` - Known issues and solutions
- \`archive/\` - Historical records
`;

    await fs.writeFile(fullPath, content, "utf-8");
  }

  /**
   * Create current-state.md
   */
  private async createCurrentState(fullPath: string): Promise<void> {
    const content = `# Current Project State

**Updated:** ${new Date().toISOString()}

## Phase

Initial Development

## Recent Changes

- FRIDAY memory system initialized
- Extension migration configured

## Next Steps

- Continue development
- Add features as needed
`;

    await fs.writeFile(fullPath, content, "utf-8");
  }

  /**
   * Ensure required directory structure
   */
  private async ensureRequiredStructure(_result: OptimizationResult): Promise<void> {
    const requiredDirs = [
      "memory",
      "memory/implementations",
      "memory/decisions",
      "memory/issues",
      "memory/archive",
      "memory/migrations",
      "hooks",
    ];

    for (const dir of requiredDirs) {
      const fullPath = path.join(this.githubPath, dir);
      try {
        await fs.mkdir(fullPath, { recursive: true });
        
        // Add .gitkeep to empty directories
        const gitkeep = path.join(fullPath, ".gitkeep");
        try {
          await fs.access(gitkeep);
        } catch {
          await fs.writeFile(gitkeep, "", "utf-8");
        }
      } catch {
        // Directory might already exist
      }
    }
  }

  /**
   * Generate optimization report
   */
  generateReport(result: OptimizationResult): string[] {
    const report: string[] = [];

    report.push("");
    report.push("📁 GITHUB FOLDER OPTIMIZATION");
    report.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    report.push("");

    if (result.removed.length > 0) {
      report.push(`🗑️  Removed (${result.removed.length}):`);
      result.removed.forEach(file => {
        report.push(`   - ${file}`);
      });
      report.push("");
    }

    if (result.modified.length > 0) {
      report.push(`✏️  Modified (${result.modified.length}):`);
      result.modified.forEach(file => {
        report.push(`   - ${file}`);
      });
      report.push("");
    }

    if (result.added.length > 0) {
      report.push(`➕ Added (${result.added.length}):`);
      result.added.forEach(file => {
        report.push(`   - ${file}`);
      });
      report.push("");
    }

    if (result.kept.length > 0) {
      report.push(`✅ Kept (${result.kept.length}):`);
      result.kept.forEach(file => {
        report.push(`   - ${file}`);
      });
      report.push("");
    }

    if (result.errors.length > 0) {
      report.push(`⚠️  Errors (${result.errors.length}):`);
      result.errors.forEach(error => {
        report.push(`   - ${error}`);
      });
      report.push("");
    }

    report.push("✅ Optimization Complete!");
    report.push("   .github/ folder is now optimized for FRIDAY");
    report.push("");

    return report;
  }
}
