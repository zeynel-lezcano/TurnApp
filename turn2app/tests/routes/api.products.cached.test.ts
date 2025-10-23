/**
 * Tests for cached API products endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loader } from '../../app/routes/api.products';

// Mock dependencies
vi.mock('../../app/lib/middleware.server', () => ({
  flexibleAuth: vi.fn(),
  logRequest: vi.fn(),
}));

vi.mock('../../app/lib/storefront.server', () => ({
  fetchProducts: vi.fn(),
  transformProductForMobile: vi.fn(),
  checkStorefrontRateLimit: vi.fn(),
}));

vi.mock('../../app/lib/validation.server', () => ({
  createErrorResponse: vi.fn(),
  ProductsResponseSchema: {
    parse: vi.fn((data) => data),
  },
}));

vi.mock('../../app/lib/cache.server', () => ({
  withCache: vi.fn(),
  CacheKeys: {
    products: vi.fn(),
  },
  CacheTTL: {
    PRODUCTS: 60,
  },
}));

import * as mockFlexibleAuth from '../../app/lib/middleware.server';
import * as mockStorefront from '../../app/lib/storefront.server';
import * as mockValidation from '../../app/lib/validation.server';
import * as mockCache from '../../app/lib/cache.server';

describe('/api/products with cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    vi.mocked(mockFlexibleAuth.flexibleAuth).mockResolvedValue({
      shop: 'test-shop.myshopify.com',
      session: null,
      shopRecord: { id: '1' }
    });
    
    vi.mocked(mockFlexibleAuth.logRequest).mockImplementation(() => {});
    vi.mocked(mockStorefront.checkStorefrontRateLimit).mockReturnValue(true);
    vi.mocked(mockCache.CacheKeys.products).mockReturnValue('products:test-shop.myshopify.com:first=10&after=');
  });

  it('should use cache for repeated requests', async () => {
    const mockProducts = {
      products: [
        {
          id: 'gid://shopify/Product/1',
          title: 'Test Product',
          handle: 'test-product',
          description: 'Test Description',
          image: 'https://example.com/image.jpg',
          images: [{ url: 'https://example.com/image.jpg', altText: 'Test Product' }],
          price: { amount: '29.99', currencyCode: 'USD' },
          variants: [
            {
              id: 'gid://shopify/ProductVariant/1',
              title: 'Default Title',
              price: { amount: '29.99', currencyCode: 'USD' },
              compareAtPrice: null,
              available: true
            }
          ]
        }
      ],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      shop: 'test-shop.myshopify.com',
      total: 1
    };

    // Mock withCache to simulate cache behavior
    let cacheHit = false;
    vi.mocked(mockCache.withCache).mockImplementation(async (key, fetcher) => {
      if (cacheHit) {
        // Simulate cache hit - don't call fetcher
        return mockProducts;
      } else {
        // Simulate cache miss - call fetcher
        cacheHit = true;
        return await fetcher();
      }
    });

    // Mock the actual data fetching
    vi.mocked(mockStorefront.fetchProducts).mockResolvedValue({
      data: {
        products: {
          edges: [
            {
              node: {
                id: 'gid://shopify/Product/1',
                title: 'Test Product',
                handle: 'test-product',
                description: 'Test Description',
                priceRange: {
                  minVariantPrice: { amount: '29.99', currencyCode: 'USD' }
                },
                variants: { edges: [] },
                images: { edges: [] }
              }
            }
          ],
          pageInfo: { hasNextPage: false, hasPreviousPage: false }
        }
      }
    });

    vi.mocked(mockStorefront.transformProductForMobile).mockReturnValue({
      id: 'gid://shopify/Product/1',
      title: 'Test Product',
      handle: 'test-product',
      description: 'Test Description',
      image: 'https://example.com/image.jpg',
      images: [{ url: 'https://example.com/image.jpg', altText: 'Test Product' }],
      price: { amount: '29.99', currency: 'USD' },
      variants: [
        {
          id: 'gid://shopify/ProductVariant/1',
          title: 'Default Title',
          price: { amount: '29.99', currencyCode: 'USD' },
          compareAtPrice: null,
          available: true
        }
      ]
    });

    const request1 = new Request('http://localhost/api/products?first=10');
    const request2 = new Request('http://localhost/api/products?first=10');

    // First request - cache miss
    const response1 = await loader({ request: request1, params: {}, context: {} });
    const data1 = await response1.json();

    // Second request - cache hit
    const response2 = await loader({ request: request2, params: {}, context: {} });
    const data2 = await response2.json();

    expect(data1).toEqual(mockProducts);
    expect(data2).toEqual(mockProducts);
    
    // withCache should be called twice (once for each request)
    expect(mockCache.withCache).toHaveBeenCalledTimes(2);
    
    // But fetchProducts should only be called once (cache miss)
    expect(mockStorefront.fetchProducts).toHaveBeenCalledTimes(1);
  });

  it('should create correct cache key', async () => {
    const mockProducts = {
      products: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      shop: 'test-shop.myshopify.com',
      total: 0
    };

    vi.mocked(mockCache.withCache).mockResolvedValue(mockProducts);

    const request = new Request('http://localhost/api/products?first=20&after=cursor123');
    await loader({ request, params: {}, context: {} });

    expect(mockCache.CacheKeys.products).toHaveBeenCalledWith(
      'test-shop.myshopify.com',
      'first=20&after=cursor123'
    );
  });

  it('should use correct TTL for products cache', async () => {
    const mockProducts = {
      products: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      shop: 'test-shop.myshopify.com',
      total: 0
    };

    vi.mocked(mockCache.withCache).mockResolvedValue(mockProducts);

    const request = new Request('http://localhost/api/products');
    await loader({ request, params: {}, context: {} });

    expect(mockCache.withCache).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function),
      60 // CacheTTL.PRODUCTS
    );
  });

  it('should handle cache errors gracefully', async () => {
    // Mock withCache to throw error, then fallback to direct fetcher call
    vi.mocked(mockCache.withCache).mockImplementation(async (key, fetcher) => {
      // Simulate the real withCache error handling behavior
      try {
        throw new Error('Cache error');
      } catch (error) {
        console.error(`Cache error for key ${key}:`, error);
        return await fetcher();
      }
    });

    vi.mocked(mockStorefront.fetchProducts).mockResolvedValue({
      data: {
        products: {
          edges: [],
          pageInfo: { hasNextPage: false, hasPreviousPage: false }
        }
      }
    });

    const request = new Request('http://localhost/api/products');
    const response = await loader({ request, params: {}, context: {} });

    expect(response.status).toBe(200);
    expect(mockStorefront.fetchProducts).toHaveBeenCalled();
  });

  it('should set correct cache headers', async () => {
    const mockProducts = {
      products: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      shop: 'test-shop.myshopify.com',
      total: 0
    };

    vi.mocked(mockCache.withCache).mockResolvedValue(mockProducts);

    const request = new Request('http://localhost/api/products');
    const response = await loader({ request, params: {}, context: {} });

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
  });
});