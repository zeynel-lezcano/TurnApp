/**
 * /api/storefront-token - Mobile Storefront Token Management
 * 
 * This API endpoint provides short-lived Storefront access tokens for mobile apps.
 * Mobile apps use these tokens to directly query Shopify's Storefront GraphQL API
 * without going through our server for every product request.
 * 
 * SECURITY:
 * - Tokens are short-lived (15 minutes) to limit exposure
 * - Rate limited to prevent abuse
 * - Requires valid shop authentication
 * - Tokens are scoped only to Storefront API access
 * 
 * API ENDPOINT: POST /api/storefront-token
 * 
 * REQUEST BODY:
 * {
 *   "shop": "myshop.myshopify.com",
 *   "purpose": "mobile-app" // Optional, for tracking
 * }
 * 
 * RESPONSE:
 * {
 *   "access_token": "shpat_xxxxx",
 *   "expires_at": "2024-01-01T12:15:00.000Z",
 *   "shop_domain": "myshop.myshopify.com",
 *   "storefront_endpoint": "https://myshop.myshopify.com/api/2024-01/graphql.json"
 * }
 */

import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { flexibleAuth, logRequest, type RequestContext } from '../lib/middleware.server';
import { rateLimitMiddleware } from '../lib/rate-limit.server';
import { createStorefrontAccessToken } from '../lib/storefront.server';
import { captureApiError, captureShopifyError } from '../lib/sentry.server';
import { z } from 'zod';

// Request validation schema
const StorefrontTokenRequestSchema = z.object({
  shop: z.string().min(1, 'Shop domain is required'),
  purpose: z.string().optional().default('mobile-app')
});

// Response schema
const StorefrontTokenResponseSchema = z.object({
  access_token: z.string(),
  expires_at: z.string(),
  shop_domain: z.string(),
  storefront_endpoint: z.string(),
  purpose: z.string().optional()
});

// Error response schema
const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  message: z.string().optional()
});

/**
 * Generate a short-lived Storefront access token for mobile apps
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ 
      error: 'Method not allowed', 
      code: 'METHOD_NOT_ALLOWED' 
    }, { status: 405 });
  }

  let context: RequestContext | undefined;

  try {
    // Apply rate limiting first (strict limits for token generation)
    const rateLimitResponse = await rateLimitMiddleware(request, 'admin.api');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse request body
    const body = await request.json();
    const validationResult = StorefrontTokenRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return json({
        error: 'Invalid request',
        code: 'VALIDATION_ERROR',
        message: validationResult.error.errors[0].message
      }, { status: 400 });
    }

    const { shop: requestedShop, purpose } = validationResult.data;

    // Authenticate the request - this ensures the shop is valid and active
    context = await flexibleAuth(request);
    logRequest(request, context);

    // Verify the requested shop matches the authenticated shop
    if (!context || context.shop !== requestedShop) {
      captureApiError(new Error('Shop mismatch in token request'), {
        request,
        shop: context?.shop,
        endpoint: '/api/storefront-token',
        extra: { requestedShop, authenticatedShop: context?.shop }
      });

      return json({
        error: 'Shop mismatch',
        code: 'SHOP_MISMATCH',
        message: 'Requested shop does not match authenticated shop'
      }, { status: 400 });
    }

    // Generate a new Storefront access token
    console.log(`Generating Storefront token for shop: ${context.shop}, purpose: ${purpose}`);
    
    const accessToken = await createStorefrontAccessToken(context.shop);
    
    if (!accessToken) {
      captureShopifyError(new Error('Failed to create Storefront access token'), {
        shop: context.shop,
        api: 'rest',
        operation: 'createStorefrontAccessToken',
        request
      });

      return json({
        error: 'Token generation failed',
        code: 'TOKEN_GENERATION_FAILED',
        message: 'Unable to generate Storefront access token'
      }, { status: 500 });
    }

    // Calculate expiration time (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Prepare response
    const response = {
      access_token: accessToken,
      expires_at: expiresAt.toISOString(),
      shop_domain: context.shop,
      storefront_endpoint: `https://${context.shop}/api/2024-01/graphql.json`,
      purpose
    };

    // Validate response schema
    const validatedResponse = StorefrontTokenResponseSchema.parse(response);

    console.log(`✅ Generated Storefront token for ${context.shop} (expires: ${expiresAt.toISOString()})`);

    return json(validatedResponse, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate' // Never cache tokens
      }
    });

  } catch (error) {
    console.error('Storefront token generation error:', error);
    
    if (error instanceof Response) {
      throw error; // Re-throw middleware responses
    }

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return json({
        error: 'Invalid JSON',
        code: 'INVALID_JSON',
        message: 'Request body must be valid JSON'
      }, { status: 400 });
    }

    // Handle Shopify API errors
    if (error instanceof Error) {
      if (error.message.includes('Admin API error: 401')) {
        return json({
          error: 'Shop authentication failed',
          code: 'SHOP_AUTH_ERROR',
          message: 'Shop credentials are invalid or expired'
        }, { status: 401 });
      }

      if (error.message.includes('Admin API error: 402')) {
        return json({
          error: 'Shop subscription required',
          code: 'SHOP_SUBSCRIPTION_ERROR',
          message: 'Shop requires active subscription'
        }, { status: 402 });
      }

      if (error.message.includes('Rate limit')) {
        captureShopifyError(error, {
          shop: context?.shop || 'unknown',
          api: 'rest',
          operation: 'createStorefrontAccessToken',
          request
        });

        return json({
          error: 'Shopify rate limit exceeded',
          code: 'SHOPIFY_RATE_LIMIT',
          message: 'Please try again later'
        }, { status: 429 });
      }

      // Capture unexpected errors
      captureApiError(error, {
        request,
        shop: context?.shop,
        endpoint: '/api/storefront-token',
        extra: {
          hasContext: !!context,
          timestamp: new Date().toISOString()
        }
      });
    }

    return json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: 'Failed to generate Storefront access token'
    }, { status: 500 });
  }
}

// Export schemas for testing
export { StorefrontTokenRequestSchema, StorefrontTokenResponseSchema, ErrorResponseSchema };