/**
 * Project Learning System
 * Learns from user's project to improve FRIDAY capabilities
 */

import * as fs from "fs/promises";
import * as path from "path";
import { HybridMemoryManager } from "../../memory/hybrid-manager.js";

interface ProjectInsight {
  category: string;
  finding: string;
  confidence: number;
  suggestion: string;
}

interface LearningResult {
  insights: ProjectInsight[];
  patterns: string[];
  improvements: string[];
  techStack: string[];
}

export class ProjectLearner {
  private projectRoot: string;
  private memory: HybridMemoryManager;

  constructor(projectRoot: string, memory: HybridMemoryManager) {
    this.projectRoot = projectRoot;
    this.memory = memory;
  }

  /**
   * Learn from user's project
   */
  async learn(): Promise<LearningResult> {
    const result: LearningResult = {
      insights: [],
      patterns: [],
      improvements: [],
      techStack: [],
    };

    try {
      // Learn from package.json
      await this.learnFromPackageJson(result);

      // Learn from project structure
      await this.learnFromStructure(result);

      // Learn from code patterns
      await this.learnFromCodePatterns(result);

      // Learn from configurations
      await this.learnFromConfigurations(result);

      // Learn from documentation
      await this.learnFromDocumentation(result);

      // Store learnings in memory
      await this.storeLearnings(result);

    } catch (error) {
      // Learning is optional, don't fail setup
    }

    return result;
  }

  /**
   * Learn from package.json
   */
  private async learnFromPackageJson(result: LearningResult): Promise<void> {
    try {
      const packagePath = path.join(this.projectRoot, "package.json");
      const content = await fs.readFile(packagePath, "utf-8");
      const pkg = JSON.parse(content);

      // Extract tech stack
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      // Detect frameworks
      if (deps.react || deps["@types/react"]) {
        result.techStack.push("React");
        result.insights.push({
          category: "Framework",
          finding: "React application detected",
          confidence: 0.95,
          suggestion: "Enable React-specific memory patterns",
        });
      }

      if (deps.next) {
        result.techStack.push("Next.js");
        result.insights.push({
          category: "Framework",
          finding: "Next.js framework detected",
          confidence: 0.95,
          suggestion: "Optimize for server-side rendering patterns",
        });
      }

      if (deps.vue) {
        result.techStack.push("Vue.js");
        result.insights.push({
          category: "Framework",
          finding: "Vue.js application detected",
          confidence: 0.95,
          suggestion: "Enable Vue-specific component patterns",
        });
      }

      if (deps.express || deps.fastify || deps.koa) {
        result.techStack.push("Node.js API");
        result.insights.push({
          category: "Backend",
          finding: "Node.js API server detected",
          confidence: 0.9,
          suggestion: "Focus on API endpoint documentation",
        });
      }

      if (deps.typescript) {
        result.techStack.push("TypeScript");
        result.patterns.push("Type-safe development");
      }

      if (deps.jest || deps.vitest || deps.mocha) {
        result.patterns.push("Test-driven development");
      }

      if (deps.eslint || deps.prettier) {
        result.patterns.push("Code quality automation");
      }

      // Detect monorepo
      if (pkg.workspaces) {
        result.insights.push({
          category: "Architecture",
          finding: "Monorepo structure detected",
          confidence: 1.0,
          suggestion: "Enable workspace-aware memory organization",
        });
      }

    } catch (error) {
      // package.json might not exist
    }
  }

  /**
   * Learn from project structure
   */
  private async learnFromStructure(result: LearningResult): Promise<void> {
    try {
      const entries = await fs.readdir(this.projectRoot, { withFileTypes: true });
      const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);

      // Detect architecture patterns
      if (dirs.includes("src") && dirs.includes("tests")) {
        result.patterns.push("Source/Test separation");
      }

      if (dirs.includes("components") || dirs.includes("src/components")) {
        result.patterns.push("Component-based architecture");
      }

      if (dirs.includes("api") || dirs.includes("routes")) {
        result.patterns.push("API-first design");
      }

      if (dirs.includes("lib") || dirs.includes("utils")) {
        result.patterns.push("Utility-based organization");
      }

      if (dirs.includes("docs") || dirs.includes("documentation")) {
        result.insights.push({
          category: "Documentation",
          finding: "Documentation folder exists",
          confidence: 1.0,
          suggestion: "Integrate docs with FRIDAY memory",
        });
      }

      // Detect microservices
      const servicePatterns = dirs.filter(d => 
        d.includes("service") || d.includes("microservice")
      );
      if (servicePatterns.length > 1) {
        result.insights.push({
          category: "Architecture",
          finding: "Microservices architecture detected",
          confidence: 0.8,
          suggestion: "Enable service-specific memory contexts",
        });
      }

    } catch (error) {
      // Directory reading failed
    }
  }

  /**
   * Learn from code patterns
   */
  private async learnFromCodePatterns(result: LearningResult): Promise<void> {
    try {
      const srcPath = path.join(this.projectRoot, "src");
      
      try {
        await fs.access(srcPath);
        const files = await this.scanForFiles(srcPath, [".ts", ".tsx", ".js", ".jsx"]);

        if (files.length > 0) {
          // Sample first few files
          const samples = files.slice(0, 10);
          
          for (const file of samples) {
            const content = await fs.readFile(file, "utf-8");

            // Detect patterns
            if (content.includes("import React") || content.includes("from 'react'")) {
              result.patterns.push("React components");
            }

            if (content.includes("async") && content.includes("await")) {
              result.patterns.push("Async/await pattern");
            }

            if (content.includes("class ") && content.includes("extends")) {
              result.patterns.push("Class-based OOP");
            }

            if (content.includes("export const") || content.includes("export function")) {
              result.patterns.push("Functional programming");
            }
          }
        }
      } catch {
        // src directory might not exist
      }

    } catch (error) {
      // Pattern analysis is optional
    }
  }

  /**
   * Learn from configurations
   */
  private async learnFromConfigurations(result: LearningResult): Promise<void> {
    const configFiles = [
      "tsconfig.json",
      "jest.config.js",
      "vite.config.ts",
      "webpack.config.js",
      ".eslintrc.json",
      "prettier.config.js",
    ];

    for (const config of configFiles) {
      try {
        const configPath = path.join(this.projectRoot, config);
        await fs.access(configPath);
        
        const toolName = config.split(".")[0] || config;
        result.improvements.push(`Detected ${toolName} configuration - can learn build patterns`);
      } catch {
        // Config doesn't exist
      }
    }
  }

  /**
   * Learn from documentation
   */
  private async learnFromDocumentation(result: LearningResult): Promise<void> {
    const docFiles = ["README.md", "CONTRIBUTING.md", "ARCHITECTURE.md"];

    for (const doc of docFiles) {
      try {
        const docPath = path.join(this.projectRoot, doc);
        const content = await fs.readFile(docPath, "utf-8");

        if (content.length > 100) {
          result.insights.push({
            category: "Documentation",
            finding: `${doc} contains project documentation`,
            confidence: 1.0,
            suggestion: `Parse ${doc} for architectural insights`,
          });
        }
      } catch {
        // Doc doesn't exist
      }
    }
  }

  /**
   * Store learnings in memory
   */
  private async storeLearnings(result: LearningResult): Promise<void> {
    const timestamp = new Date().toISOString().split("T")[0];
    const content = `# Project Learnings

**Date:** ${new Date().toISOString()}

## Tech Stack

${result.techStack.map(t => `- ${t}`).join("\n")}

## Patterns Detected

${result.patterns.map(p => `- ${p}`).join("\n")}

## Insights

${result.insights.map(i => `
### ${i.category}
- **Finding:** ${i.finding}
- **Confidence:** ${(i.confidence * 100).toFixed(0)}%
- **Suggestion:** ${i.suggestion}
`).join("\n")}

## Potential Improvements

${result.improvements.map(i => `- ${i}`).join("\n")}

---

This learning data helps FRIDAY adapt to your project's specific needs.
`;

    try {
      const learningsPath = path.join(
        this.projectRoot,
        ".github/memory/decisions",
        `${timestamp}-project-learnings.md`
      );
      await fs.writeFile(learningsPath, content, "utf-8");
    } catch (error) {
      // Storing is optional
    }
  }

  /**
   * Scan for files with specific extensions
   */
  private async scanForFiles(dir: string, extensions: string[]): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules, dist, build
          if (!["node_modules", "dist", "build", ".git"].includes(entry.name)) {
            const subFiles = await this.scanForFiles(fullPath, extensions);
            files.push(...subFiles);
          }
        } else if (entry.isFile()) {
          if (extensions.some(ext => entry.name.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory might not be readable
    }

    return files;
  }

  /**
   * Generate learning report
   */
  generateReport(result: LearningResult): string[] {
    const report: string[] = [];

    report.push("");
    report.push("🧠 PROJECT LEARNING ANALYSIS");
    report.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    report.push("");

    if (result.techStack.length > 0) {
      report.push("📚 Tech Stack Detected:");
      result.techStack.forEach(tech => report.push(`   - ${tech}`));
      report.push("");
    }

    if (result.patterns.length > 0) {
      report.push("🎯 Patterns Identified:");
      const uniquePatterns = [...new Set(result.patterns)];
      uniquePatterns.forEach(pattern => report.push(`   - ${pattern}`));
      report.push("");
    }

    if (result.insights.length > 0) {
      report.push("💡 Key Insights:");
      result.insights.slice(0, 5).forEach(insight => {
        report.push(`   - ${insight.finding} (${(insight.confidence * 100).toFixed(0)}% confidence)`);
      });
      report.push("");
    }

    if (result.improvements.length > 0) {
      report.push("🚀 Potential Improvements:");
      result.improvements.slice(0, 3).forEach(imp => {
        report.push(`   - ${imp}`);
      });
      report.push("");
    }

    report.push("✅ Learning complete - FRIDAY is now adapted to your project!");
    report.push("");

    return report;
  }
}
