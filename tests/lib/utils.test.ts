/**
 * Utility Functions Tests
 */

import { formatDate, generateId, safeJsonParse, sanitiseFilename, formatFileSize, delay, retry } from "../../src/lib/utils";

describe("Utility Functions", () => {
  describe("formatDate", () => {
    it("should format date to YYYY-MM-DD", () => {
      const date = new Date("2025-01-15T10:30:00Z");
      expect(formatDate(date)).toBe("2025-01-15");
    });

    it("should use current date if none provided", () => {
      const result = formatDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("generateId", () => {
    it("should generate unique ID", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it("should include prefix", () => {
      const id = generateId("test");
      expect(id).toContain("test-");
    });

    it("should generate ID without prefix", () => {
      const id = generateId();
      expect(id).not.toContain("undefined");
    });

    it("should include timestamp", () => {
      const before = Date.now();
      const id = generateId();
      const timestamp = parseInt(id.split("-")[0]);
      expect(timestamp).toBeGreaterThanOrEqual(before);
    });
  });

  describe("safeJsonParse", () => {
    it("should parse valid JSON", () => {
      const result = safeJsonParse('{"key":"value"}', {});
      expect(result).toEqual({ key: "value" });
    });

    it("should return fallback for invalid JSON", () => {
      const fallback = { default: true };
      const result = safeJsonParse("invalid json", fallback);
      expect(result).toBe(fallback);
    });

    it("should handle arrays", () => {
      const result = safeJsonParse('[1,2,3]', []);
      expect(result).toEqual([1, 2, 3]);
    });

    it("should handle null", () => {
      const result = safeJsonParse('null', {});
      expect(result).toBeNull();
    });
  });

  describe("sanitiseFilename", () => {
    it("should convert to lowercase", () => {
      expect(sanitiseFilename("MyFile")).toBe("myfile");
    });

    it("should replace spaces with hyphens", () => {
      expect(sanitiseFilename("my file")).toBe("my-file");
    });

    it("should remove special characters", () => {
      expect(sanitiseFilename("file@#$%name")).toBe("file-name");
    });

    it("should collapse multiple hyphens", () => {
      expect(sanitiseFilename("my---file")).toBe("my-file");
    });

    it("should trim hyphens from edges", () => {
      expect(sanitiseFilename("-myfile-")).toBe("myfile");
    });

    it("should handle complex filenames", () => {
      expect(sanitiseFilename("My File (2023)!.txt")).toBe("my-file-2023-txt");
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes", () => {
      expect(formatFileSize(100)).toBe("100.00 B");
    });

    it("should format kilobytes", () => {
      expect(formatFileSize(1024)).toBe("1.00 KB");
    });

    it("should format megabytes", () => {
      expect(formatFileSize(1048576)).toBe("1.00 MB");
    });

    it("should format gigabytes", () => {
      expect(formatFileSize(1073741824)).toBe("1.00 GB");
    });

    it("should handle decimal values", () => {
      expect(formatFileSize(1536)).toBe("1.50 KB");
    });

    it("should handle zero", () => {
      expect(formatFileSize(0)).toBe("0.00 B");
    });
  });

  describe("delay", () => {
    it("should delay execution", async () => {
      const start = Date.now();
      await delay(50);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(45);
    });

    it("should return promise", () => {
      const result = delay(10);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe("retry", () => {
    it("should succeed on first attempt", async () => {
      const fn = jest.fn().mockResolvedValue("success");
      const result = await retry(fn);
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure", async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error("fail1"))
        .mockRejectedValueOnce(new Error("fail2"))
        .mockResolvedValue("success");

      const result = await retry(fn, 3, 10);
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should throw after max attempts", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("always fails"));

      await expect(retry(fn, 2, 10)).rejects.toThrow("always fails");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should use exponential backoff", async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("success");

      const start = Date.now();
      await retry(fn, 3, 50);
      const duration = Date.now() - start;

      // Should wait ~50ms before retry (1000 * 2^0)
      expect(duration).toBeGreaterThanOrEqual(45);
    });

    it("should handle non-Error exceptions", async () => {
      const fn = jest.fn().mockRejectedValue("string error");

      await expect(retry(fn, 1, 10)).rejects.toThrow();
    });

    it("should use default parameters", async () => {
      const fn = jest.fn().mockResolvedValue("success");

      await retry(fn);
      expect(fn).toHaveBeenCalled();
    });
  });
});
