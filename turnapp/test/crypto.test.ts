import { describe, it, expect, beforeEach } from "vitest";
import { encryptToken, decryptToken, testCrypto, generateEncryptionKey } from "../app/lib/crypto.server";

describe("Token Encryption", () => {
  const testTokens = [
    "shp_abcd1234567890",
    "shp_test_token_with_special_chars!@#$%",
    "very-long-token-" + "x".repeat(100),
    "short",
    ""
  ];

  describe("encryptToken", () => {
    it("encrypts tokens successfully", () => {
      for (const token of testTokens.filter(t => t.length > 0)) {
        const encrypted = encryptToken(token);
        
        expect(encrypted).toBeDefined();
        expect(encrypted).not.toBe(token);
        expect(encrypted.length).toBeGreaterThan(96); // IV(32) + minimum encrypted + HMAC(64)
        expect(encrypted).toMatch(/^[0-9a-f]+$/); // Hex format
      }
    });

    it("produces different outputs for same input", () => {
      const token = "shp_test_token_123";
      const encrypted1 = encryptToken(token);
      const encrypted2 = encryptToken(token);
      
      expect(encrypted1).not.toBe(encrypted2); // Different IVs
    });

    it("handles empty string", () => {
      expect(() => encryptToken("")).toThrow();
    });
  });

  describe("decryptToken", () => {
    it("decrypts encrypted tokens correctly", () => {
      for (const token of testTokens.filter(t => t.length > 0)) {
        const encrypted = encryptToken(token);
        const decrypted = decryptToken(encrypted);
        
        expect(decrypted).toBe(token);
      }
    });

    it("fails with invalid format", () => {
      expect(() => decryptToken("invalid")).toThrow("Failed to decrypt token");
      expect(() => decryptToken("abc123")).toThrow("Failed to decrypt token");
    });

    it("fails with tampered data", () => {
      const token = "shp_test_token";
      const encrypted = encryptToken(token);
      
      // Tamper with different parts
      const tamperedIV = "ff" + encrypted.substring(2);
      const tamperedData = encrypted.substring(0, 64) + "ff" + encrypted.substring(66);
      const tamperedHMAC = encrypted.substring(0, encrypted.length - 2) + "ff";
      
      expect(() => decryptToken(tamperedIV)).toThrow();
      expect(() => decryptToken(tamperedData)).toThrow();
      expect(() => decryptToken(tamperedHMAC)).toThrow();
    });
  });

  describe("roundtrip tests", () => {
    it("handles typical Shopify tokens", () => {
      const shopifyTokens = [
        "shp_ca123456789abcdef123456789abcdef",
        "shp_us987654321fedcba987654321fedcba9",
        "shp_eu111111111111111111111111111111"
      ];

      for (const token of shopifyTokens) {
        const encrypted = encryptToken(token);
        const decrypted = decryptToken(encrypted);
        expect(decrypted).toBe(token);
      }
    });

    it("handles special characters", () => {
      const specialTokens = [
        "token-with-dashes",
        "token_with_underscores",
        "token.with.dots",
        "token+with+plus",
        "token=with=equals"
      ];

      for (const token of specialTokens) {
        const encrypted = encryptToken(token);
        const decrypted = decryptToken(encrypted);
        expect(decrypted).toBe(token);
      }
    });
  });

  describe("testCrypto", () => {
    it("validates crypto implementation", () => {
      const result = testCrypto();
      expect(result).toBe(true);
    });
  });

  describe("generateEncryptionKey", () => {
    it("generates valid encryption keys", () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      
      expect(key1).toMatch(/^[0-9a-f]{64}$/); // 256-bit hex key
      expect(key2).toMatch(/^[0-9a-f]{64}$/);
      expect(key1).not.toBe(key2); // Should be random
    });
  });

  describe("key derivation", () => {
    it("works without ENCRYPTION_KEY env var", () => {
      // This test assumes no ENCRYPTION_KEY is set in test environment
      const token = "test-token-for-key-derivation";
      
      const encrypted1 = encryptToken(token);
      const encrypted2 = encryptToken(token);
      
      // Should be able to decrypt with same derived key
      const decrypted1 = decryptToken(encrypted1);
      const decrypted2 = decryptToken(encrypted2);
      
      expect(decrypted1).toBe(token);
      expect(decrypted2).toBe(token);
    });
  });

  describe("performance", () => {
    it("encrypts/decrypts quickly", () => {
      const token = "shp_performance_test_token_123";
      
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        const encrypted = encryptToken(token);
        const decrypted = decryptToken(encrypted);
        expect(decrypted).toBe(token);
      }
      const duration = Date.now() - start;
      
      // Should complete 100 roundtrips in under 1 second
      expect(duration).toBeLessThan(1000);
    });
  });
});