/**
 * TypeScript Interfaces für turn2app Mobile Demo
 * 
 * Typen basierend auf turn2app Backend APIs und Shopify Storefront
 */

/**
 * turn2app Config Response - /api/config Endpoint
 */
export interface Turn2AppConfig {
  shop: string;
  branding: BrandingConfig;
  storefrontEndpoint: string;
  appVersion: string;
}

/**
 * Shop Branding Configuration
 */
export interface BrandingConfig {
  brandName: string;
  primaryColor: string;
  logoUrl?: string;
  tagline?: string;
}

/**
 * Shopify Product (from Storefront API)
 */
export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  images: {
    edges: Array<{
      node: {
        url: string;
        altText?: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
}

/**
 * Product List Response
 */
export interface ProductListResponse {
  data: {
    products: {
      edges: Array<{
        node: ShopifyProduct;
      }>;
    };
  };
}

/**
 * Checkout URL Response
 */
export interface CheckoutResponse {
  data: {
    checkoutCreate: {
      checkout: {
        webUrl: string;
      };
      checkoutUserErrors: Array<{
        field: string[];
        message: string;
      }>;
    };
  };
}