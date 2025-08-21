import { json } from '@remix-run/node';
import { requireValidSession, getOptionalSession } from './session.server.js';
import { prisma } from './prisma.server.js';

export interface RequestContext {
  shop: string;
  session: any;
  shopRecord?: any;
}

/**
 * Middleware to enforce session token validation
 * Throws 401 if no valid session token
 */
export async function requireSession(request: Request): Promise<RequestContext> {
  try {
    const sessionContext = await requireValidSession(request);
    
    // Additional validation: check if shop exists in database
    const shopRecord = await prisma.shop.findUnique({
      where: { shopDomain: sessionContext.shop }
    });

    if (!shopRecord) {
      console.error(`Shop not found in database: ${sessionContext.shop}`);
      throw new Response(
        JSON.stringify({ 
          error: "Shop not registered", 
          code: "SHOP_NOT_FOUND" 
        }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (shopRecord.uninstalledAt) {
      console.error(`Shop uninstalled: ${sessionContext.shop}`);
      throw new Response(
        JSON.stringify({ 
          error: "Shop access revoked", 
          code: "SHOP_UNINSTALLED" 
        }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return {
      shop: sessionContext.shop,
      session: sessionContext.session,
      shopRecord
    };

  } catch (error) {
    // Re-throw Response objects (they contain proper status codes)
    if (error instanceof Response) {
      throw error;
    }

    console.error('Session middleware error:', error);
    throw new Response(
      JSON.stringify({ 
        error: "Authentication failed", 
        code: "AUTH_ERROR" 
      }), 
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Middleware for optional session validation
 * Returns context or null if no valid session
 */
export async function optionalSession(request: Request): Promise<RequestContext | null> {
  try {
    const sessionContext = await getOptionalSession(request);
    
    if (!sessionContext) {
      return null;
    }

    // Additional validation: check if shop exists in database
    const shopRecord = await prisma.shop.findUnique({
      where: { shopDomain: sessionContext.shop }
    });

    if (!shopRecord || shopRecord.uninstalledAt) {
      return null;
    }

    return {
      shop: sessionContext.shop,
      session: sessionContext.session,
      shopRecord
    };

  } catch (error) {
    console.error('Optional session middleware error:', error);
    return null;
  }
}

/**
 * Fallback middleware that accepts either session token or shop parameter
 * For APIs that need to support both embedded admin and mobile/external access
 */
export async function flexibleAuth(request: Request): Promise<RequestContext> {
  try {
    // Try session token first
    const sessionContext = await getOptionalSession(request);
    
    if (sessionContext) {
      // Validate shop exists
      const shopRecord = await prisma.shop.findUnique({
        where: { shopDomain: sessionContext.shop }
      });

      if (!shopRecord || shopRecord.uninstalledAt) {
        throw new Response(
          JSON.stringify({ 
            error: "Shop not found or uninstalled", 
            code: "SHOP_INVALID" 
          }), 
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return {
        shop: sessionContext.shop,
        session: sessionContext.session,
        shopRecord
      };
    }

    // Fallback to shop parameter (for mobile/API access)
    const url = new URL(request.url);
    const shopParam = url.searchParams.get('shop');
    
    if (!shopParam) {
      throw new Response(
        JSON.stringify({ 
          error: "Authentication required - provide session token or shop parameter", 
          code: "AUTH_REQUIRED" 
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate shop parameter
    if (!shopParam.endsWith('.myshopify.com')) {
      throw new Response(
        JSON.stringify({ 
          error: "Invalid shop domain format", 
          code: "INVALID_SHOP" 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if shop exists in database
    const shopRecord = await prisma.shop.findUnique({
      where: { shopDomain: shopParam }
    });

    if (!shopRecord || shopRecord.uninstalledAt) {
      throw new Response(
        JSON.stringify({ 
          error: "Shop not found or uninstalled", 
          code: "SHOP_NOT_FOUND" 
        }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return {
      shop: shopParam,
      session: null, // No session for shop parameter access
      shopRecord
    };

  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    console.error('Flexible auth middleware error:', error);
    throw new Response(
      JSON.stringify({ 
        error: "Authentication failed", 
        code: "AUTH_ERROR" 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Rate limiting helper (basic implementation)
 */
export function checkRateLimit(shop: string, endpoint: string): boolean {
  // TODO: Implement proper rate limiting with Redis/memory store
  // For MVP, just return true (no rate limiting)
  return true;
}

/**
 * Request logging helper
 */
export function logRequest(request: Request, context?: RequestContext): void {
  const url = new URL(request.url);
  const logData = {
    method: request.method,
    pathname: url.pathname,
    shop: context?.shop || 'unknown',
    userAgent: request.headers.get('User-Agent'),
    timestamp: new Date().toISOString()
  };

  console.log('API Request:', JSON.stringify(logData));
}