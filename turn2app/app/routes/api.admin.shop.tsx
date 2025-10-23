import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireSession } from '../lib/middleware.server';
import { getShopInfo, validateShopAccess, testAdminConnection } from '../lib/admin-api.server';
import { createErrorResponse, ShopValidationResponseSchema } from '../lib/validation.server';

/**
 * GET /api/admin/shop - Get shop information and validate Admin API access
 * 
 * Returns shop metadata from Admin API for the authenticated session
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Require authenticated session
    const context = await requireSession(request);

    const url = new URL(request.url);
    const validate = url.searchParams.get('validate') === 'true';

    if (validate) {
      // Perform comprehensive shop validation
      const isValid = await validateShopAccess(context.shop);
      
      if (!isValid) {
        return json(createErrorResponse(
          'Shop validation failed',
          'SHOP_VALIDATION_FAILED'
        ), { status: 400 });
      }

      const shopInfo = await getShopInfo(context.shop);
      
      const validationResponse = {
        valid: true,
        shop: shopInfo
      };

      // Validate response schema
      const validatedResponse = ShopValidationResponseSchema.parse(validationResponse);

      return json(validatedResponse, {
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 minutes cache
          'Content-Type': 'application/json'
        }
      });
    } else {
      // Just get shop information
      const shopInfo = await getShopInfo(context.shop);
      
      if (!shopInfo) {
        return json(createErrorResponse(
          'Failed to retrieve shop information',
          'SHOP_INFO_ERROR'
        ), { status: 500 });
      }

      return json(shopInfo, {
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 minutes cache
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('Admin shop API error:', error);
    
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

      if (error.message.includes('rate limit')) {
        return json(createErrorResponse(
          'Admin API rate limit exceeded',
          'ADMIN_RATE_LIMIT'
        ), { status: 429 });
      }
    }

    return json(createErrorResponse(
      'Failed to retrieve shop information',
      'INTERNAL_ERROR'
    ), { status: 500 });
  }
}