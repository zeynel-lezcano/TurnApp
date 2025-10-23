/**
 * Tests for turn2app API Service
 */

import { Turn2AppAPI } from '../src/services/Turn2AppAPI';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  TURN2APP_API_URL: 'http://localhost:3000',
  SHOP_DOMAIN: 'test-shop.myshopify.com',
  DEMO_MODE: 'true',
}));

// Mock fetch
global.fetch = jest.fn();

describe('Turn2AppAPI', () => {
  let api: Turn2AppAPI;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    api = new Turn2AppAPI('test-shop.myshopify.com');
    mockFetch.mockClear();
  });

  describe('loadConfig', () => {
    it('should load config successfully', async () => {
      const mockConfig = {
        shop: 'test-shop.myshopify.com',
        branding: {
          brandName: 'Test Shop',
          primaryColor: '#FF6B35',
          logoUrl: 'https://example.com/logo.png',
          tagline: 'Welcome to our store'
        },
        storefrontEndpoint: 'https://test-shop.myshopify.com/api/2024-01/graphql.json',
        appVersion: '1.0.0'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      } as Response);

      const result = await api.loadConfig();

      expect(result).toEqual(mockConfig);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/config?shop=test-shop.myshopify.com',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should handle config API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(api.loadConfig()).rejects.toThrow('Config API Error: 404 Not Found');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.loadConfig()).rejects.toThrow('Could not load shop configuration: Network error');
    });
  });

  describe('loadProducts', () => {
    it('should load products successfully', async () => {
      const mockProducts = {
        data: {
          products: {
            edges: [
              {
                node: {
                  id: 'gid://shopify/Product/123',
                  title: 'Test Product',
                  description: 'A test product',
                  handle: 'test-product',
                  images: {
                    edges: [
                      {
                        node: {
                          url: 'https://example.com/image.jpg',
                          altText: 'Product image'
                        }
                      }
                    ]
                  },
                  variants: {
                    edges: [
                      {
                        node: {
                          id: 'gid://shopify/ProductVariant/456',
                          title: 'Default Title',
                          price: {
                            amount: '29.99',
                            currencyCode: 'USD'
                          },
                          availableForSale: true
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      } as Response);

      const result = await api.loadProducts(20);

      expect(result).toEqual(mockProducts);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products?shop=test-shop.myshopify.com&limit=20',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle products API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(api.loadProducts()).rejects.toThrow('Products API Error: 500 Internal Server Error');
    });
  });

  describe('getCheckoutUrl', () => {
    it('should generate checkout URL correctly', async () => {
      const variantId = 'gid://shopify/ProductVariant/456';
      const quantity = 2;

      const result = await api.getCheckoutUrl(variantId, quantity);

      expect(result).toBe('https://test-shop.myshopify.com/cart/gid%3A%2F%2Fshopify%2FProductVariant%2F456:2');
    });

    it('should use default quantity of 1', async () => {
      const variantId = 'gid://shopify/ProductVariant/456';

      const result = await api.getCheckoutUrl(variantId);

      expect(result).toBe('https://test-shop.myshopify.com/cart/gid%3A%2F%2Fshopify%2FProductVariant%2F456:1');
    });
  });
});