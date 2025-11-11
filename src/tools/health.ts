/**
 * FRIDAY Health Check Tool
 * Comprehensive system health monitoring
 * Checks: Redis, Git, Memory, Browser availability
 */

import { getBrowserManager } from "../browser/index.js";
import { responseCache } from "../cache/response-cache.js";
import { HybridMemoryManager } from "../memory/hybrid-manager.js";
import { errorHandler } from "../middleware/error-handler.js";
import type { MCPToolResult } from "../types/mcp-tool.js";
import { ConfigLoader } from "../utils/config-loader.js";

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    redis: CheckStatus;
    git: CheckStatus;
    memory: CheckStatus;
    browser: CheckStatus;
    cache: CheckStatus;
    errors: CheckStatus;
  };
  timestamp: string;
}

interface CheckStatus {
  status: "pass" | "warn" | "fail";
  message: string;
  details?: Record<string, unknown>;
}

export async function healthCheckTool(): Promise<MCPToolResult> {
  const output: string[] = [];
  const result: HealthCheckResult = {
    status: "healthy",
    checks: {
      redis: { status: "pass", message: "" },
      git: { status: "pass", message: "" },
      memory: { status: "pass", message: "" },
      browser: { status: "pass", message: "" },
      cache: { status: "pass", message: "" },
      errors: { status: "pass", message: "" },
    },
    timestamp: new Date().toISOString(),
  };

  output.push("🏥 FRIDAY Health Check");
  output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  output.push("");

  // Check Redis
  try {
    const config = ConfigLoader.load();
    const memory = new HybridMemoryManager(config);
    
    if (config.upstash) {
      const health = await memory.getRedisHealth();
      if (health.connected) {
        result.checks.redis = {
          status: "pass",
          message: "Connected to Upstash Redis",
          details: { mode: "hybrid" },
        };
        output.push("✅ Redis: Connected (Hybrid mode)");
      } else {
        result.checks.redis = {
          status: "warn",
          message: health.error || "Connection failed",
          details: { mode: "git-only" },
        };
        output.push(`⚠️  Redis: ${health.error} (Fallback to Git-only)`);
        result.status = "degraded";
      }
    } else {
      result.checks.redis = {
        status: "warn",
        message: "Not configured",
        details: { mode: "git-only" },
      };
      output.push("⚠️  Redis: Not configured (Git-only mode)");
      result.status = "degraded";
    }
  } catch (error) {
    result.checks.redis = {
      status: "fail",
      message: error instanceof Error ? error.message : String(error),
    };
    output.push(`❌ Redis: ${result.checks.redis.message}`);
    result.status = "unhealthy";
  }

  // Check Git repository
  try {
    const config = ConfigLoader.load();
    const memory = new HybridMemoryManager(config);
    const isInit = await memory.isInitialized();
    
    if (isInit) {
      result.checks.git = {
        status: "pass",
        message: "Memory repository initialized",
      };
      output.push("✅ Git: Memory repository ready");
    } else {
      result.checks.git = {
        status: "warn",
        message: "Memory not initialized",
      };
      output.push("⚠️  Git: Run #friday-setup to initialize");
      result.status = "degraded";
    }
  } catch (error) {
    result.checks.git = {
      status: "fail",
      message: error instanceof Error ? error.message : String(error),
    };
    output.push(`❌ Git: ${result.checks.git.message}`);
    result.status = "unhealthy";
  }

  // Check Memory system
  try {
    const config = ConfigLoader.load();
    const memory = new HybridMemoryManager(config);
    const stats = await memory.getStats();
    
    result.checks.memory = {
      status: "pass",
      message: `${stats.git.total} files in memory`,
      details: {
        implementations: stats.git.implementations,
        decisions: stats.git.decisions,
        issues: stats.git.issues,
      },
    };
    output.push(`✅ Memory: ${stats.git.total} files tracked`);
  } catch (error) {
    result.checks.memory = {
      status: "fail",
      message: error instanceof Error ? error.message : String(error),
    };
    output.push(`❌ Memory: ${result.checks.memory.message}`);
    result.status = "unhealthy";
  }

  // Check Browser
  try {
    await getBrowserManager();
    result.checks.browser = {
      status: "pass",
      message: "Playwright browser available",
    };
    output.push("✅ Browser: Chromium ready");
  } catch (error) {
    result.checks.browser = {
      status: "warn",
      message: "Browser tools unavailable",
      details: {
        hint: "Run: npx playwright install chromium",
      },
    };
    output.push("⚠️  Browser: Not available (optional)");
  }

  // Check Cache
  const cacheStats = responseCache.getStats();
  result.checks.cache = {
    status: "pass",
    message: `${cacheStats.size} entries, ${cacheStats.hitRate} hit rate`,
    details: cacheStats,
  };
  output.push(`✅ Cache: ${cacheStats.size} entries (${cacheStats.hitRate} hits)`);

  // Check Error Log
  const errorStats = errorHandler.getFailureStats();
  const totalErrors = Array.from(errorStats.values()).reduce((a, b) => a + b, 0);
  
  if (totalErrors === 0) {
    result.checks.errors = {
      status: "pass",
      message: "No recent errors",
    };
    output.push("✅ Errors: None recorded");
  } else if (totalErrors < 5) {
    result.checks.errors = {
      status: "warn",
      message: `${totalErrors} recent error(s)`,
      details: Object.fromEntries(errorStats),
    };
    output.push(`⚠️  Errors: ${totalErrors} recent issue(s)`);
  } else {
    result.checks.errors = {
      status: "fail",
      message: `${totalErrors} errors detected`,
      details: Object.fromEntries(errorStats),
    };
    output.push(`❌ Errors: ${totalErrors} issues require attention`);
    result.status = "unhealthy";
  }

  output.push("");
  output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  switch (result.status) {
    case "healthy":
      output.push("✅ Overall Status: HEALTHY");
      output.push("   All systems operational, Sir.");
      break;
    case "degraded":
      output.push("⚠️  Overall Status: DEGRADED");
      output.push("   Some features limited, but functional.");
      break;
    case "unhealthy":
      output.push("❌ Overall Status: UNHEALTHY");
      output.push("   Critical issues detected, Sir.");
      break;
  }

  output.push("");
  output.push(`Checked at: ${result.timestamp}`);

  return {
    content: [
      {
        type: "text",
        text: output.join("\n"),
      },
    ],
  };
}
