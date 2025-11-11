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
import { GitHubScanner } from "./github-scanner.js";
import { ConflictResolver } from "./conflict-resolver.js";
import { CopilotMerger } from "./copilot-merger.js";
import { MemoryStats } from "./memory-stats.js";
import { ExtensionMemoryMigrator } from "./extension-migrator.js";
import { GitHubOptimizer } from "./github-optimizer.js";
import { setupToolV2 } from "./setup-v2.js";

export interface SetupArgs {
  projectType?: "web" | "api" | "cli" | "auto-detect";
  enableRedis?: boolean;
  memoryCapacity?: number;
}

/**
 * Main setup function - uses optimized V2 workflow
 */
export async function setupTool(args: any) {
  // Use V2 optimized workflow
  return await setupToolV2(args);
}

/**
 * Legacy setup function (V1) - kept for reference
 * @deprecated Use setupToolV2 instead
 */
export async function setupToolV1(args: any) {
  const {
    projectType = "auto-detect",
    enableRedis = true,
    memoryCapacity = 100,
  } = args as SetupArgs;

  try {
    const output: string[] = [];
    const memoryStats = new MemoryStats();
    
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

    // Step 0: Detect and migrate extension memory
    output.push("🔍 Step 0: Detecting memory extensions");
    const migrator = new ExtensionMemoryMigrator(config.projectRoot);
    const migrationResult = await migrator.migrateExtensions();
    
    if (migrationResult.detected.length > 0) {
      output.push(`   ✅ Found ${migrationResult.detected.length} extension(s) with memory`);
      migrationResult.detected.forEach(ext => {
        output.push(`      - ${ext.name} (${ext.dataFiles.length} files)`);
      });
      
      if (migrationResult.migrated.length > 0) {
        output.push("");
        output.push(`   📦 Migrated ${migrationResult.migrated.length} file(s)`);
        output.push(`   💾 Total data: ${(migrationResult.totalDataMigrated / 1024).toFixed(2)} KB`);
        
        // Add removal instructions
        const instructions = migrator.generateRemovalInstructions(migrationResult.detected);
        output.push(...instructions);
      }
      
      if (migrationResult.errors.length > 0) {
        output.push("");
        output.push("   ⚠️  Migration warnings:");
        migrationResult.errors.forEach(err => output.push(`      - ${err}`));
      }
    } else {
      output.push("   ℹ️  No memory extensions detected");
    }
    output.push("");

    // Step 1: Optimize .github/ folder structure
    output.push("🔧 Step 1: Optimizing .github/ folder");
    const optimizer = new GitHubOptimizer(config.projectRoot);
    const optimizationResult = await optimizer.optimize();
    const optimizationReport = optimizer.generateReport(optimizationResult);
    output.push(...optimizationReport);

    // Step 2: Scan .github/ folder
    output.push("🔍 Step 2: Scanning .github/ folder");
    const scanner = new GitHubScanner(config.projectRoot);
    const scanResult = await scanner.scan();
    output.push("");

    // Step 3: Resolve conflicts
    if (scanResult.conflicts.length > 0) {
      output.push("⚙️  Step 3: Resolving conflicts");
      const resolver = new ConflictResolver(config.projectRoot);
      await resolver.resolveConflicts(scanResult.conflicts);
      output.push("");
    }

    // Step 4: Merge/Create copilot-instructions.md
    output.push("📝 Step 4: Configuring AI protocol");
    const merger = new CopilotMerger(config.projectRoot);
    const existingInstructions = await scanner.readCopilotInstructions();
    await merger.merge(existingInstructions);
    output.push("");

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
    output.push("");
    output.push("Good evening, Sir. FRIDAY is now operational.");
    output.push("");
    output.push("I've analyzed your project and established memory systems.");
    output.push("All protocols are active. I'm ready to assist with development.");
    output.push("");
    output.push("You may address me anytime by saying 'Hey FRIDAY' or simply 'FRIDAY'.");
    output.push("I shall provide project status and development recommendations upon request.");
    output.push("");
    
    // Add memory statistics
    output.push(memoryStats.getSummary());

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
