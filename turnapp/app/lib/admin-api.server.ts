/**
 * Shopify Admin API Client
 * 
 * Provides GraphQL client for Admin API operations including:
 * - Shop validation and metadata
 * - Product queries and management  
 * - Webhook registration
 * - Rate limit handling
 */

import { GraphQLClient } from 'graphql-request';
import { getShopWithToken } from './shop.server.js';

// Admin API version and endpoint
const ADMIN_API_VERSION = '2024-01';

/**
 * Shop information from Admin API
 */
export interface ShopInfo {
  id: string;
  name: string;
  domain: string;
  email: string;
  myshopifyDomain: string;
  plan: {
    displayName: string;
    partnerDevelopment: boolean;
  };
  primaryLocale: string;
  currencyCode: string;
  weightUnit: string;
  timezone: string;
}

/**
 * Product data from Admin API
 */
export interface AdminProduct {
  id: string;
  title: string;
  handle: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  productType: string;
  vendor: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        sku: string;
        price: string;
        compareAtPrice: string | null;
        inventoryQuantity: number;
        availableForSale: boolean;
      };
    }>;
  };
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText: string | null;
        width: number;
        height: number;
      };
    }>;
  };
}

/**
 * Rate limit information from Admin API
 */
export interface RateLimitInfo {
  requestedQueryCost: number;
  actualQueryCost: number;
  throttleStatus: {
    maximumAvailable: number;
    currentlyAvailable: number;
    restoreRate: number;
  };
}

/**
 * GraphQL queries for Admin API
 */
const SHOP_QUERY = `
  query getShop {
    shop {
      id
      name
      domain
      email
      myshopifyDomain
      plan {
        displayName
        partnerDevelopment
      }
      primaryLocale
      currencyCode
      weightUnit
      timezone
    }
  }
`;

const PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          status
          productType
          vendor
          tags
          createdAt
          updatedAt
          variants(first: 10) {
            edges {
              node {
                id
                title
                sku
                price
                compareAtPrice
                inventoryQuantity
                availableForSale
              }
            }
          }
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
    }
  }
`;

const PRODUCT_BY_ID_QUERY = `
  query getProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      status
      productType
      vendor
      tags
      createdAt
      updatedAt
      variants(first: 10) {
        edges {
          node {
            id
            title
            sku
            price
            compareAtPrice
            inventoryQuantity
            availableForSale
          }
        }
      }
      images(first: 5) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

/**
 * Create GraphQL client for Admin API
 */
function createAdminClient(shopDomain: string, accessToken: string): GraphQLClient {
  const endpoint = `https://${shopDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
  
  return new GraphQLClient(endpoint, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    // Enable rate limit handling
    errorPolicy: 'all'
  });
}

/**
 * Get shop information via Admin API
 */
export async function getShopInfo(shopDomain: string): Promise<ShopInfo | null> {
  try {
    const shopData = await getShopWithToken(shopDomain);
    if (!shopData) {
      console.error('Shop not found or inactive:', shopDomain);
      return null;
    }

    const client = createAdminClient(shopDomain, shopData.accessToken);
    
    const response = await client.request<{ shop: ShopInfo }>(SHOP_QUERY);
    
    if (!response.shop) {
      console.error('No shop data returned from Admin API');
      return null;
    }

    return response.shop;

  } catch (error) {
    console.error('Failed to get shop info:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      console.error('Admin API authentication failed for shop:', shopDomain);
    }
    
    return null;
  }
}

/**
 * Validate shop access and permissions
 */
export async function validateShopAccess(shopDomain: string): Promise<boolean> {
  try {
    const shopInfo = await getShopInfo(shopDomain);
    
    if (!shopInfo) {
      return false;
    }

    // Validate domain match
    if (shopInfo.myshopifyDomain !== shopDomain) {
      console.error('Shop domain mismatch:', {
        expected: shopDomain,
        actual: shopInfo.myshopifyDomain
      });
      return false;
    }

    console.log('Shop validation successful:', {
      name: shopInfo.name,
      domain: shopInfo.domain,
      plan: shopInfo.plan.displayName
    });

    return true;

  } catch (error) {
    console.error('Shop validation failed:', error);
    return false;
  }
}

/**
 * Get products from Admin API with pagination
 */
export async function getAdminProducts(
  shopDomain: string,
  first: number = 50,
  after?: string
): Promise<{ products: AdminProduct[], hasNextPage: boolean, endCursor?: string } | null> {
  try {
    const shopData = await getShopWithToken(shopDomain);
    if (!shopData) {
      throw new Error('Shop not found or inactive');
    }

    const client = createAdminClient(shopDomain, shopData.accessToken);
    
    const variables = { first, ...(after && { after }) };
    const response = await client.request<{
      products: {
        edges: Array<{ node: AdminProduct }>;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
      };
    }>(PRODUCTS_QUERY, variables);

    const products = response.products.edges.map(edge => edge.node);
    
    return {
      products,
      hasNextPage: response.products.pageInfo.hasNextPage,
      endCursor: response.products.pageInfo.endCursor
    };

  } catch (error) {
    console.error('Failed to get admin products:', error);
    
    if (error instanceof Error) {
      // Handle specific Shopify API errors
      if (error.message.includes('401')) {
        throw new Error('Admin API authentication failed');
      }
      
      if (error.message.includes('402')) {
        throw new Error('Shop subscription required');
      }
      
      if (error.message.includes('429')) {
        throw new Error('Admin API rate limit exceeded');
      }
    }
    
    return null;
  }
}

/**
 * Get single product by ID from Admin API
 */
export async function getAdminProduct(
  shopDomain: string,
  productId: string
): Promise<AdminProduct | null> {
  try {
    const shopData = await getShopWithToken(shopDomain);
    if (!shopData) {
      throw new Error('Shop not found or inactive');
    }

    const client = createAdminClient(shopDomain, shopData.accessToken);
    
    const response = await client.request<{ product: AdminProduct | null }>(
      PRODUCT_BY_ID_QUERY,
      { id: productId }
    );

    return response.product;

  } catch (error) {
    console.error('Failed to get admin product:', error);
    return null;
  }
}

/**
 * Extract rate limit information from GraphQL response
 */
export function extractRateLimitInfo(error: any): RateLimitInfo | null {
  try {
    if (error?.response?.extensions?.cost) {
      return {
        requestedQueryCost: error.response.extensions.cost.requestedQueryCost,
        actualQueryCost: error.response.extensions.cost.actualQueryCost,
        throttleStatus: error.response.extensions.cost.throttleStatus
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Handle Admin API rate limits with exponential backoff
 */
export async function withRateLimit<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a rate limit error
      if (!error || !error.toString().includes('429')) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw new Error(`Max retries reached: ${lastError.message}`);
      }
      
      // Extract rate limit info for better backoff calculation
      const rateLimitInfo = extractRateLimitInfo(error);
      
      // Calculate backoff delay (exponential with jitter)
      const baseDelay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      const jitter = Math.random() * 1000; // 0-1s random jitter
      const delay = baseDelay + jitter;
      
      console.log(`Rate limit hit, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      
      if (rateLimitInfo) {
        console.log('Rate limit info:', {
          available: rateLimitInfo.throttleStatus.currentlyAvailable,
          maximum: rateLimitInfo.throttleStatus.maximumAvailable,
          restoreRate: rateLimitInfo.throttleStatus.restoreRate
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Test Admin API connection and permissions
 */
export async function testAdminConnection(shopDomain: string): Promise<{
  success: boolean;
  shopInfo?: ShopInfo;
  error?: string;
}> {
  try {
    const shopInfo = await getShopInfo(shopDomain);
    
    if (!shopInfo) {
      return {
        success: false,
        error: 'Failed to retrieve shop information'
      };
    }

    return {
      success: true,
      shopInfo
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}