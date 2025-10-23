import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "../app/lib/prisma.server";
import { encryptToken, decryptToken } from "../app/lib/crypto.server";
import { createOAuthUrl, exchangeCodeForToken } from "../app/lib/shopify-auth.server";

describe("OAuth Integration Tests", () => {
  const testShop = "oauth-test-shop.myshopify.com";
  const mockApiKey = "test_api_key_12345";
  const mockApiSecret = "test_api_secret_67890";
  const mockScopes = "read_products,write_products";
  const mockRedirectUri = "https://example.com/auth/callback";

  beforeEach(async () => {
    // Clean up test data
    await prisma.shop.deleteMany({
      where: { shopDomain: testShop }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.shop.deleteMany({
      where: { shopDomain: testShop }
    });
  });

  describe("OAuth URL Generation", () => {
    it("creates valid OAuth URL with required parameters", () => {
      const oauthUrl = createOAuthUrl(
        testShop.replace(".myshopify.com", ""),
        mockApiKey,
        mockScopes,
        mockRedirectUri
      );

      expect(oauthUrl).toContain(`https://${testShop}/admin/oauth/authorize`);
      expect(oauthUrl).toContain(`client_id=${mockApiKey}`);
      expect(oauthUrl).toContain(`scope=${encodeURIComponent(mockScopes)}`);
      expect(oauthUrl).toContain(`redirect_uri=${encodeURIComponent(mockRedirectUri)}`);
      expect(oauthUrl).toContain('state=');
    });

    it("generates different state values for CSRF protection", () => {
      const url1 = createOAuthUrl(testShop.replace(".myshopify.com", ""), mockApiKey, mockScopes, mockRedirectUri);
      const url2 = createOAuthUrl(testShop.replace(".myshopify.com", ""), mockApiKey, mockScopes, mockRedirectUri);
      
      const state1 = new URL(url1).searchParams.get('state');
      const state2 = new URL(url2).searchParams.get('state');
      
      expect(state1).not.toBe(state2);
      expect(state1?.length).toBeGreaterThan(10);
    });
  });

  describe("Complete OAuth Flow Simulation", () => {
    it("handles successful installation flow", async () => {
      // Step 1: Shop should not exist initially
      const initialShop = await prisma.shop.findUnique({
        where: { shopDomain: testShop }
      });
      expect(initialShop).toBeNull();

      // Step 2: Simulate successful token exchange and storage
      const mockAccessToken = "shpat_test_token_123456789abcdef";
      const encryptedToken = encryptToken(mockAccessToken);

      // Step 3: Create shop record as OAuth callback would
      await prisma.shop.create({
        data: {
          shopDomain: testShop,
          accessTokenEnc: encryptedToken,
          installedAt: new Date(),
          settings: JSON.stringify({
            brandName: "OAuth Test Store",
            primaryColor: "#007C3B"
          })
        }
      });

      // Step 4: Verify shop was created correctly
      const installedShop = await prisma.shop.findUnique({
        where: { shopDomain: testShop }
      });

      expect(installedShop).toBeTruthy();
      expect(installedShop?.shopDomain).toBe(testShop);
      expect(installedShop?.installedAt).toBeTruthy();
      expect(installedShop?.uninstalledAt).toBeNull();

      // Step 5: Verify token can be decrypted
      const decryptedToken = decryptToken(installedShop!.accessTokenEnc);
      expect(decryptedToken).toBe(mockAccessToken);

      // Step 6: Verify settings were stored properly
      const settings = JSON.parse(installedShop?.settings || "{}");
      expect(settings.brandName).toBe("OAuth Test Store");
    });

    it("handles reinstallation (shop already exists)", async () => {
      // Step 1: Create existing shop (previously installed)
      const oldToken = "shpat_old_token_123";
      const oldEncryptedToken = encryptToken(oldToken);
      const uninstallDate = new Date("2024-01-01");
      
      await prisma.shop.create({
        data: {
          shopDomain: testShop,
          accessTokenEnc: oldEncryptedToken,
          installedAt: new Date("2023-12-01"),
          uninstalledAt: uninstallDate,
          settings: JSON.stringify({ brandName: "Old Store Name" })
        }
      });

      // Step 2: Simulate reinstallation with new token
      const newToken = "shpat_new_token_456";
      const newEncryptedToken = encryptToken(newToken);

      await prisma.shop.update({
        where: { shopDomain: testShop },
        data: {
          accessTokenEnc: newEncryptedToken,
          uninstalledAt: null, // Clear uninstall timestamp
          updatedAt: new Date(),
        }
      });

      // Step 3: Verify reinstallation
      const reinstalledShop = await prisma.shop.findUnique({
        where: { shopDomain: testShop }
      });

      expect(reinstalledShop).toBeTruthy();
      expect(reinstalledShop?.uninstalledAt).toBeNull();
      
      const decryptedToken = decryptToken(reinstalledShop!.accessTokenEnc);
      expect(decryptedToken).toBe(newToken);
      expect(decryptedToken).not.toBe(oldToken);
    });
  });

  describe("Token Exchange Error Handling", () => {
    it("handles network errors gracefully", async () => {
      // Test exchangeCodeForToken with invalid shop domain
      const result = await exchangeCodeForToken(
        "invalid-shop-domain",
        "test_code",
        mockApiKey,
        mockApiSecret
      );

      expect(result).toBeNull();
    });

    it("handles invalid API credentials", async () => {
      // Note: This will make a real API call and should fail with invalid credentials
      const result = await exchangeCodeForToken(
        testShop,
        "invalid_code",
        "invalid_api_key",
        "invalid_api_secret"
      );

      expect(result).toBeNull();
    });
  });

  describe("Security Validations", () => {
    it("validates shop domain format", () => {
      const invalidDomains = [
        "invalid-shop",
        "shop.example.com",
        "",
        "shop-.myshopify.com",
        "-shop.myshopify.com",
        ".myshopify.com",
        "shop..myshopify.com"
      ];

      invalidDomains.forEach(domain => {
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const isValid = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.myshopify\.com$/.test(cleanDomain);
        expect(isValid).toBe(false);
      });

      const validDomains = [
        "test-shop.myshopify.com",
        "shop123.myshopify.com",
        "a.myshopify.com",
        "test-shop-2024.myshopify.com"
      ];

      validDomains.forEach(domain => {
        const isValid = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.myshopify\.com$/.test(domain);
        expect(isValid).toBe(true);
      });
    });

    it("ensures encrypted tokens are different for same input", () => {
      const token = "shpat_same_token_123";
      const encrypted1 = encryptToken(token);
      const encrypted2 = encryptToken(token);

      expect(encrypted1).not.toBe(encrypted2);
      
      // But both should decrypt to the same value
      expect(decryptToken(encrypted1)).toBe(token);
      expect(decryptToken(encrypted2)).toBe(token);
    });

    it("prevents empty tokens from being encrypted", () => {
      expect(() => encryptToken("")).toThrow();
    });
  });

  describe("Database Constraints", () => {
    it("enforces unique shop domain constraint", async () => {
      const tokenData = encryptToken("shpat_test_123");

      // Create first shop
      await prisma.shop.create({
        data: {
          shopDomain: testShop,
          accessTokenEnc: tokenData,
          installedAt: new Date(),
          settings: "{}"
        }
      });

      // Attempt to create duplicate should fail
      await expect(
        prisma.shop.create({
          data: {
            shopDomain: testShop,
            accessTokenEnc: tokenData,
            installedAt: new Date(),
            settings: "{}"
          }
        })
      ).rejects.toThrow();
    });

    it("allows upsert for existing shops", async () => {
      const initialToken = encryptToken("shpat_initial_123");
      const updatedToken = encryptToken("shpat_updated_456");

      // Create initial shop
      await prisma.shop.create({
        data: {
          shopDomain: testShop,
          accessTokenEnc: initialToken,
          installedAt: new Date(),
          settings: JSON.stringify({ version: "1" })
        }
      });

      // Upsert should update existing record
      await prisma.shop.upsert({
        where: { shopDomain: testShop },
        update: {
          accessTokenEnc: updatedToken,
          settings: JSON.stringify({ version: "2" })
        },
        create: {
          shopDomain: testShop,
          accessTokenEnc: updatedToken,
          installedAt: new Date(),
          settings: JSON.stringify({ version: "2" })
        }
      });

      const shop = await prisma.shop.findUnique({
        where: { shopDomain: testShop }
      });

      const settings = JSON.parse(shop?.settings || "{}");
      expect(settings.version).toBe("2");
      expect(decryptToken(shop!.accessTokenEnc)).toBe(decryptToken(updatedToken));
    });
  });
});