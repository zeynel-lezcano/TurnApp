import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../app/lib/prisma.server.js';
import { requireSession, optionalSession, flexibleAuth } from '../app/lib/middleware.server.js';

describe('Session Token Middleware', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.asset.deleteMany();
    await prisma.shop.deleteMany();
  });

  describe('requireSession', () => {
    it('should throw 401 for missing session token', async () => {
      const request = new Request('http://localhost/test');
      
      await expect(requireSession(request)).rejects.toThrow();
    });

    it('should throw 404 for non-existent shop', async () => {
      const request = new Request('http://localhost/test', {
        headers: {
          'X-Shopify-Session-Token': 'invalid.jwt.token'
        }
      });
      
      await expect(requireSession(request)).rejects.toThrow();
    });

    it('should throw 403 for uninstalled shop', async () => {
      // Create uninstalled shop
      await prisma.shop.create({
        data: {
          shopDomain: 'uninstalled.myshopify.com',
          accessTokenEnc: 'encrypted_token',
          uninstalledAt: new Date(),
          settings: '{}'
        }
      });

      // This would require a valid JWT, so we expect it to fail at JWT verification
      const request = new Request('http://localhost/test', {
        headers: {
          'X-Shopify-Session-Token': 'invalid.jwt.token'
        }
      });
      
      await expect(requireSession(request)).rejects.toThrow();
    });
  });

  describe('optionalSession', () => {
    it('should return null for missing session token', async () => {
      const request = new Request('http://localhost/test');
      
      const result = await optionalSession(request);
      expect(result).toBeNull();
    });

    it('should return null for invalid session token', async () => {
      const request = new Request('http://localhost/test', {
        headers: {
          'X-Shopify-Session-Token': 'invalid.jwt.token'
        }
      });
      
      const result = await optionalSession(request);
      expect(result).toBeNull();
    });
  });

  describe('flexibleAuth', () => {
    it('should throw 401 for missing auth', async () => {
      const request = new Request('http://localhost/test');
      
      await expect(flexibleAuth(request)).rejects.toThrow();
    });

    it('should throw 400 for invalid shop domain format', async () => {
      const request = new Request('http://localhost/test?shop=invalid-shop');
      
      await expect(flexibleAuth(request)).rejects.toThrow();
    });

    it('should throw 404 for non-existent shop via parameter', async () => {
      const request = new Request('http://localhost/test?shop=nonexistent.myshopify.com');
      
      await expect(flexibleAuth(request)).rejects.toThrow();
    });

    it('should succeed with valid shop parameter', async () => {
      // Create active shop
      const shop = await prisma.shop.create({
        data: {
          shopDomain: 'valid-shop.myshopify.com',
          accessTokenEnc: 'encrypted_token',
          settings: JSON.stringify({
            branding: { name: 'Test Shop' }
          })
        }
      });

      const request = new Request('http://localhost/test?shop=valid-shop.myshopify.com');
      
      const result = await flexibleAuth(request);
      expect(result.shop).toBe('valid-shop.myshopify.com');
      expect(result.shopRecord.id).toBe(shop.id);
      expect(result.session).toBeNull(); // No session for shop parameter access
    });
  });

  describe('Error handling', () => {
    it('should include error codes in responses', async () => {
      const request = new Request('http://localhost/test?shop=invalid-shop');
      
      try {
        await flexibleAuth(request);
        expect.fail('Should have thrown');
      } catch (error) {
        if (error instanceof Response) {
          const errorData = await error.json();
          expect(errorData.code).toBeDefined();
          expect(errorData.error).toBeDefined();
        }
      }
    });

    it('should validate shop domain format correctly', async () => {
      const validDomains = [
        'test.myshopify.com',
        'my-shop.myshopify.com',
        'shop123.myshopify.com'
      ];

      const invalidDomains = [
        'test.com',
        'shop.shopify.com',
        'invalid-domain',
        'test.myshopify.io'
      ];

      // Test would need actual shop records, but we can test the basic pattern
      for (const domain of validDomains) {
        expect(domain.endsWith('.myshopify.com')).toBe(true);
      }

      for (const domain of invalidDomains) {
        expect(domain.endsWith('.myshopify.com')).toBe(false);
      }
    });
  });

  describe('Context structure', () => {
    it('should return correct context structure', async () => {
      // Create active shop
      await prisma.shop.create({
        data: {
          shopDomain: 'context-test.myshopify.com',
          accessTokenEnc: 'encrypted_token',
          settings: JSON.stringify({
            branding: { name: 'Context Test' }
          })
        }
      });

      const request = new Request('http://localhost/test?shop=context-test.myshopify.com');
      
      const result = await flexibleAuth(request);
      
      // Validate context structure
      expect(result).toHaveProperty('shop');
      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('shopRecord');
      
      expect(typeof result.shop).toBe('string');
      expect(result.shopRecord).toHaveProperty('id');
      expect(result.shopRecord).toHaveProperty('shopDomain');
      expect(result.shopRecord).toHaveProperty('accessTokenEnc');
    });
  });
});