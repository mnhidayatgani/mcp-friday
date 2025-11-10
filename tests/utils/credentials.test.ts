/**
 * Credential Manager Tests
 */

import { CredentialManager } from "../../src/utils/credentials";

describe("CredentialManager", () => {
  describe("encrypt/decrypt", () => {
    it("should encrypt and decrypt text", () => {
      const original = "test string";
      const encrypted = CredentialManager.encrypt(original);
      const decrypted = CredentialManager.decrypt(encrypted);
      
      expect(decrypted).toBe(original);
    });

    it("should produce different encrypted values", () => {
      const text1 = "hello";
      const text2 = "world";
      
      const encrypted1 = CredentialManager.encrypt(text1);
      const encrypted2 = CredentialManager.encrypt(text2);
      
      expect(encrypted1).not.toBe(encrypted2);
    });

    it("should handle empty string", () => {
      const encrypted = CredentialManager.encrypt("");
      const decrypted = CredentialManager.decrypt(encrypted);
      
      expect(decrypted).toBe("");
    });

    it("should handle special characters", () => {
      const original = "test@#$%^&*()";
      const encrypted = CredentialManager.encrypt(original);
      const decrypted = CredentialManager.decrypt(encrypted);
      
      expect(decrypted).toBe(original);
    });

    it("should handle long strings", () => {
      const original = "a".repeat(1000);
      const encrypted = CredentialManager.encrypt(original);
      const decrypted = CredentialManager.decrypt(encrypted);
      
      expect(decrypted).toBe(original);
    });

    it("should produce base64 encoded output", () => {
      const encrypted = CredentialManager.encrypt("test");
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/);
    });
  });

  describe("getRedisUrl", () => {
    it("should return valid URL", () => {
      const url = CredentialManager.getRedisUrl();
      
      expect(url).toBeDefined();
      expect(url.length).toBeGreaterThan(0);
    });

    it("should return URL with https protocol", () => {
      const url = CredentialManager.getRedisUrl();
      
      expect(url).toContain("https://");
    });

    it("should return upstash domain", () => {
      const url = CredentialManager.getRedisUrl();
      
      expect(url).toContain("upstash.io");
    });

    it("should be consistent across calls", () => {
      const url1 = CredentialManager.getRedisUrl();
      const url2 = CredentialManager.getRedisUrl();
      
      expect(url1).toBe(url2);
    });
  });

  describe("getRedisToken", () => {
    it("should return valid token", () => {
      const token = CredentialManager.getRedisToken();
      
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
    });

    it("should return token with expected format", () => {
      const token = CredentialManager.getRedisToken();
      
      // Redis tokens are typically alphanumeric
      expect(token).toMatch(/^[A-Za-z0-9]+$/);
    });

    it("should be consistent across calls", () => {
      const token1 = CredentialManager.getRedisToken();
      const token2 = CredentialManager.getRedisToken();
      
      expect(token1).toBe(token2);
    });

    it("should have reasonable length", () => {
      const token = CredentialManager.getRedisToken();
      
      expect(token.length).toBeGreaterThan(10);
      expect(token.length).toBeLessThan(500);
    });
  });

  describe("Security", () => {
    it("should not expose key in encrypted output", () => {
      const encrypted = CredentialManager.encrypt("test");
      
      expect(encrypted).not.toContain("FRIDAY");
      expect(encrypted).not.toContain("MCP");
      expect(encrypted).not.toContain("KEY");
    });

    it("should use XOR cipher consistently", () => {
      const text = "consistent test";
      const encrypted1 = CredentialManager.encrypt(text);
      const encrypted2 = CredentialManager.encrypt(text);
      
      expect(encrypted1).toBe(encrypted2);
    });

    it("should handle ASCII characters consistently", () => {
      const original = "Hello World! 123";
      const encrypted = CredentialManager.encrypt(original);
      const decrypted = CredentialManager.decrypt(encrypted);
      
      expect(decrypted).toBe(original);
    });
  });
});
