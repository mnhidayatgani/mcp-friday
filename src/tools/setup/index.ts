/**
 * Setup Tool - Core Module
 * Main setup orchestration
 */

import { HybridMemoryManager } from "../../memory/hybrid-manager.js";
import { ProjectDetector } from "../../utils/project-detector.js";
import { ConfigLoader, FridayConfig } from "../../utils/config-loader.js";
import { analyzeProject, formatAnalysisOutput } from "./analysis.js";
import { generateDocumentation } from "./documentation.js";
import { deployCopilotInstructions } from "./deployment.js";

export interface SetupArgs {
  projectType?: "web" | "api" | "cli" | "auto-detect";
  enableRedis?: boolean;
  memoryCapacity?: number;
}

/**
 * Main setup function - orchestrates the entire setup process
 */
export async function setupTool(args: any) {
  const {
    projectType = "auto-detect",
    enableRedis = true,
    memoryCapacity = 100,
  } = args as SetupArgs;

  try {
    const output: string[] = [];
    
    // Header
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

      const analysis = await analyzeProject(config);
      const analysisOutput = formatAnalysisOutput(analysis);
      output.push(...analysisOutput);

      // Create memory structure
      output.push("📁 Creating Memory Structure:");
      await hybridMemory.initialize();
      output.push("   ✅ .github/memory/");
      output.push("   ✅ implementations/");
      output.push("   ✅ decisions/");
      output.push("   ✅ issues/");
      output.push("   ✅ archive/");
      output.push("");

      // Generate documentation
      const docOutput = await generateDocumentation(config.projectRoot, analysis);
      output.push(...docOutput);

      // Deploy copilot instructions
      await deployCopilotInstructions(config.projectRoot);
      output.push("📝 Deployed copilot-instructions.md (AI protocol enforcement)");
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
      output.push("🔌 Memory: Git-only mode");
      output.push("   (Redis optional - add to .env for hybrid mode)");
    }

    output.push("");
    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("✅ FRIDAY Setup Complete!");
    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

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
