import { getShopWithToken } from './shop.server.js';

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
export async function createStorefrontAccessToken(shopDomain: string): Promise<string | null> {
  try {
    const shopData = await getShopWithToken(shopDomain);
    if (!shopData) {
      console.error('Shop not found or inactive:', shopDomain);
      return null;
    }

    // Use Admin API to create a Storefront access token
    const adminUrl = `https://${shopDomain}/admin/api/${STOREFRONT_API_VERSION}/storefront_access_tokens.json`;
    
    const response = await fetch(adminUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': shopData.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storefront_access_token: {
          title: 'TurnApp Mobile Access Token'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to create Storefront access token:', error);
      return null;
    }

    const data = await response.json();
    return data.storefront_access_token?.access_token || null;

  } catch (error) {
    console.error('Error creating Storefront access token:', error);
    return null;
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
    const variables = { first, ...(after && { after }) };
    const response = await queryStorefrontAPI(shopDomain, PRODUCTS_QUERY, variables);
    
    return response as StorefrontProductsResponse;

  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

/**
 * Rate limiting helper for Storefront API
 * Shopify Storefront API has different limits than Admin API
 */
export function checkStorefrontRateLimit(shopDomain: string): boolean {
  // TODO: Implement proper rate limiting
  // Storefront API allows 100 req/sec per shop
  // For MVP, we'll just return true
  return true;
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