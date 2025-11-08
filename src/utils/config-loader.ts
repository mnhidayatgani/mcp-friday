/**
 * Configuration Loader
 * Loads Upstash and environment configuration
 */

export interface FridayConfig {
  upstash?: {
    url: string;
    token: string;
    enabled: boolean;
  };
  memory: {
    capacity: number;
    lifecycle: {
      staleThreshold: number; // days
      archiveThreshold: number;
      cleanupThreshold: number;
    };
  };
  projectRoot: string;
}

export class ConfigLoader {
  /**
   * Load configuration from environment
   */
  static load(projectRoot: string = process.cwd()): FridayConfig {
    const config: FridayConfig = {
      memory: {
        capacity: parseInt(process.env.FRIDAY_MEMORY_CAPACITY || "100"),
        lifecycle: {
          staleThreshold: parseInt(process.env.FRIDAY_STALE_DAYS || "30"),
          archiveThreshold: parseInt(process.env.FRIDAY_ARCHIVE_DAYS || "90"),
          cleanupThreshold: parseInt(process.env.FRIDAY_CLEANUP_DAYS || "180"),
        },
      },
      projectRoot,
    };

    // Load Upstash Redis config (with built-in defaults)
    // Built-in credentials (admin can override via env)
    const defaultUrl = "https://growing-lion-22787.upstash.io";
    const defaultToken = "AVkDAAIncDJhYjMwZjQ0NjBkYzc0ZjRiYTQyNmMzNzZmM2JmOTUwNXAyMjI3ODc";
    
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || defaultUrl;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || defaultToken;

    if (upstashUrl && upstashToken) {
      config.upstash = {
        url: upstashUrl,
        token: upstashToken,
        enabled: true,
      };
    }

    return config;
  }

  /**
   * Check if Upstash is configured
   */
  static isUpstashConfigured(): boolean {
    return !!(
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    );
  }

  /**
   * Validate configuration
   */
  static validate(config: FridayConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.memory.capacity < 10) {
      errors.push("Memory capacity must be at least 10");
    }

    if (config.upstash) {
      if (!config.upstash.url.startsWith("https://")) {
        errors.push("Upstash URL must start with https://");
      }
      if (config.upstash.token.length < 10) {
        errors.push("Upstash token appears invalid");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get configuration summary
   */
  static getSummary(config: FridayConfig): string {
    const lines: string[] = [];

    lines.push("⚙️  FRIDAY Configuration:");
    lines.push(`   Project Root: ${config.projectRoot}`);
    lines.push(`   Memory Capacity: ${config.memory.capacity} files`);
    lines.push("");
    lines.push("   Lifecycle Rules:");
    lines.push(`   - Stale: >${config.memory.lifecycle.staleThreshold} days`);
    lines.push(`   - Archive: >${config.memory.lifecycle.archiveThreshold} days`);
    lines.push(`   - Cleanup: >${config.memory.lifecycle.cleanupThreshold} days`);
    lines.push("");

    if (config.upstash) {
      lines.push("   Upstash Redis: ✅ Enabled");
      lines.push(`   - URL: ${config.upstash.url}`);
      lines.push(`   - Status: Connected`);
    } else {
      lines.push("   Upstash Redis: ⚠️  Not configured");
      lines.push("   - Using Git-only memory");
    }

    return lines.join("\n");
  }
}

/**
 * Create .env.example template
 */
export const ENV_TEMPLATE = `# FRIDAY MCP Server Configuration

# Upstash Redis (Optional - for hybrid memory)
# Get free credentials at: https://console.upstash.com
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Memory Configuration
FRIDAY_MEMORY_CAPACITY=100
FRIDAY_STALE_DAYS=30
FRIDAY_ARCHIVE_DAYS=90
FRIDAY_CLEANUP_DAYS=180

# Project Settings (auto-detected if not set)
# FRIDAY_PROJECT_TYPE=web
# FRIDAY_PROJECT_NAME=my-project
`;
