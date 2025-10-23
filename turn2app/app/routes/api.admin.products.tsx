import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { requireSession } from '../lib/middleware.server';
import { getAdminProducts, getAdminProduct, withRateLimit } from '../lib/admin-api.server';
import { createErrorResponse, AdminProductsResponseSchema } from '../lib/validation.server';

/**
 * GET /api/admin/products - Get products from Admin API
 * 
 * Query parameters:
 * - first: number of products to fetch (max 50, default 20)
 * - after: cursor for pagination
 * - id: specific product ID to fetch (if provided, returns single product)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Require authenticated session
    const context = await requireSession(request);

    const url = new URL(request.url);
    
    // Parse query parameters
    const first = Math.min(parseInt(url.searchParams.get('first') || '20'), 50);
    const after = url.searchParams.get('after') || undefined;
    const productId = url.searchParams.get('id');

    // Validate parameters
    if (first < 1) {
      return json(createErrorResponse(
        'Invalid "first" parameter. Must be between 1 and 50.',
        'INVALID_PARAMETER'
      ), { status: 400 });
    }

    if (productId) {
      // Fetch single product by ID
      const product = await withRateLimit(async () => {
        return await getAdminProduct(context.shop, productId);
      });

      if (!product) {
        return json(createErrorResponse(
          'Product not found',
          'PRODUCT_NOT_FOUND'
        ), { status: 404 });
      }

      return json(product, {
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 minutes cache
          'Content-Type': 'application/json'
        }
      });
    } else {
      // Fetch products with pagination
      const result = await withRateLimit(async () => {
        return await getAdminProducts(context.shop, first, after);
      });

      if (!result) {
        return json(createErrorResponse(
          'Failed to fetch products',
          'PRODUCTS_FETCH_ERROR'
        ), { status: 500 });
      }

      const response = {
        products: result.products,
        hasNextPage: result.hasNextPage,
        endCursor: result.endCursor,
        shop: context.shop,
        total: result.products.length
      };

      // Validate response schema
      const validatedResponse = AdminProductsResponseSchema.parse(response);

      return json(validatedResponse, {
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 minutes cache
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('Admin products API error:', error);
    
    if (error instanceof Response) {
      throw error; // Re-throw middleware responses
    }

    if (error instanceof Error) {
      // Handle specific Admin API errors
      if (error.message.includes('Admin API authentication failed')) {
        return json(createErrorResponse(
          'Shop authentication failed',
          'ADMIN_AUTH_ERROR'
        ), { status: 401 });
      }

      if (error.message.includes('Shop subscription required')) {
        return json(createErrorResponse(
          'Shop subscription required for Admin API access',
          'SUBSCRIPTION_ERROR'
        ), { status: 402 });
      }

      if (error.message.includes('Admin API rate limit exceeded')) {
        return json(createErrorResponse(
          'Admin API rate limit exceeded',
          'ADMIN_RATE_LIMIT'
        ), { status: 429 });
      }

      if (error.message.includes('Max retries reached')) {
        return json(createErrorResponse(
          'Admin API temporarily unavailable',
          'SERVICE_UNAVAILABLE'
        ), { status: 503 });
      }
    }

    return json(createErrorResponse(
      'Failed to fetch products',
      'INTERNAL_ERROR'
    ), { status: 500 });
  }
}