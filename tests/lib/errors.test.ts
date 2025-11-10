/**
 * Error Classes Tests
 */

import {
  FridayError,
  SetupError,
  MemoryError,
  ConfigurationError,
  RedisConnectionError,
  ProjectAnalysisError,
} from "../../src/lib/errors";

describe("Error Classes", () => {
  describe("FridayError", () => {
    it("should create error with message", () => {
      const error = new FridayError("Test error");
      expect(error.message).toBe("Test error");
    });

    it("should have correct name", () => {
      const error = new FridayError("Test");
      expect(error.name).toBe("FridayError");
    });

    it("should be instanceof Error", () => {
      const error = new FridayError("Test");
      expect(error).toBeInstanceOf(Error);
    });

    it("should be instanceof FridayError", () => {
      const error = new FridayError("Test");
      expect(error).toBeInstanceOf(FridayError);
    });
  });

  describe("SetupError", () => {
    it("should create error with message", () => {
      const error = new SetupError("Setup failed");
      expect(error.message).toBe("Setup failed");
    });

    it("should have correct name", () => {
      const error = new SetupError("Test");
      expect(error.name).toBe("SetupError");
    });

    it("should be instanceof FridayError", () => {
      const error = new SetupError("Test");
      expect(error).toBeInstanceOf(FridayError);
    });
  });

  describe("MemoryError", () => {
    it("should create error with message", () => {
      const error = new MemoryError("Memory error");
      expect(error.message).toBe("Memory error");
    });

    it("should have correct name", () => {
      const error = new MemoryError("Test");
      expect(error.name).toBe("MemoryError");
    });

    it("should be instanceof FridayError", () => {
      const error = new MemoryError("Test");
      expect(error).toBeInstanceOf(FridayError);
    });
  });

  describe("ConfigurationError", () => {
    it("should create error with message", () => {
      const error = new ConfigurationError("Config error");
      expect(error.message).toBe("Config error");
    });

    it("should have correct name", () => {
      const error = new ConfigurationError("Test");
      expect(error.name).toBe("ConfigurationError");
    });

    it("should be instanceof FridayError", () => {
      const error = new ConfigurationError("Test");
      expect(error).toBeInstanceOf(FridayError);
    });
  });

  describe("RedisConnectionError", () => {
    it("should create error with message", () => {
      const error = new RedisConnectionError("Connection failed");
      expect(error.message).toBe("Connection failed");
    });

    it("should have correct name", () => {
      const error = new RedisConnectionError("Test");
      expect(error.name).toBe("RedisConnectionError");
    });

    it("should be instanceof FridayError", () => {
      const error = new RedisConnectionError("Test");
      expect(error).toBeInstanceOf(FridayError);
    });
  });

  describe("ProjectAnalysisError", () => {
    it("should create error with message", () => {
      const error = new ProjectAnalysisError("Analysis failed");
      expect(error.message).toBe("Analysis failed");
    });

    it("should have correct name", () => {
      const error = new ProjectAnalysisError("Test");
      expect(error.name).toBe("ProjectAnalysisError");
    });

    it("should be instanceof FridayError", () => {
      const error = new ProjectAnalysisError("Test");
      expect(error).toBeInstanceOf(FridayError);
    });
  });

  describe("Error Throwing", () => {
    it("should be catchable", () => {
      expect(() => {
        throw new FridayError("Test");
      }).toThrow("Test");
    });

    it("should preserve stack trace", () => {
      const error = new FridayError("Test");
      expect(error.stack).toBeDefined();
    });

    it("should work with try-catch", () => {
      try {
        throw new MemoryError("Memory issue");
      } catch (e) {
        expect(e).toBeInstanceOf(MemoryError);
        expect((e as MemoryError).message).toBe("Memory issue");
      }
    });
  });
});
