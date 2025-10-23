import { getShopWithToken } from './shop.server.js';
import { canMakeShopifyRequest, addShopifyApiCost } from './rate-limit.server.js';
import { captureShopifyError, captureWarning } from './sentry.server.js';

// Storefront API GraphQL endpoint
const STOREFRONT_API_VERSION = '2024-01';

export interface StorefrontProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
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
        compareAtPrice: {
          amount: string;
          currencyCode: string;
        } | null;
        availableForSale: boolean;
      };
    }>;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface StorefrontProductsResponse {
  data: {
    products: {
      edges: Array<{
        node: StorefrontProduct;
      }>;
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    };
  };
  errors?: Array<{
    message: string;
    locations: Array<{ line: number; column: number }>;
  }>;
}

// GraphQL query for fetching products
const PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          description(truncateAt: 250)
          images(first: 3) {
            edges {
              node {
                url(transform: { maxWidth: 600, maxHeight: 600 })
                altText
              }
            }
          }
          variants(first: 3) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

/**
 * Create Storefront Access Token for a shop
 * This requires Admin API access to create the token
 */
export async function createStorefrontAccessToken(shopDomain: string): Promise<string> {
  try {
    // Check API budget before making request
    const estimatedCost = 100; // Admin API calls are more expensive
    
    if (!canMakeShopifyRequest(shopDomain, estimatedCost)) {
      captureWarning('Shopify API budget exceeded, cannot create Storefront token', {
        shop: shopDomain,
        level: 'warning',
        extra: { estimatedCost, operation: 'createStorefrontAccessToken' }
      });
      throw new Error('Shopify API budget exceeded. Please try again later.');
    }

    const shopData = await getShopWithToken(shopDomain);
    if (!shopData) {
      console.error('Shop not found or inactive:', shopDomain);
      throw new Error('Shop not found or inactive');
    }

    // Use Admin API to create a Storefront access token
    const adminUrl = `https://${shopDomain}/admin/api/${STOREFRONT_API_VERSION}/storefront_access_tokens.json`;
    
    const response = await fetch(adminUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': shopData.accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'TurnApp/1.0.0'
      },
      body: JSON.stringify({
        storefront_access_token: {
          title: `TurnApp Mobile Token - ${new Date().toISOString()}`
        }
      })
    });

    // Add the cost to budget tracking
    addShopifyApiCost(shopDomain, estimatedCost);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create Storefront access token (${response.status}):`, errorText);
      
      // Throw specific errors for different status codes
      if (response.status === 401) {
        throw new Error('Admin API error: 401 - Invalid or expired access token');
      } else if (response.status === 402) {
        throw new Error('Admin API error: 402 - Shop subscription required');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - Admin API');
      } else {
        throw new Error(`Admin API error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    const accessToken = data.storefront_access_token?.access_token;
    
    if (!accessToken) {
      throw new Error('No access token in API response');
    }

    console.log(`✅ Created Storefront access token for ${shopDomain}`);
    return accessToken;

  } catch (error) {
    console.error('Error creating Storefront access token:', error);
    
    if (error instanceof Error) {
      captureShopifyError(error, {
        shop: shopDomain,
        api: 'rest',
        operation: 'createStorefrontAccessToken',
        extra: { 
          message: error.message,
          hasShopData: !!shopDomain
        }
      });
    }
    
    throw error; // Re-throw to be handled by caller
  }
}

/**
 * Get or create Storefront access token (cached approach)
 */
export async function getStorefrontAccessToken(shopDomain: string): Promise<string | null> {
  // For MVP, we'll create a new token each time
  // In production, this should be cached in database
  return await createStorefrontAccessToken(shopDomain);
}

/**
 * Make GraphQL request to Shopify Storefront API
 */
export async function queryStorefrontAPI(
  shopDomain: string,
  query: string,
  variables: Record<string, any> = {}
): Promise<any> {
  try {
    const accessToken = await getStorefrontAccessToken(shopDomain);
    if (!accessToken) {
      throw new Error('Failed to get Storefront access token');
    }

    const storefrontUrl = `https://${shopDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`;

    const response = await fetch(storefrontUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Storefront API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    
    if (data.errors && data.errors.length > 0) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    return data;

  } catch (error) {
    console.error('Storefront API query failed:', error);
    throw error;
  }
}

/**
 * Fetch products from Storefront API
 */
export async function fetchProducts(
  shopDomain: string,
  first: number = 10,
  after?: string
): Promise<StorefrontProductsResponse> {
  try {
    // Check if we can make the request based on API budget
    const estimatedCost = Math.max(first * 2, 50); // Rough estimate: 2 cost per product + base cost
    
    if (!canMakeShopifyRequest(shopDomain, estimatedCost)) {
      captureWarning('Shopify API budget exceeded, skipping products request', {
        shop: shopDomain,
        level: 'warning',
        extra: { estimatedCost, operation: 'fetchProducts' }
      });
      throw new Error('Shopify API budget exceeded. Please try again later.');
    }

    const variables = { first, ...(after && { after }) };
    const response = await queryStorefrontAPI(shopDomain, PRODUCTS_QUERY, variables);
    
    // Add the actual cost to the budget (estimate for now, real implementation would parse response headers)
    addShopifyApiCost(shopDomain, estimatedCost);
    
    return response as StorefrontProductsResponse;

  } catch (error) {
    console.error('Failed to fetch products:', error);
    
    if (error instanceof Error) {
      captureShopifyError(error, {
        shop: shopDomain,
        api: 'storefront',
        operation: 'fetchProducts',
        extra: { first, after }
      });
    }
    
    throw error;
  }
}

/**
 * Rate limiting helper for Storefront API
 * Shopify Storefront API has different limits than Admin API
 */
export function checkStorefrontRateLimit(shopDomain: string): boolean {
  // Use the new rate limiting system for Shopify API budget management
  return canMakeShopifyRequest(shopDomain, 50); // Check if we can make a basic request
}

/**
 * Transform Storefront product data for mobile consumption
 */
export function transformProductForMobile(product: StorefrontProduct) {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    image: product.images.edges[0]?.node.url || null,
    images: product.images.edges.map(edge => ({
      url: edge.node.url,
      altText: edge.node.altText
    })),
    price: {
      amount: product.priceRange.minVariantPrice.amount,
      currency: product.priceRange.minVariantPrice.currencyCode
    },
    variants: product.variants.edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      price: edge.node.price,
      compareAtPrice: edge.node.compareAtPrice,
      available: edge.node.availableForSale
    }))
  };
}

/**
 * Get products for app preview with simplified format
 */
export async function getStorefrontProducts({
  shop,
  limit = 8
}: {
  shop: string;
  limit?: number;
}) {
  try {
    const response = await fetchProducts(shop, limit);
    
    return response.data.products.edges.map(edge => {
      const product = edge.node;
      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description || `Entdecken Sie ${product.title} in unserem Shop`,
        images: product.images.edges.length > 0 
          ? [{ url: product.images.edges[0].node.url }]
          : [{ url: "https://via.placeholder.com/300x300/0066cc/ffffff?text=" + encodeURIComponent(product.title) }],
        priceRange: {
          minVariantPrice: {
            amount: product.priceRange.minVariantPrice.amount,
            currencyCode: product.priceRange.minVariantPrice.currencyCode
          }
        }
      };
    });
    
  } catch (error) {
    console.warn("Could not fetch storefront products:", error);
    return null; // Will fallback to mock data
  }
}