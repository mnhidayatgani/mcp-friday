/**
 * Error Classes
 * Custom error types for FRIDAY
 */

export class FridayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FridayError";
  }
}

export class SetupError extends FridayError {
  constructor(message: string) {
    super(message);
    this.name = "SetupError";
  }
}

export class MemoryError extends FridayError {
  constructor(message: string) {
    super(message);
    this.name = "MemoryError";
  }
}

export class ConfigurationError extends FridayError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class RedisConnectionError extends FridayError {
  constructor(message: string) {
    super(message);
    this.name = "RedisConnectionError";
  }
}

export class ProjectAnalysisError extends FridayError {
  constructor(message: string) {
    super(message);
    this.name = "ProjectAnalysisError";
  }
}
