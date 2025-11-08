/**
 * FRIDAY Setup Tool
 * One-command project initialization with hybrid memory
 * Now with deep project analysis
 */

import { HybridMemoryManager } from "../memory/hybrid-manager.js";
import { ProjectDetector } from "../utils/project-detector.js";
import { ConfigLoader } from "../utils/config-loader.js";
import { ProjectAnalyzer } from "../utils/project-analyzer.js";
import { promises as fs } from "fs";
import path from "path";

export interface SetupArgs {
  projectType?: "web" | "api" | "cli" | "auto-detect";
  enableRedis?: boolean;
  memoryCapacity?: number;
}

export async function setupTool(args: any) {
  const {
    projectType = "auto-detect",
    enableRedis = true,
    memoryCapacity = 100,
  } = args as SetupArgs;

  try {
    const output: string[] = [];
    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("🤖 FRIDAY Setup Initiated");
    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("");

    // Load configuration
    const config = ConfigLoader.load();
    const validation = ConfigLoader.validate(config);

    if (!validation.valid) {
      output.push("⚠️  Configuration Issues:");
      validation.errors.forEach(err => output.push(`   - ${err}`));
      output.push("");
    }

    // Detect project
    const detector = new ProjectDetector();
    const project = await detector.detect();

    output.push(`🔍 Project Detection:`);
    output.push(`   Name: ${project.name}`);
    output.push(`   Type: ${project.type} (${Math.round(project.confidence * 100)}% confidence)`);
    output.push(`   Tech Stack: ${project.techStack.join(", ") || "Generic"}`);
    output.push("");

    // Initialize Hybrid Memory
    const hybridMemory = new HybridMemoryManager(config);
    const isInitialized = await hybridMemory.isInitialized();

    if (!isInitialized) {
      // First time setup - perform deep analysis
      output.push("🔬 Deep Project Analysis (First Time Setup)");
      output.push("   Analyzing architecture, patterns, and conventions...");
      output.push("");

      const analyzer = new ProjectAnalyzer(config.projectRoot);
      const analysis = await analyzer.analyze();

      output.push("📊 Analysis Complete:");
      output.push(`   Architecture: ${analysis.architecture.structure}`);
      output.push(`   Patterns: ${analysis.patterns.design.length + analysis.patterns.architectural.length} detected`);
      output.push(`   Tech Stack: ${analysis.tech.frameworks.join(", ") || "Generic"}`);
      output.push(`   Risk Level: ${analysis.risks.level.toUpperCase()}`);
      output.push("");

      if (analysis.risks.warnings.length > 0) {
        output.push("⚠️  Warnings:");
        analysis.risks.warnings.forEach((warning) => {
          output.push(`   - ${warning}`);
        });
        output.push("");
      }

      // Create memory structure
      output.push("📁 Creating Memory Structure:");
      await hybridMemory.initialize();
      output.push("   ✅ .github/memory/");
      output.push("   ✅ implementations/");
      output.push("   ✅ decisions/");
      output.push("   ✅ issues/");
      output.push("   ✅ archive/");
      output.push("");

      // Save project analysis documentation
      const analysisDoc = await analyzer.createDocumentation(analysis);
      const analysisPath = path.join(
        config.projectRoot,
        ".github/memory/PROJECT-ANALYSIS.md"
      );
      await fs.writeFile(analysisPath, analysisDoc);
      output.push("📝 Created PROJECT-ANALYSIS.md (architecture, patterns, risks)");

      // Create architecture reference
      const archRef = await createArchitectureReference(analysis);
      const archPath = path.join(
        config.projectRoot,
        ".github/memory/ARCHITECTURE.md"
      );
      await fs.writeFile(archPath, archRef);
      output.push("📝 Created ARCHITECTURE.md (structure reference)");

      // Create conventions guide
      const conventions = await createConventionsGuide(analysis);
      const convPath = path.join(
        config.projectRoot,
        ".github/memory/CONVENTIONS.md"
      );
      await fs.writeFile(convPath, conventions);
      output.push("📝 Created CONVENTIONS.md (coding standards)");
    } else {
      // Already initialized
      output.push("⚠️  Memory already initialized");
      output.push("   Using existing .github/memory/ structure");
      output.push("   To re-analyze, delete .github/memory/ and run setup again");
    }

    output.push("");

    // Create INDEX.md
    await hybridMemory.createIndex({
      name: project.name,
      type: project.type,
      techStack: project.techStack,
      created: new Date(),
      updated: new Date(),
    });
    output.push("📝 Created INDEX.md");

    // Create current-state.md
    await hybridMemory.createCurrentState(project.name, project.type);
    output.push("📝 Created current-state.md");
    output.push("");

    // Redis status
    const redisEnabled = hybridMemory.isRedisEnabled();
    if (redisEnabled) {
      const health = await hybridMemory.getRedisHealth();
      if (health.connected) {
        output.push("🔌 Upstash Redis: ✅ Connected");
        output.push("   Hybrid memory active (Git + Redis)");
      } else {
        output.push("🔌 Upstash Redis: ⚠️  Connection failed");
        output.push(`   Error: ${health.error}`);
        output.push("   Falling back to Git-only memory");
      }
    } else {
      // Silent fallback to Git-only
      output.push("🔌 Memory: Git-only mode");
      output.push("   (Redis optional - add to .env for hybrid mode)");
    }

    output.push("");

    // Get stats
    const stats = await hybridMemory.getStats();
    output.push("📊 Memory Status:");
    output.push(`   Mode: ${stats.mode}`);
    output.push(`   Git: ${stats.git.total} files`);
    if (stats.redis) {
      output.push(`   Redis: ${stats.redis.memoryKeys} keys`);
    }
    output.push("");

    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("✅ FRIDAY Setup Complete!");
    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("");
    output.push(`Project: ${project.name}`);
    output.push(`Type: ${project.type}`);
    output.push(`Memory: ${stats.mode}`);
    output.push("");
    output.push("🤖 FRIDAY is ready. What would you like to build?");
    output.push("");

    return {
      content: [
        {
          type: "text",
          text: output.join("\n"),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Setup failed: ${errorMessage}\n\nPlease check configuration and try again.`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Create architecture reference document
 */
async function createArchitectureReference(analysis: any): Promise<string> {
  const lines: string[] = [];
  
  lines.push("# Project Architecture Reference");
  lines.push("");
  lines.push("**For AI Assistant: READ THIS BEFORE MAKING CHANGES**");
  lines.push("");
  
  lines.push("## Structure");
  lines.push("");
  lines.push(`This project follows **${analysis.architecture.structure}** architecture.`);
  lines.push("");
  lines.push("**Layers:**");
  analysis.architecture.layers.forEach((layer: string) => {
    lines.push(`- ${layer}`);
  });
  lines.push("");
  
  lines.push("## File Organization");
  lines.push("");
  lines.push(`**Pattern:** ${analysis.conventions.fileStructure}`);
  lines.push("");
  lines.push("When adding new features:");
  if (analysis.conventions.fileStructure === "feature-based") {
    lines.push("- Create new folder in src/features/");
    lines.push("- Keep all related files together");
    lines.push("- Export public API from index");
  } else {
    lines.push("- Place files in appropriate type folders");
    lines.push("- Follow existing naming patterns");
    lines.push("- Maintain separation of concerns");
  }
  lines.push("");
  
  return lines.join("\n");
}

/**
 * Create conventions guide
 */
async function createConventionsGuide(analysis: any): Promise<string> {
  const lines: string[] = [];
  
  lines.push("# Coding Conventions & Standards");
  lines.push("");
  lines.push("**IMPORTANT: Follow these conventions when writing code**");
  lines.push("");
  
  lines.push("## Naming Conventions");
  lines.push("");
  lines.push(`**Style:** ${analysis.conventions.naming}`);
  lines.push("");
  lines.push("Examples:");
  if (analysis.conventions.naming === "camelCase") {
    lines.push("- Variables: `userName`, `isActive`");
    lines.push("- Functions: `getUserData()`, `handleSubmit()`");
    lines.push("- Files: `userService.ts`, `authHelper.ts`");
  }
  lines.push("");
  
  lines.push("## Import/Export Patterns");
  lines.push("");
  lines.push(`**Imports:** ${analysis.conventions.imports}`);
  lines.push(`**Exports:** ${analysis.conventions.exports}`);
  lines.push("");
  
  if (analysis.patterns.architectural.length > 0) {
    lines.push("## Architectural Patterns");
    lines.push("");
    lines.push("This project uses:");
    analysis.patterns.architectural.forEach((pattern: string) => {
      lines.push(`- ${pattern}`);
    });
    lines.push("");
    lines.push("**Follow these patterns when adding new code!**");
    lines.push("");
  }
  
  return lines.join("\n");
}
