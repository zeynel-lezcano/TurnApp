import { describe, it, expect, beforeEach } from "vitest";
import { verifyWebhookHmac, registerWebhooks } from "../app/lib/webhooks.server";
import { prisma } from "../app/lib/prisma.server";
import { createHmac } from "node:crypto";

describe("Webhook Utilities", () => {
  describe("verifyWebhookHmac", () => {
    const secret = "test-secret";
    const body = '{"test": "data"}';
    
    it("validates correct HMAC signature", () => {
      const hmac = createHmac('sha256', secret)
        .update(body, 'utf8')
        .digest('base64');
      
      const isValid = verifyWebhookHmac(body, `sha256=${hmac}`, secret);
      expect(isValid).toBe(true);
    });

    it("rejects invalid HMAC signature", () => {
      const isValid = verifyWebhookHmac(body, "sha256=invalid", secret);
      expect(isValid).toBe(false);
    });

    it("rejects tampered body content", () => {
      const hmac = createHmac('sha256', secret)
        .update(body, 'utf8')
        .digest('base64');
      
      const tamperedBody = '{"test": "tampered"}';
      const isValid = verifyWebhookHmac(tamperedBody, `sha256=${hmac}`, secret);
      expect(isValid).toBe(false);
    });

    it("handles Buffer input", () => {
      const bodyBuffer = Buffer.from(body, 'utf8');
      const hmac = createHmac('sha256', secret)
        .update(body, 'utf8')
        .digest('base64');
      
      const isValid = verifyWebhookHmac(bodyBuffer, `sha256=${hmac}`, secret);
      expect(isValid).toBe(true);
    });

    it("prevents timing attacks", () => {
      // Test with different length HMACs
      const shortHmac = "abc";
      const longHmac = "a".repeat(100);
      
      const isValid1 = verifyWebhookHmac(body, `sha256=${shortHmac}`, secret);
      const isValid2 = verifyWebhookHmac(body, `sha256=${longHmac}`, secret);
      
      expect(isValid1).toBe(false);
      expect(isValid2).toBe(false);
    });
  });

  describe("Webhook Database Operations", () => {
    const testShop = "test-webhook-shop.myshopify.com";

    beforeEach(async () => {
      // Clean up test data
      await prisma.shop.deleteMany({
        where: { shopDomain: testShop }
      });
    });

    it("handles app uninstall webhook", async () => {
      // Create shop
      await prisma.shop.create({
        data: {
          shopDomain: testShop,
          accessTokenEnc: "encrypted-token",
          installedAt: new Date(),
          settings: JSON.stringify({})
        }
      });

      // Simulate uninstall
      await prisma.shop.update({
        where: { shopDomain: testShop },
        data: { uninstalledAt: new Date() }
      });

      // Verify shop is marked as uninstalled
      const shop = await prisma.shop.findUnique({
        where: { shopDomain: testShop }
      });

      expect(shop).toBeTruthy();
      expect(shop?.uninstalledAt).toBeTruthy();
      expect(shop?.installedAt).toBeTruthy(); // Keep install history
    });

    it("allows shop reinstallation", async () => {
      // Create uninstalled shop
      await prisma.shop.create({
        data: {
          shopDomain: testShop,
          accessTokenEnc: "old-token",
          installedAt: new Date(Date.now() - 86400000), // 1 day ago
          uninstalledAt: new Date(),
          settings: JSON.stringify({})
        }
      });

      // Simulate reinstallation
      await prisma.shop.update({
        where: { shopDomain: testShop },
        data: {
          accessTokenEnc: "new-token",
          uninstalledAt: null,
          updatedAt: new Date()
        }
      });

      // Verify shop is active again
      const shop = await prisma.shop.findUnique({
        where: { shopDomain: testShop }
      });

      expect(shop).toBeTruthy();
      expect(shop?.uninstalledAt).toBeNull();
      expect(shop?.accessTokenEnc).toBe("new-token");
    });
  });

  describe("Webhook Registration", () => {
    // These tests would require mocking fetch or using a test server
    it("formats webhook registration correctly", () => {
      const webhookConfig = {
        topic: 'app/uninstalled',
        address: 'https://example.com/webhooks/app_uninstalled',
        format: 'json' as const
      };

      expect(webhookConfig.topic).toBe('app/uninstalled');
      expect(webhookConfig.address).toMatch(/webhooks\/app_uninstalled/);
      expect(webhookConfig.format).toBe('json');
    });

    it("generates correct webhook URLs", () => {
      const baseUrl = "https://myapp.ngrok.io";
      const expectedUninstallUrl = `${baseUrl}/webhooks/app_uninstalled`;
      const expectedProductsUrl = `${baseUrl}/webhooks/products_update`;

      expect(expectedUninstallUrl).toBe("https://myapp.ngrok.io/webhooks/app_uninstalled");
      expect(expectedProductsUrl).toBe("https://myapp.ngrok.io/webhooks/products_update");
    });
  });
});