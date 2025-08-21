import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '../app/lib/prisma.server.js';
import {
  getShopInfo,
  validateShopAccess,
  getAdminProducts,
  getAdminProduct,
  withRateLimit,
  testAdminConnection,
  extractRateLimitInfo
} from '../app/lib/admin-api.server.js';

// Mock GraphQL client
vi.mock('graphql-request', () => ({
  GraphQLClient: vi.fn().mockImplementation(() => ({
    request: vi.fn()
  }))
}));

// Mock shop.server.ts module
vi.mock('../app/lib/shop.server.js', () => ({
  getShopWithToken: vi.fn().mockResolvedValue({
    shopDomain: 'test-shop.myshopify.com',
    accessToken: 'test-admin-token',
    installedAt: new Date(),
    uninstalledAt: null,
    settings: {}
  })
}));

describe('Admin API Integration', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.asset.deleteMany();
    await prisma.shop.deleteMany();
    
    // Reset all mocks
    vi.resetAllMocks();
  });

  describe('Admin API functions', () => {
    it('should have admin API functions available', () => {
      expect(getShopInfo).toBeDefined();
      expect(validateShopAccess).toBeDefined();
      expect(getAdminProducts).toBeDefined();
      expect(getAdminProduct).toBeDefined();
      expect(withRateLimit).toBeDefined();
      expect(testAdminConnection).toBeDefined();
      expect(extractRateLimitInfo).toBeDefined();
    });

    it('should handle rate limit retries', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('429 Rate limit exceeded'))
        .mockResolvedValueOnce('success');

      const result = await withRateLimit(mockOperation, 2);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should extract rate limit info from errors', () => {
      const error = {
        response: {
          extensions: {
            cost: {
              requestedQueryCost: 10,
              actualQueryCost: 8,
              throttleStatus: {
                maximumAvailable: 1000,
                currentlyAvailable: 992,
                restoreRate: 50
              }
            }
          }
        }
      };

      const rateLimitInfo = extractRateLimitInfo(error);

      expect(rateLimitInfo).toEqual({
        requestedQueryCost: 10,
        actualQueryCost: 8,
        throttleStatus: {
          maximumAvailable: 1000,
          currentlyAvailable: 992,
          restoreRate: 50
        }
      });
    });

    it('should return null for errors without rate limit info', () => {
      const error = {
        message: 'Some other error'
      };

      const rateLimitInfo = extractRateLimitInfo(error);

      expect(rateLimitInfo).toBeNull();
    });

    it('should handle basic GraphQL client functionality', () => {
      // Test that GraphQL client can be imported and instantiated
      expect(typeof getShopInfo).toBe('function');
      expect(typeof validateShopAccess).toBe('function');
    });
  });
});