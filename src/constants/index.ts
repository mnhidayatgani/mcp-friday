/**
 * FRIDAY Constants
 * Centralised configuration values
 */

export const FRIDAY_VERSION = "1.0.0";

export const MEMORY_DEFAULTS = {
  CAPACITY: 100,
  STALE_DAYS: 30,
  ARCHIVE_DAYS: 90,
  CLEANUP_DAYS: 180,
} as const;

export const REDIS_DEFAULTS = {
  SESSION_TTL: 86400, // 24 hours in seconds
  KEY_PREFIX: "friday",
} as const;

export const FILE_PATTERNS = {
  TYPESCRIPT: "**/*.ts",
  JAVASCRIPT: "**/*.js",
  MARKDOWN: "**/*.md",
  JSON: "**/*.json",
} as const;

export const MEMORY_FOLDERS = {
  ROOT: ".github/memory",
  IMPLEMENTATIONS: "implementations",
  DECISIONS: "decisions",
  ISSUES: "issues",
  ARCHIVE: "archive",
} as const;

export const DOCUMENTATION_FILES = {
  INDEX: "INDEX.md",
  CURRENT_STATE: "current-state.md",
  PROJECT_ANALYSIS: "PROJECT-ANALYSIS.md",
  ARCHITECTURE: "ARCHITECTURE.md",
  CONVENTIONS: "CONVENTIONS.md",
} as const;

export const PROJECT_TYPES = {
  WEB: "web",
  API: "api",
  CLI: "cli",
  AUTO_DETECT: "auto-detect",
} as const;

export const RISK_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;
