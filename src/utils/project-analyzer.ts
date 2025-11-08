/**
 * Project Analyzer
 * Deep analysis of user's project structure, patterns, and architecture
 */

import { promises as fs } from "fs";
import path from "path";

export interface ProjectAnalysis {
  architecture: {
    type: string; // monolith, microservices, serverless, etc
    structure: string; // MVC, feature-based, domain-driven, etc
    layers: string[]; // presentation, business, data, etc
  };
  patterns: {
    design: string[]; // singleton, factory, observer, etc
    architectural: string[]; // repository, service, etc
    code: string[]; // async/await, hooks, etc
  };
  tech: {
    languages: string[];
    frameworks: string[];
    libraries: string[];
    tools: string[];
  };
  files: {
    entry: string[]; // main entry points
    config: string[]; // configuration files
    important: string[]; // critical files
    tests: string[]; // test files
  };
  conventions: {
    naming: string; // camelCase, snake_case, etc
    fileStructure: string; // feature folders, type folders, etc
    imports: string; // absolute, relative, etc
    exports: string; // named, default, etc
  };
  risks: {
    level: "low" | "medium" | "high";
    areas: string[]; // areas that need careful handling
    warnings: string[]; // specific warnings
  };
}

export class ProjectAnalyzer {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Perform deep analysis of the project
   */
  async analyze(): Promise<ProjectAnalysis> {
    const analysis: ProjectAnalysis = {
      architecture: await this.analyzeArchitecture(),
      patterns: await this.analyzePatterns(),
      tech: await this.analyzeTechStack(),
      files: await this.analyzeFiles(),
      conventions: await this.analyzeConventions(),
      risks: await this.analyzeRisks(),
    };

    return analysis;
  }

  /**
   * Analyze project architecture
   */
  private async analyzeArchitecture(): Promise<ProjectAnalysis["architecture"]> {
    const hasApiFolder = await this.exists("api");
    const hasServerFolder = await this.exists("server");
    const hasSrcFolder = await this.exists("src");
    const hasAppFolder = await this.exists("app");
    const hasPagesFolder = await this.exists("pages");

    let type = "unknown";
    let structure = "unknown";
    const layers: string[] = [];

    // Detect architecture type
    if (hasServerFolder && hasApiFolder) {
      type = "microservices";
    } else if (await this.exists("serverless.yml")) {
      type = "serverless";
    } else {
      type = "monolith";
    }

    // Detect structure
    if (await this.exists("src/controllers") && await this.exists("src/models")) {
      structure = "MVC";
      layers.push("presentation", "business", "data");
    } else if (await this.exists("src/features") || await this.exists("src/modules")) {
      structure = "feature-based";
      layers.push("features", "shared", "core");
    } else if (await this.exists("src/domain")) {
      structure = "domain-driven";
      layers.push("domain", "application", "infrastructure");
    } else if (hasPagesFolder && hasAppFolder) {
      structure = "Next.js App Router";
      layers.push("ui", "api", "data");
    } else {
      structure = "flat";
      layers.push("components", "utils", "services");
    }

    return { type, structure, layers };
  }

  /**
   * Analyze design patterns and code patterns
   */
  private async analyzePatterns(): Promise<ProjectAnalysis["patterns"]> {
    const design: string[] = [];
    const architectural: string[] = [];
    const code: string[] = [];

    // Check for common patterns
    if (await this.hasPattern("factory")) design.push("Factory Pattern");
    if (await this.hasPattern("singleton")) design.push("Singleton Pattern");
    if (await this.hasPattern("observer")) design.push("Observer Pattern");
    if (await this.hasPattern("builder")) design.push("Builder Pattern");

    // Architectural patterns
    if (await this.exists("src/repositories") || await this.hasPattern("repository")) {
      architectural.push("Repository Pattern");
    }
    if (await this.exists("src/services") || await this.hasPattern("service")) {
      architectural.push("Service Layer");
    }
    if (await this.hasPattern("middleware")) {
      architectural.push("Middleware Pattern");
    }

    // Code patterns
    if (await this.hasPattern("async|await")) code.push("Async/Await");
    if (await this.hasPattern("useState|useEffect")) code.push("React Hooks");
    if (await this.hasPattern("Promise")) code.push("Promises");

    return { design, architectural, code };
  }

  /**
   * Analyze tech stack
   */
  private async analyzeTechStack(): Promise<ProjectAnalysis["tech"]> {
    const languages: string[] = [];
    const frameworks: string[] = [];
    const libraries: string[] = [];
    const tools: string[] = [];

    try {
      const packageJson = await this.readJson("package.json");
      if (packageJson) {
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        // Detect languages
        if (deps.typescript) languages.push("TypeScript");
        if (await this.hasFiles("*.js")) languages.push("JavaScript");
        if (await this.hasFiles("*.py")) languages.push("Python");

        // Detect frameworks
        if (deps.next) frameworks.push("Next.js");
        if (deps.react) frameworks.push("React");
        if (deps.vue) frameworks.push("Vue");
        if (deps.express) frameworks.push("Express");
        if (deps["@nestjs/core"]) frameworks.push("NestJS");

        // Detect libraries
        Object.keys(deps).forEach((dep) => {
          if (!dep.startsWith("@types/") && !frameworks.includes(dep)) {
            libraries.push(dep);
          }
        });

        // Detect tools
        if (deps.eslint || packageJson.devDependencies?.eslint) tools.push("ESLint");
        if (deps.prettier) tools.push("Prettier");
        if (deps.jest) tools.push("Jest");
        if (deps.webpack) tools.push("Webpack");
        if (deps.vite) tools.push("Vite");
      }
    } catch (error) {
      // package.json not found or invalid
    }

    return { languages, frameworks, libraries, tools };
  }

  /**
   * Analyze important files
   */
  private async analyzeFiles(): Promise<ProjectAnalysis["files"]> {
    const entry: string[] = [];
    const config: string[] = [];
    const important: string[] = [];
    const tests: string[] = [];

    // Entry points
    const entryPoints = [
      "src/index.ts",
      "src/index.js",
      "src/main.ts",
      "src/app.ts",
      "app/page.tsx",
      "pages/index.tsx",
    ];
    for (const file of entryPoints) {
      if (await this.exists(file)) entry.push(file);
    }

    // Config files
    const configFiles = [
      "tsconfig.json",
      "next.config.js",
      "vite.config.ts",
      ".env",
      "package.json",
    ];
    for (const file of configFiles) {
      if (await this.exists(file)) config.push(file);
    }

    // Important files
    const importantFiles = ["README.md", "CONTRIBUTING.md", "LICENSE"];
    for (const file of importantFiles) {
      if (await this.exists(file)) important.push(file);
    }

    // Test files
    if (await this.exists("tests") || await this.exists("__tests__")) {
      tests.push("tests/", "__tests__/");
    }

    return { entry, config, important, tests };
  }

  /**
   * Analyze coding conventions
   */
  private async analyzeConventions(): Promise<ProjectAnalysis["conventions"]> {
    let naming = "camelCase"; // default
    let fileStructure = "type-based";
    let imports = "relative";
    let exports = "named";

    // Check ESLint config for naming conventions
    try {
      const eslintrc = await this.readJson(".eslintrc.json");
      if (eslintrc?.rules?.["camelcase"]) naming = "camelCase";
      // Add more convention checks
    } catch {
      // No ESLint config
    }

    // Check file structure
    if (await this.exists("src/features")) {
      fileStructure = "feature-based";
    } else if (await this.exists("src/components") && await this.exists("src/utils")) {
      fileStructure = "type-based";
    }

    return { naming, fileStructure, imports, exports };
  }

  /**
   * Analyze risks and sensitive areas
   */
  private async analyzeRisks(): Promise<ProjectAnalysis["risks"]> {
    const areas: string[] = [];
    const warnings: string[] = [];
    let level: "low" | "medium" | "high" = "low";

    // Check for critical files
    if (await this.exists("database")) {
      areas.push("Database operations");
      warnings.push("Careful with database migrations");
      level = "medium";
    }

    if (await this.exists("auth")) {
      areas.push("Authentication/Authorization");
      warnings.push("Don't modify auth logic without thorough testing");
      level = "high";
    }

    if (await this.exists("payment") || await this.exists("billing")) {
      areas.push("Payment processing");
      warnings.push("Critical: Payment logic requires extra care");
      level = "high";
    }

    // Check for production code
    if (await this.hasPattern("process.env.NODE_ENV === 'production'")) {
      areas.push("Production environment checks");
      warnings.push("Be careful with environment-specific code");
    }

    return { level, areas, warnings };
  }

  /**
   * Create comprehensive documentation
   */
  async createDocumentation(analysis: ProjectAnalysis): Promise<string> {
    const lines: string[] = [];

    lines.push("# Project Analysis & Documentation");
    lines.push("");
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push(`**Project:** ${path.basename(this.projectRoot)}`);
    lines.push("");

    // Architecture
    lines.push("## 🏗️ Architecture");
    lines.push("");
    lines.push(`**Type:** ${analysis.architecture.type}`);
    lines.push(`**Structure:** ${analysis.architecture.structure}`);
    lines.push(`**Layers:**`);
    analysis.architecture.layers.forEach((layer) => {
      lines.push(`- ${layer}`);
    });
    lines.push("");

    // Tech Stack
    lines.push("## 💻 Tech Stack");
    lines.push("");
    if (analysis.tech.languages.length > 0) {
      lines.push(`**Languages:** ${analysis.tech.languages.join(", ")}`);
    }
    if (analysis.tech.frameworks.length > 0) {
      lines.push(`**Frameworks:** ${analysis.tech.frameworks.join(", ")}`);
    }
    if (analysis.tech.tools.length > 0) {
      lines.push(`**Tools:** ${analysis.tech.tools.join(", ")}`);
    }
    lines.push("");

    // Patterns
    lines.push("## 🎨 Patterns & Conventions");
    lines.push("");
    if (analysis.patterns.design.length > 0) {
      lines.push("**Design Patterns:**");
      analysis.patterns.design.forEach((p) => lines.push(`- ${p}`));
    }
    if (analysis.patterns.architectural.length > 0) {
      lines.push("**Architectural Patterns:**");
      analysis.patterns.architectural.forEach((p) => lines.push(`- ${p}`));
    }
    lines.push("");
    lines.push("**Conventions:**");
    lines.push(`- Naming: ${analysis.conventions.naming}`);
    lines.push(`- File Structure: ${analysis.conventions.fileStructure}`);
    lines.push(`- Imports: ${analysis.conventions.imports}`);
    lines.push("");

    // Important Files
    lines.push("## 📁 Key Files");
    lines.push("");
    if (analysis.files.entry.length > 0) {
      lines.push("**Entry Points:**");
      analysis.files.entry.forEach((f) => lines.push(`- ${f}`));
    }
    if (analysis.files.config.length > 0) {
      lines.push("**Configuration:**");
      analysis.files.config.forEach((f) => lines.push(`- ${f}`));
    }
    lines.push("");

    // Risks & Warnings
    lines.push("## ⚠️ Risk Assessment");
    lines.push("");
    lines.push(`**Risk Level:** ${analysis.risks.level.toUpperCase()}`);
    if (analysis.risks.areas.length > 0) {
      lines.push("");
      lines.push("**Sensitive Areas:**");
      analysis.risks.areas.forEach((area) => lines.push(`- ${area}`));
    }
    if (analysis.risks.warnings.length > 0) {
      lines.push("");
      lines.push("**Warnings:**");
      analysis.risks.warnings.forEach((warning) => lines.push(`- ⚠️  ${warning}`));
    }
    lines.push("");

    // Development Guidelines
    lines.push("## 📋 Development Guidelines");
    lines.push("");
    lines.push("**When making changes:**");
    lines.push(`1. Follow ${analysis.conventions.naming} naming convention`);
    lines.push(`2. Maintain ${analysis.conventions.fileStructure} structure`);
    lines.push("3. Write tests for new features");
    lines.push("4. Update documentation");
    lines.push("");
    if (analysis.risks.level !== "low") {
      lines.push("**⚠️  CRITICAL: High-risk areas detected**");
      lines.push("Always review changes carefully before committing!");
      lines.push("");
    }

    return lines.join("\n");
  }

  // Helper methods
  private async exists(pathStr: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.projectRoot, pathStr));
      return true;
    } catch {
      return false;
    }
  }

  private async hasFiles(pattern: string): Promise<boolean> {
    // Simple check - in real implementation, use glob
    return false;
  }

  private async hasPattern(pattern: string): Promise<boolean> {
    // Simple check - in real implementation, search files
    return false;
  }

  private async readJson(filePath: string): Promise<any> {
    try {
      const content = await fs.readFile(
        path.join(this.projectRoot, filePath),
        "utf-8"
      );
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
}
