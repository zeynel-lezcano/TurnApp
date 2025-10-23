/**
 * Tests for Main App Component
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import App from '../src/App';
import { Turn2AppAPI } from '../src/services/Turn2AppAPI';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  TURN2APP_API_URL: 'http://localhost:3000',
  SHOP_DOMAIN: 'test-shop.myshopify.com',
  DEMO_MODE: 'true',
}));

// Mock Turn2AppAPI
jest.mock('../src/services/Turn2AppAPI');

describe('App', () => {
  const mockTurn2AppAPI = Turn2AppAPI as jest.MockedClass<typeof Turn2AppAPI>;

  beforeEach(() => {
    mockTurn2AppAPI.mockClear();
  });

  it('should render loading state initially', () => {
    const { getByText } = render(<App />);
    expect(getByText('Loading shop data...')).toBeTruthy();
  });

  it('should load and display config data', async () => {
    const mockConfig = {
      shop: 'test-shop.myshopify.com',
      branding: {
        brandName: 'Test Shop',
        primaryColor: '#FF6B35',
        tagline: 'Welcome to our store'
      },
      storefrontEndpoint: 'https://test-shop.myshopify.com/api/2024-01/graphql.json',
      appVersion: '1.0.0'
    };

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

    const mockApiInstance = {
      loadConfig: jest.fn().mockResolvedValue(mockConfig),
      loadProducts: jest.fn().mockResolvedValue(mockProducts),
      getCheckoutUrl: jest.fn().mockResolvedValue('https://checkout.url'),
    };

    mockTurn2AppAPI.mockImplementation(() => mockApiInstance as any);

    const { getByText, queryByText } = render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(queryByText('Loading shop data...')).toBeNull();
    });

    // Check if branding is applied
    expect(getByText('Test Shop')).toBeTruthy();
    expect(getByText('Welcome to our store')).toBeTruthy();

    // Check if products are displayed
    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('29.99 USD')).toBeTruthy();
  });

  it('should handle API errors gracefully', async () => {
    const mockApiInstance = {
      loadConfig: jest.fn().mockRejectedValue(new Error('API Error')),
      loadProducts: jest.fn(),
      getCheckoutUrl: jest.fn(),
    };

    mockTurn2AppAPI.mockImplementation(() => mockApiInstance as any);

    const { getByText, queryByText } = render(<App />);

    await waitFor(() => {
      expect(queryByText('Loading shop data...')).toBeNull();
    });

    expect(getByText('API Error')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
  });

  it('should show demo config when in demo mode and API fails', async () => {
    const mockApiInstance = {
      loadConfig: jest.fn().mockRejectedValue(new Error('Network error')),
      loadProducts: jest.fn().mockRejectedValue(new Error('Network error')),
      getCheckoutUrl: jest.fn(),
    };

    mockTurn2AppAPI.mockImplementation(() => mockApiInstance as any);

    const { getByText, queryByText } = render(<App />);

    await waitFor(() => {
      expect(queryByText('Loading shop data...')).toBeNull();
    });

    // Should show demo branding
    expect(getByText('Demo Shop')).toBeTruthy();
    expect(getByText('Demo Mode - Connect to turn2app Backend')).toBeTruthy();
  });
});