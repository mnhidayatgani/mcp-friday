/**
 * Config Loader Tests
 */

import { ConfigLoader } from "../../src/utils/config-loader";
import { CredentialManager } from "../../src/utils/credentials";

jest.mock("../../src/utils/credentials");

describe("ConfigLoader", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    (CredentialManager.getRedisUrl as jest.Mock).mockReturnValue("");
    (CredentialManager.getRedisToken as jest.Mock).mockReturnValue("");
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("load", () => {
    it("should load default configuration", () => {
      const config = ConfigLoader.load("/test/project");

      expect(config.projectRoot).toBe("/test/project");
      expect(config.memory.capacity).toBe(100);
    });

    it("should use current directory if no root provided", () => {
      const config = ConfigLoader.load();

      expect(config.projectRoot).toBeDefined();
    });

    it("should load Upstash from environment", () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const config = ConfigLoader.load();

      expect(config.upstash).toBeDefined();
      expect(config.upstash?.url).toBe("https://test.upstash.io");
      expect(config.upstash?.token).toBe("test-token");
      expect(config.upstash?.enabled).toBe(true);
    });

    it("should use default credentials when env not set", () => {
      (CredentialManager.getRedisUrl as jest.Mock).mockReturnValue("https://default.upstash.io");
      (CredentialManager.getRedisToken as jest.Mock).mockReturnValue("default-token");

      const config = ConfigLoader.load();

      expect(config.upstash?.url).toBe("https://default.upstash.io");
      expect(config.upstash?.token).toBe("default-token");
    });

    it("should load custom memory capacity", () => {
      process.env.FRIDAY_MEMORY_CAPACITY = "50";

      const config = ConfigLoader.load();

      expect(config.memory.capacity).toBe(50);
    });

    it("should load lifecycle configuration", () => {
      process.env.FRIDAY_STALE_DAYS = "15";
      process.env.FRIDAY_ARCHIVE_DAYS = "60";
      process.env.FRIDAY_CLEANUP_DAYS = "120";

      const config = ConfigLoader.load();

      expect(config.memory.lifecycle.staleThreshold).toBe(15);
      expect(config.memory.lifecycle.archiveThreshold).toBe(60);
      expect(config.memory.lifecycle.cleanupThreshold).toBe(120);
    });

    it("should not set upstash when credentials missing", () => {
      const config = ConfigLoader.load();

      expect(config.upstash).toBeUndefined();
    });
  });

  describe("isUpstashConfigured", () => {
    it("should return true when configured", () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      expect(ConfigLoader.isUpstashConfigured()).toBe(true);
    });

    it("should return false when not configured", () => {
      expect(ConfigLoader.isUpstashConfigured()).toBe(false);
    });

    it("should return false when only URL set", () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";

      expect(ConfigLoader.isUpstashConfigured()).toBe(false);
    });

    it("should return false when only token set", () => {
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      expect(ConfigLoader.isUpstashConfigured()).toBe(false);
    });
  });

  describe("validate", () => {
    it("should validate valid configuration", () => {
      const config = ConfigLoader.load();
      const result = ConfigLoader.validate(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject low memory capacity", () => {
      const config = ConfigLoader.load();
      config.memory.capacity = 5;

      const result = ConfigLoader.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Memory capacity must be at least 10");
    });

    it("should reject invalid upstash URL", () => {
      const config = ConfigLoader.load();
      config.upstash = {
        url: "http://test.upstash.io",
        token: "valid-token-here",
        enabled: true,
      };

      const result = ConfigLoader.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Upstash URL must start with https://");
    });

    it("should reject short upstash token", () => {
      const config = ConfigLoader.load();
      config.upstash = {
        url: "https://test.upstash.io",
        token: "short",
        enabled: true,
      };

      const result = ConfigLoader.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Upstash token appears invalid");
    });

    it("should return multiple errors", () => {
      const config = ConfigLoader.load();
      config.memory.capacity = 5;
      config.upstash = {
        url: "http://test.com",
        token: "abc",
        enabled: true,
      };

      const result = ConfigLoader.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe("getSummary", () => {
    it("should generate summary with upstash", () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const config = ConfigLoader.load("/test/project");
      const summary = ConfigLoader.getSummary(config);

      expect(summary).toContain("FRIDAY Configuration");
      expect(summary).toContain("/test/project");
      expect(summary).toContain("Upstash Redis: ✅ Enabled");
      expect(summary).toContain("https://test.upstash.io");
    });

    it("should generate summary without upstash", () => {
      const config = ConfigLoader.load("/test/project");
      const summary = ConfigLoader.getSummary(config);

      expect(summary).toContain("FRIDAY Configuration");
      expect(summary).toContain("Upstash Redis: ⚠️  Not configured");
      expect(summary).toContain("Git-only memory");
    });

    it("should include memory settings", () => {
      const config = ConfigLoader.load();
      const summary = ConfigLoader.getSummary(config);

      expect(summary).toContain("Memory Capacity: 100 files");
      expect(summary).toContain("Lifecycle Rules:");
      expect(summary).toContain("Stale:");
      expect(summary).toContain("Archive:");
      expect(summary).toContain("Cleanup:");
    });
  });
});
