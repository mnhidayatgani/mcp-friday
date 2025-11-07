/**
 * FRIDAY Setup Tool
 * One-command project initialization with hybrid memory
 */

import { HybridMemoryManager } from "../memory/hybrid-manager.js";
import { ProjectDetector } from "../utils/project-detector.js";
import { ConfigLoader } from "../utils/config-loader.js";

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

    if (isInitialized) {
      output.push("⚠️  Memory already initialized");
      output.push("   Using existing .github/memory/ structure");
    } else {
      output.push("📁 Creating Memory Structure:");
      await hybridMemory.initialize();
      output.push("   ✅ .github/memory/");
      output.push("   ✅ implementations/");
      output.push("   ✅ decisions/");
      output.push("   ✅ issues/");
      output.push("   ✅ archive/");
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
    } else if (enableRedis) {
      output.push("🔌 Upstash Redis: ⚠️  Not configured");
      output.push("");
      output.push("   To enable hybrid memory:");
      output.push("   1. Visit: https://console.upstash.com");
      output.push("   2. Create free Redis database");
      output.push("   3. Add to .env:");
      output.push("      UPSTASH_REDIS_REST_URL=...");
      output.push("      UPSTASH_REDIS_REST_TOKEN=...");
    } else {
      output.push("🔌 Upstash Redis: Disabled (Git-only mode)");
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
    output.push("🤖 FRIDAY is now active and ready to assist.");
    output.push("");
    output.push("Next steps:");
    if (!redisEnabled && enableRedis) {
      output.push("1. Configure Upstash Redis for hybrid memory");
      output.push("2. Run #friday-sync to sync existing memory");
    }
    output.push("3. Start developing - FRIDAY will track changes automatically");
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
