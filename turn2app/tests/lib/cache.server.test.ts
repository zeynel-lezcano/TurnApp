/**
 * Tests for cache.server.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCache,
  withCache,
  invalidateShopCache,
  invalidateProductCache,
  checkCacheHealth,
  CacheKeys,
  CacheTTL
} from '../../app/lib/cache.server';

describe('cache.server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clear cache after each test
    const cache = getCache();
    await cache.clear();
    // Restore any mocks that might have been created during tests
    vi.restoreAllMocks();
  });

  describe('CacheKeys', () => {
    it('should generate correct cache keys', () => {
      expect(CacheKeys.products('test.myshopify.com', 'first=10'))
        .toBe('products:test.myshopify.com:first=10');
      
      expect(CacheKeys.config('test.myshopify.com'))
        .toBe('config:test.myshopify.com');
      
      expect(CacheKeys.shopPattern('test.myshopify.com'))
        .toBe('*:test.myshopify.com*');
    });
  });

  describe('Memory Cache', () => {
    it('should get cache instance', () => {
      const cache = getCache();
      expect(cache).toBeDefined();
    });

    it('should set and get values', async () => {
      const cache = getCache();
      const testData = { test: 'value' };
      
      await cache.set('test-key', testData, 60);
      const result = await cache.get('test-key');
      
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent keys', async () => {
      const cache = getCache();
      const result = await cache.get('non-existent');
      
      expect(result).toBeNull();
    });

    it('should expire entries after TTL', async () => {
      const cache = getCache();
      const testData = { test: 'value' };
      
      await cache.set('expire-test', testData, 0.001); // 1ms TTL
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const result = await cache.get('expire-test');
      expect(result).toBeNull();
    });

    it('should delete specific keys', async () => {
      const cache = getCache();
      
      await cache.set('key1', 'value1', 60);
      await cache.set('key2', 'value2', 60);
      
      await cache.delete('key1');
      
      expect(await cache.get('key1')).toBeNull();
      expect(await cache.get('key2')).toBe('value2');
    });

    it('should delete by pattern', async () => {
      const cache = getCache();
      
      await cache.set('products:shop1:data', 'data1', 60);
      await cache.set('products:shop2:data', 'data2', 60);
      await cache.set('config:shop1', 'config1', 60);
      
      await cache.deletePattern('products:shop1:.*');
      
      expect(await cache.get('products:shop1:data')).toBeNull();
      expect(await cache.get('products:shop2:data')).toBe('data2');
      expect(await cache.get('config:shop1')).toBe('config1');
    });

    it('should clear all entries', async () => {
      const cache = getCache();
      
      await cache.set('key1', 'value1', 60);
      await cache.set('key2', 'value2', 60);
      
      await cache.clear();
      
      expect(await cache.get('key1')).toBeNull();
      expect(await cache.get('key2')).toBeNull();
    });
  });

  describe('withCache', () => {
    it('should cache function results', async () => {
      const mockFetcher = vi.fn().mockResolvedValue({ data: 'test' });
      
      // First call should call fetcher
      const result1 = await withCache('test-cache-key', mockFetcher, 60);
      expect(result1).toEqual({ data: 'test' });
      expect(mockFetcher).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const result2 = await withCache('test-cache-key', mockFetcher, 60);
      expect(result2).toEqual({ data: 'test' });
      expect(mockFetcher).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should call fetcher on cache miss', async () => {
      const mockFetcher = vi.fn().mockResolvedValue({ data: 'fresh' });
      
      const result = await withCache('cache-miss-key', mockFetcher, 60);
      
      expect(result).toEqual({ data: 'fresh' });
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    it('should fallback to fetcher on cache error', async () => {
      const mockFetcher = vi.fn().mockResolvedValue({ data: 'fallback' });
      
      // Mock cache to throw error
      const cache = getCache();
      const getSpy = vi.spyOn(cache, 'get').mockRejectedValue(new Error('Cache error'));
      
      const result = await withCache('error-key-isolated', mockFetcher, 60);
      
      expect(result).toEqual({ data: 'fallback' });
      expect(mockFetcher).toHaveBeenCalledTimes(1);
      
      // Clean up the spy to not affect other tests
      getSpy.mockRestore();
    });
  });

  describe('invalidateShopCache', () => {
    it('should invalidate all shop cache entries', async () => {
      const cache = getCache();
      
      // Set up test data
      await cache.set('products:shop1.myshopify.com:data', 'data', 60);
      await cache.set('config:shop1.myshopify.com', 'config', 60);
      await cache.set('products:shop2.myshopify.com:data', 'other', 60);
      
      await invalidateShopCache('shop1.myshopify.com');
      
      // Shop1 cache should be cleared
      expect(await cache.get('products:shop1.myshopify.com:data')).toBeNull();
      expect(await cache.get('config:shop1.myshopify.com')).toBeNull();
      
      // Shop2 cache should remain
      expect(await cache.get('products:shop2.myshopify.com:data')).toBe('other');
    });

    it('should handle invalidation errors gracefully', async () => {
      // Create a fresh cache instance for this test to avoid interference
      const cache = getCache();
      const deletePatternSpy = vi.spyOn(cache, 'deletePattern').mockRejectedValue(new Error('Delete error'));
      
      // Should not throw
      await expect(invalidateShopCache('shop.myshopify.com')).resolves.toBeUndefined();
      
      // Restore the spy to avoid affecting other tests
      deletePatternSpy.mockRestore();
    });
  });

  describe('invalidateProductCache', () => {
    it('should invalidate only product cache entries', async () => {
      const cache = getCache();
      
      // Clear cache to avoid interference from previous tests
      await cache.clear();
      
      // Set up test data
      await cache.set('products:shop1.myshopify.com:page1', 'data1', 60);
      await cache.set('products:shop1.myshopify.com:page2', 'data2', 60);
      await cache.set('config:shop1.myshopify.com', 'config', 60);
      
      await invalidateProductCache('shop1.myshopify.com');
      
      // Product cache should be cleared
      expect(await cache.get('products:shop1.myshopify.com:page1')).toBeNull();
      expect(await cache.get('products:shop1.myshopify.com:page2')).toBeNull();
      
      // Config cache should remain
      expect(await cache.get('config:shop1.myshopify.com')).toBe('config');
    });
  });

  describe('checkCacheHealth', () => {
    it('should return cache health status', async () => {
      const health = await checkCacheHealth();
      
      // Cache health depends on actual cache operations and instance type
      expect(health).toMatchObject({
        working: expect.any(Boolean),
        type: expect.any(String)
      });
      expect(['memory', 'redis', 'unknown']).toContain(health.type);
    });

    it('should return unhealthy status on cache error', async () => {
      const cache = getCache();
      vi.spyOn(cache, 'set').mockRejectedValue(new Error('Cache error'));
      
      const health = await checkCacheHealth();
      
      expect(health.working).toBe(false);
    });
  });

  describe('CacheTTL constants', () => {
    it('should have correct TTL values', () => {
      expect(CacheTTL.PRODUCTS).toBe(60);
      expect(CacheTTL.CONFIG).toBe(300);
      expect(CacheTTL.SHORT).toBe(30);
      expect(CacheTTL.LONG).toBe(3600);
    });
  });
});