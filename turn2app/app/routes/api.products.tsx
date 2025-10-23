import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { flexibleAuth } from '../lib/middleware.server';
import { fetchProducts, transformProductForMobile, checkStorefrontRateLimit } from '../lib/storefront.server';
import { createErrorResponse, ProductsResponseSchema } from '../lib/validation.server';
import { withCache, CacheKeys, CacheTTL } from '../lib/cache.server';
import { captureApiError, captureShopifyError } from '../lib/sentry.server';
import { rateLimitMiddleware, createRateLimitHeaders, RATE_LIMITS } from '../lib/rate-limit.server';

export async function loader({ request }: LoaderFunctionArgs) {
  let context: { shop: string } | undefined;
  
  try {
    // Use hardened middleware for authentication
    context = await flexibleAuth(request);
    if (context) {
      // Simple logging without session check for flexible auth
      console.log(`Products API request for shop: ${context.shop}`);
    }

    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'api.products', context);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const url = new URL(request.url);
    
    // Parse query parameters
    const first = Math.min(parseInt(url.searchParams.get('first') || '10'), 50); // Max 50 products
    const after = url.searchParams.get('after') || undefined;

    // Validate parameters
    if (first < 1) {
      return json(createErrorResponse(
        'Invalid "first" parameter. Must be between 1 and 50.',
        'INVALID_PARAMETER'
      ), { status: 400 });
    }

    // Check rate limiting
    if (!checkStorefrontRateLimit(context?.shop || 'unknown')) {
      return json(createErrorResponse(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMIT_EXCEEDED'
      ), { status: 429 });
    }

    // Create cache key based on shop and query parameters
    const cacheParams = `first=${first}&after=${after || ''}`;
    const cacheKey = CacheKeys.products(context?.shop || 'unknown', cacheParams);

    // Fetch products with caching (60s TTL)
    const response = await withCache(
      cacheKey,
      async () => {
        // Fetch products from Storefront API
        const productsResponse = await fetchProducts(context?.shop || 'unknown', first, after);

        // Transform products for mobile consumption
        const transformedProducts = productsResponse.data.products.edges.map(edge => 
          transformProductForMobile(edge.node)
        );

        return {
          products: transformedProducts,
          pageInfo: productsResponse.data.products.pageInfo,
          shop: context?.shop || 'unknown',
          total: transformedProducts.length
        };
      },
      CacheTTL.PRODUCTS // 60 seconds TTL
    );

    // Validate response schema
    const validatedResponse = ProductsResponseSchema.parse(response);

    return json(validatedResponse, {
      headers: {
        'Cache-Control': 'public, max-age=60', // 1 minute cache (matches server cache TTL)
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Products API error:', error);
    
    if (error instanceof Response) {
      throw error; // Re-throw middleware responses
    }

    if (error instanceof Error) {
      // Handle specific Shopify API errors
      if (error.message.includes('Storefront API error: 401')) {
        captureShopifyError(error, {
          shop: context?.shop || 'unknown',
          api: 'storefront',
          operation: 'fetchProducts',
          request,
          extra: { statusCode: 401 }
        });
        
        return json(createErrorResponse(
          'Shop authentication failed',
          'AUTH_ERROR'
        ), { status: 401 });
      }

      if (error.message.includes('Storefront API error: 402')) {
        captureShopifyError(error, {
          shop: context?.shop || 'unknown',
          api: 'storefront',
          operation: 'fetchProducts',
          request,
          extra: { statusCode: 402 }
        });
        
        return json(createErrorResponse(
          'Shop subscription required',
          'SUBSCRIPTION_ERROR'
        ), { status: 402 });
      }

      if (error.message.includes('Rate limit')) {
        captureShopifyError(error, {
          shop: context?.shop || 'unknown',
          api: 'storefront',
          operation: 'fetchProducts',
          request,
          extra: { rateLimitHit: true }
        });
        
        return json(createErrorResponse(
          'Shopify rate limit exceeded',
          'SHOPIFY_RATE_LIMIT'
        ), { status: 429 });
      }
      
      // Capture other Shopify API errors
      captureShopifyError(error, {
        shop: context?.shop || 'unknown',
        api: 'storefront',
        operation: 'fetchProducts',
        request
      });
    } else {
      // Capture unexpected non-Error objects
      captureApiError(new Error(String(error)), {
        request,
        shop: context?.shop,
        endpoint: '/api/products',
        extra: {
          errorType: typeof error,
          timestamp: new Date().toISOString()
        }
      });
    }

    return json(createErrorResponse(
      'Failed to fetch products',
      'INTERNAL_ERROR'
    ), { status: 500 });
  }
}