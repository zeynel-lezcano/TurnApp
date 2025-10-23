import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../app/lib/prisma.server";
import { BrandingSettingsSchema, ConfigResponseSchema } from "../app/lib/validation.server";

describe("API Validation", () => {
  describe("BrandingSettingsSchema", () => {
    it("validates valid branding settings", () => {
      const validSettings = {
        brandName: "My Store",
        primaryColor: "#007C3B",
        logoUrl: "https://example.com/logo.png",
        tagline: "Best store ever"
      };

      const result = BrandingSettingsSchema.parse(validSettings);
      expect(result).toEqual(validSettings);
    });

    it("rejects invalid hex color", () => {
      const invalidSettings = {
        brandName: "My Store",
        primaryColor: "red", // Invalid hex
        logoUrl: "",
        tagline: ""
      };

      expect(() => BrandingSettingsSchema.parse(invalidSettings)).toThrow();
    });

    it("rejects empty brand name", () => {
      const invalidSettings = {
        brandName: "",
        primaryColor: "#007C3B",
        logoUrl: "",
        tagline: ""
      };

      expect(() => BrandingSettingsSchema.parse(invalidSettings)).toThrow();
    });

    it("accepts empty optional fields", () => {
      const validSettings = {
        brandName: "My Store",
        primaryColor: "#007C3B",
        logoUrl: "",
        tagline: ""
      };

      const result = BrandingSettingsSchema.parse(validSettings);
      expect(result).toEqual(validSettings);
    });
  });

  describe("ConfigResponseSchema", () => {
    it("validates complete config response", () => {
      const validConfig = {
        shop: "test-shop.myshopify.com",
        branding: {
          brandName: "Test Store",
          primaryColor: "#007C3B",
          logoUrl: "https://example.com/logo.png",
          tagline: "Test tagline"
        },
        storefrontEndpoint: "https://test-shop.myshopify.com/api/2024-01/graphql.json",
        appVersion: "1.0.0"
      };

      const result = ConfigResponseSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });
  });

  describe("Database Integration", () => {
    const testShop = "test-api-shop.myshopify.com";

    beforeEach(async () => {
      // Clean up test data
      await prisma.shop.deleteMany({
        where: { shopDomain: testShop }
      });
    });

    it("can create and retrieve shop settings", async () => {
      const testSettings = {
        brandName: "API Test Store",
        primaryColor: "#FF0000",
        logoUrl: "https://example.com/test-logo.png",
        tagline: "API Test Tagline"
      };

      // Create shop
      await prisma.shop.create({
        data: {
          shopDomain: testShop,
          accessTokenEnc: "encrypted-token",
          installedAt: new Date(),
          settings: JSON.stringify(testSettings)
        }
      });

      // Retrieve shop
      const shop = await prisma.shop.findUnique({
        where: { shopDomain: testShop }
      });

      expect(shop).toBeTruthy();
      const settings = JSON.parse(shop?.settings || "{}");
      expect(settings).toEqual(expect.objectContaining(testSettings));
    });
  });
});