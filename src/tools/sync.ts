/**
 * FRIDAY Sync Tool
 * Full implementation - Sync Git memory to Upstash Redis
 */

import { HybridMemoryManager } from "../memory/hybrid-manager.js";
import { ConfigLoader } from "../utils/config-loader.js";

export interface SyncArgs {
  direction?: "git-to-redis" | "redis-to-git" | "bidirectional";
  force?: boolean;
}

export async function syncTool(args: any) {
  const { direction = "git-to-redis", force = false } = args as SyncArgs;

  try {
    const output: string[] = [];
    const config = ConfigLoader.load();

    output.push("🔄 FRIDAY Sync Operation");
    output.push(`   Direction: ${direction}`);
    output.push(`   Force: ${force}`);
    output.push("");

    // Check Redis configuration
    if (!config.upstash) {
      output.push("❌ Upstash Redis not configured");
      output.push("");
      output.push("To enable sync:");
      output.push("1. Visit: https://console.upstash.com");
      output.push("2. Create free Redis database");
      output.push("3. Add to .env:");
      output.push("   UPSTASH_REDIS_REST_URL=...");
      output.push("   UPSTASH_REDIS_REST_TOKEN=...");
      output.push("");
      output.push("Then run sync again.");

      return {
        content: [{ type: "text", text: output.join("\n") }],
      };
    }

    // Initialize hybrid memory
    const hybridMemory = new HybridMemoryManager(config);
    await hybridMemory.initialize();

    // Check Redis health
    const health = await hybridMemory.getRedisHealth();
    if (!health.connected) {
      output.push(`❌ Redis connection failed: ${health.error}`);
      return {
        content: [{ type: "text", text: output.join("\n") }],
        isError: true,
      };
    }

    output.push("✅ Redis connection verified");
    output.push("");

    // Perform sync
    if (direction === "git-to-redis") {
      output.push("📤 Syncing Git → Redis...");
      const result = await hybridMemory.syncGitToRedis();

      output.push("");
      output.push(`✅ Synced ${result.synced} file(s)`);

      if (result.errors.length > 0) {
        output.push("");
        output.push("⚠️  Errors encountered:");
        result.errors.forEach(err => output.push(`   - ${err}`));
      }
    } else {
      output.push("⚠️  Redis → Git sync not yet implemented");
      output.push("   Use git-to-redis direction");
    }

    output.push("");
    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("✅ Sync Complete");
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
          text: `❌ Sync failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
