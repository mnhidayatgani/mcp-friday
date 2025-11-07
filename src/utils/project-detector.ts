/**
 * Project Type Detector
 * Auto-detect project type from files
 */

import { promises as fs } from "fs";
import path from "path";

export type ProjectType = "web" | "api" | "cli" | "library" | "unknown";

export interface DetectedProject {
  type: ProjectType;
  name: string;
  techStack: string[];
  confidence: number;
}

export class ProjectDetector {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Detect project type
   */
  async detect(): Promise<DetectedProject> {
    const packageJson = await this.readPackageJson();
    const files = await this.listRootFiles();

    const techStack: string[] = [];
    let type: ProjectType = "unknown";
    let confidence = 0;

    // Detect from package.json
    if (packageJson) {
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Web frameworks
      if (deps["next"] || deps["@next/core"]) {
        techStack.push("Next.js");
        type = "web";
        confidence = 0.9;
      } else if (deps["react"] || deps["react-dom"]) {
        techStack.push("React");
        type = "web";
        confidence = 0.8;
      } else if (deps["vue"]) {
        techStack.push("Vue");
        type = "web";
        confidence = 0.8;
      } else if (deps["@angular/core"]) {
        techStack.push("Angular");
        type = "web";
        confidence = 0.8;
      }

      // API frameworks
      if (deps["express"]) {
        techStack.push("Express");
        if (type === "unknown") {
          type = "api";
          confidence = 0.8;
        }
      }
      if (deps["fastify"]) {
        techStack.push("Fastify");
        if (type === "unknown") {
          type = "api";
          confidence = 0.8;
        }
      }
      if (deps["@nestjs/core"]) {
        techStack.push("NestJS");
        type = "api";
        confidence = 0.9;
      }

      // Databases
      if (deps["prisma"] || deps["@prisma/client"]) {
        techStack.push("Prisma");
      }
      if (deps["mongoose"]) {
        techStack.push("MongoDB");
      }
      if (deps["pg"]) {
        techStack.push("PostgreSQL");
      }

      // TypeScript
      if (deps["typescript"]) {
        techStack.push("TypeScript");
      }

      // Testing
      if (deps["jest"]) {
        techStack.push("Jest");
      }
      if (deps["vitest"]) {
        techStack.push("Vitest");
      }
    }

    // Detect from files
    if (files.includes("vite.config.ts") || files.includes("vite.config.js")) {
      if (!techStack.includes("Vite")) techStack.push("Vite");
      if (type === "unknown") {
        type = "web";
        confidence = 0.7;
      }
    }

    if (files.includes("tsconfig.json")) {
      if (!techStack.includes("TypeScript")) techStack.push("TypeScript");
    }

    // Default to API if has server-like files
    if (type === "unknown" && (files.includes("server.ts") || files.includes("server.js"))) {
      type = "api";
      confidence = 0.6;
    }

    const projectName = packageJson?.name || path.basename(this.projectRoot);

    return {
      type,
      name: projectName,
      techStack,
      confidence,
    };
  }

  /**
   * Read package.json
   */
  private async readPackageJson(): Promise<any | null> {
    try {
      const pkgPath = path.join(this.projectRoot, "package.json");
      const content = await fs.readFile(pkgPath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * List root files
   */
  private async listRootFiles(): Promise<string[]> {
    try {
      return await fs.readdir(this.projectRoot);
    } catch {
      return [];
    }
  }
}
