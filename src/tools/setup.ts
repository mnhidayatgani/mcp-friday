/**
 * FRIDAY Setup Tool
 * One-command project initialization
 */

import { GitMemoryManager } from "../memory/git-manager.js";
import { ProjectDetector } from "../utils/project-detector.js";

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

    // Detect project
    const detector = new ProjectDetector();
    const project = await detector.detect();

    output.push(`🔍 Project Detection:`);
    output.push(`   Name: ${project.name}`);
    output.push(`   Type: ${project.type} (${Math.round(project.confidence * 100)}% confidence)`);
    output.push(`   Tech Stack: ${project.techStack.join(", ") || "Generic"}`);
    output.push("");

    // Initialize Git memory
    const gitMemory = new GitMemoryManager();
    const isInitialized = await gitMemory.isInitialized();

    if (isInitialized) {
      output.push("⚠️  Memory already initialized");
      output.push("   Use existing .github/memory/ structure");
    } else {
      output.push("📁 Creating Memory Structure:");
      await gitMemory.initialize();
      output.push("   ✅ .github/memory/");
      output.push("   ✅ implementations/");
      output.push("   ✅ decisions/");
      output.push("   ✅ issues/");
      output.push("   ✅ archive/");
    }

    output.push("");

    // Create INDEX.md
    await gitMemory.createIndex({
      name: project.name,
      type: project.type,
      techStack: project.techStack,
      created: new Date(),
      updated: new Date(),
    });
    output.push("📝 Created INDEX.md");

    // Create current-state.md
    await gitMemory.createCurrentState(project.name, project.type);
    output.push("📝 Created current-state.md");
    output.push("");

    // Redis configuration
    if (enableRedis) {
      output.push("🔌 Redis Configuration:");
      output.push("   Setup Upstash Redis:");
      output.push("   1. Visit: https://console.upstash.com");
      output.push("   2. Create free Redis database");
      output.push("   3. Copy credentials to .env:");
      output.push("      UPSTASH_REDIS_REST_URL=...");
      output.push("      UPSTASH_REDIS_REST_TOKEN=...");
      output.push("");
    }

    // Configuration
    output.push("⚙️  Configuration:");
    output.push(`   Memory Capacity: ${memoryCapacity} files`);
    output.push(`   Redis: ${enableRedis ? "Enabled" : "Disabled"}`);
    output.push("");

    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("✅ FRIDAY Setup Complete!");
    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("");
    output.push(`Project: ${project.name}`);
    output.push(`Type: ${project.type}`);
    output.push(`Memory: ${enableRedis ? "Hybrid (Git + Redis)" : "Git only"}`);
    output.push("");
    output.push("🤖 FRIDAY is now active and ready to assist.");
    output.push("");
    output.push("Next steps:");
    output.push("1. Configure Upstash Redis (if enabled)");
    output.push("2. Start developing with full context");
    output.push("3. FRIDAY will track all changes automatically");
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
          text: `❌ Setup failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
