/**
 * TurnApp API Service - Backend Communication
 * 
 * Handles communication with TurnApp Shopify Backend
 * Loads shop configuration and proxies Storefront API calls
 */

import Config from 'react-native-config';
import { TurnAppConfig, ProductListResponse } from '../types';

export class TurnAppAPI {
  private apiUrl: string;
  private shopDomain: string;

  constructor(shopDomain: string) {
    this.apiUrl = Config.TURNAPP_API_URL || 'http://localhost:3000';
    this.shopDomain = shopDomain;
  }

  /**
   * Load Shop Configuration from TurnApp Backend
   * 
   * GET /api/config?shop=SHOP_DOMAIN
   * Returns branding, theme, and storefront endpoint
   */
  async loadConfig(): Promise<TurnAppConfig> {
    try {
      const url = `${this.apiUrl}/api/config?shop=${encodeURIComponent(this.shopDomain)}`;
      
      console.log('Loading TurnApp config from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Config API Error: ${response.status} ${response.statusText}`);
      }

      const config: TurnAppConfig = await response.json();
      
      console.log('TurnApp config loaded:', {
        shop: config.shop,
        brandName: config.branding.brandName,
        appVersion: config.appVersion
      });
      
      return config;
      
    } catch (error) {
      console.error('Failed to load TurnApp config:', error);
      throw new Error(`Could not load shop configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load Products via TurnApp Backend Proxy
   * 
   * GET /api/products?shop=SHOP_DOMAIN&limit=20
   * Returns products from Shopify Storefront API via backend proxy
   */
  async loadProducts(limit: number = 20): Promise<ProductListResponse> {
    try {
      const url = `${this.apiUrl}/api/products?shop=${encodeURIComponent(this.shopDomain)}&limit=${limit}`;
      
      console.log('Loading products from TurnApp proxy:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Products API Error: ${response.status} ${response.statusText}`);
      }

      const products: ProductListResponse = await response.json();
      
      console.log(`Loaded ${products.data.products.edges.length} products`);
      
      return products;
      
    } catch (error) {
      console.error('Failed to load products:', error);
      throw new Error(`Could not load products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Shopify Checkout URL for Product
   * 
   * Creates checkout with variant ID and returns webUrl
   */
  async getCheckoutUrl(variantId: string, quantity: number = 1): Promise<string> {
    try {
      // Use Shopify's direct checkout URL format
      // This avoids complex checkout creation and works for MVP
      const checkoutUrl = `https://${this.shopDomain}/cart/${encodeURIComponent(variantId)}:${quantity}`;
      
      console.log('Generated checkout URL:', checkoutUrl);
      
      return checkoutUrl;
      
    } catch (error) {
      console.error('Failed to generate checkout URL:', error);
      throw new Error(`Could not create checkout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}