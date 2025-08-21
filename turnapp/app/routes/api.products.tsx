import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { flexibleAuth, logRequest } from '~/lib/middleware.server';
import { fetchProducts, transformProductForMobile, checkStorefrontRateLimit } from '~/lib/storefront.server';
import { createErrorResponse, ProductsResponseSchema } from '~/lib/validation.server';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Use hardened middleware for authentication
    const context = await flexibleAuth(request);
    logRequest(request, context);

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
    if (!checkStorefrontRateLimit(context.shop)) {
      return json(createErrorResponse(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMIT_EXCEEDED'
      ), { status: 429 });
    }

    // Fetch products from Storefront API
    const productsResponse = await fetchProducts(context.shop, first, after);

    // Transform products for mobile consumption
    const transformedProducts = productsResponse.data.products.edges.map(edge => 
      transformProductForMobile(edge.node)
    );

    const response = {
      products: transformedProducts,
      pageInfo: productsResponse.data.products.pageInfo,
      shop: context.shop,
      total: transformedProducts.length
    };

    // Validate response schema
    const validatedResponse = ProductsResponseSchema.parse(response);

    return json(validatedResponse, {
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes cache
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
        return json(createErrorResponse(
          'Shop authentication failed',
          'AUTH_ERROR'
        ), { status: 401 });
      }

      if (error.message.includes('Storefront API error: 402')) {
        return json(createErrorResponse(
          'Shop subscription required',
          'SUBSCRIPTION_ERROR'
        ), { status: 402 });
      }

      if (error.message.includes('Rate limit')) {
        return json(createErrorResponse(
          'Shopify rate limit exceeded',
          'SHOPIFY_RATE_LIMIT'
        ), { status: 429 });
      }
    }

    return json(createErrorResponse(
      'Failed to fetch products',
      'INTERNAL_ERROR'
    ), { status: 500 });
  }
}