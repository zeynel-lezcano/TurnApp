import { describe, it, expect, beforeEach } from "vitest";
import { verifySessionToken, getShopFromSession } from "../app/lib/session.server";
import { createHmac } from "node:crypto";

describe("Session Token Management", () => {
  const mockApiSecret = "test-secret-key-for-session-tokens";
  const mockApiKey = "test-api-key";
  const mockShop = "test-shop.myshopify.com";
  
  // Mock environment variables
  beforeEach(() => {
    process.env.SHOPIFY_API_SECRET = mockApiSecret;
    process.env.SHOPIFY_API_KEY = mockApiKey;
  });

  function createMockJWT(payload: any): string {
    const header = {
      alg: "HS256",
      typ: "JWT"
    };

    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const data = `${headerB64}.${payloadB64}`;
    const signature = createHmac('sha256', mockApiSecret)
      .update(data)
      .digest('base64url');

    return `${data}.${signature}`;
  }

  describe("verifySessionToken", () => {
    it("validates correct session token", () => {
      const payload = {
        iss: mockShop,
        dest: mockShop,
        aud: mockApiKey,
        sub: "user123",
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        iat: Math.floor(Date.now() / 1000),
        jti: "jwt-id-123",
        sid: "session-id-123"
      };

      const token = createMockJWT(payload);
      const result = verifySessionToken(token);

      expect(result).toBeTruthy();
      expect(result?.iss).toBe(mockShop);
      expect(result?.dest).toBe(mockShop);
      expect(result?.aud).toBe(mockApiKey);
      expect(result?.sub).toBe("user123");
    });

    it("rejects token with invalid signature", () => {
      const payload = {
        iss: mockShop,
        dest: mockShop,
        aud: mockApiKey,
        sub: "user123",
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      };

      const token = createMockJWT(payload);
      const tamperedToken = token.substring(0, token.length - 5) + "XXXXX";
      
      const result = verifySessionToken(tamperedToken);
      expect(result).toBeNull();
    });

    it("rejects expired token", () => {
      const payload = {
        iss: mockShop,
        dest: mockShop,
        aud: mockApiKey,
        sub: "user123",
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        iat: Math.floor(Date.now() / 1000) - 7200  // 2 hours ago
      };

      const token = createMockJWT(payload);
      const result = verifySessionToken(token);
      expect(result).toBeNull();
    });

    it("rejects token with mismatched iss and dest", () => {
      const payload = {
        iss: mockShop,
        dest: "different-shop.myshopify.com",
        aud: mockApiKey,
        sub: "user123",
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      };

      const token = createMockJWT(payload);
      const result = verifySessionToken(token);
      expect(result).toBeNull();
    });

    it("rejects token with missing required fields", () => {
      const payload = {
        iss: mockShop,
        // Missing dest, aud, sub
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      };

      const token = createMockJWT(payload);
      const result = verifySessionToken(token);
      expect(result).toBeNull();
    });

    it("rejects malformed JWT", () => {
      const result1 = verifySessionToken("invalid.jwt");
      const result2 = verifySessionToken("not-a-jwt-at-all");
      const result3 = verifySessionToken("");

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });

    it("handles missing API secret", () => {
      const originalSecret = process.env.SHOPIFY_API_SECRET;
      delete (process.env as any).SHOPIFY_API_SECRET;
      
      // Can't create valid token without secret, but test the verification
      const result = verifySessionToken("invalid.token.here");
      expect(result).toBeNull();
      
      // Restore original value
      process.env.SHOPIFY_API_SECRET = originalSecret;
    });
  });

  describe("getShopFromSession", () => {
    it("extracts shop from valid token", () => {
      const payload = {
        iss: mockShop,
        dest: mockShop,
        aud: mockApiKey,
        sub: "user123",
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      };

      const token = createMockJWT(payload);
      const shop = getShopFromSession(token);
      expect(shop).toBe(mockShop);
    });

    it("returns null for invalid token", () => {
      const shop = getShopFromSession("invalid-token");
      expect(shop).toBeNull();
    });
  });

  describe("JWT encoding/decoding", () => {
    it("correctly handles base64url encoding", () => {
      const testPayload = {
        iss: "test-shop-with-special-chars+/=.myshopify.com",
        dest: "test-shop-with-special-chars+/=.myshopify.com",
        aud: mockApiKey,
        sub: "user123",
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        custom: "value with spaces and symbols +/="
      };

      const token = createMockJWT(testPayload);
      const result = verifySessionToken(token);

      expect(result).toBeTruthy();
      expect(result?.iss).toBe(testPayload.iss);
      expect((result as any).custom).toBe(testPayload.custom);
    });
  });
});