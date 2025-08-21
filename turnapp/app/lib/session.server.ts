import { createHmac } from "node:crypto";

export interface ShopifySessionToken {
  iss: string;  // Shop domain
  dest: string; // Shop domain  
  aud: string;  // API key
  sub: string;  // User ID
  exp: number;  // Expiration
  nbf: number;  // Not before
  iat: number;  // Issued at
  jti: string;  // JWT ID
  sid: string;  // Session ID
}

/**
 * Simple JWT decoder (without full verification for MVP)
 */
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode payload (second part)
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('JWT decode failed:', error);
    return null;
  }
}

/**
 * Verify Shopify session token signature
 */
function verifyJWTSignature(token: string, secret: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [header, payload, signature] = parts;
    
    // Recreate signature
    const data = `${header}.${payload}`;
    const expectedSignature = createHmac('sha256', secret)
      .update(data)
      .digest('base64url');

    return signature === expectedSignature;
  } catch (error) {
    console.error('JWT signature verification failed:', error);
    return false;
  }
}

/**
 * Verify and decode Shopify session token from embedded admin
 */
export function verifySessionToken(token: string): ShopifySessionToken | null {
  try {
    const apiSecret = process.env.SHOPIFY_API_SECRET;
    if (!apiSecret) {
      console.error("Missing SHOPIFY_API_SECRET");
      return null;
    }

    // Verify signature
    if (!verifyJWTSignature(token, apiSecret)) {
      console.error("Session token signature verification failed");
      return null;
    }

    // Decode payload
    const decoded = decodeJWT(token);
    if (!decoded) {
      return null;
    }

    // Validate required fields
    if (!decoded.iss || !decoded.dest || !decoded.aud) {
      console.error("Invalid session token: missing required fields");
      return null;
    }

    // Ensure shop domains match
    if (decoded.iss !== decoded.dest) {
      console.error("Session token: iss and dest don't match");
      return null;
    }

    // Check expiration
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      console.error("Session token expired");
      return null;
    }

    return decoded as ShopifySessionToken;

  } catch (error) {
    console.error("Session token verification failed:", error);
    return null;
  }
}

/**
 * Extract shop domain from session token
 */
export function getShopFromSession(token: string): string | null {
  const session = verifySessionToken(token);
  return session ? session.iss : null;
}

/**
 * Middleware to verify session token and add shop context
 */
export function createSessionMiddleware() {
  return async (request: Request): Promise<{ shop: string; session: ShopifySessionToken } | null> => {
    const sessionTokenHeader = request.headers.get("X-Shopify-Session-Token");
    
    if (!sessionTokenHeader) {
      return null;
    }

    const session = verifySessionToken(sessionTokenHeader);
    if (!session) {
      return null;
    }

    return {
      shop: session.iss,
      session
    };
  };
}

/**
 * Extract session context from request - for use in loaders/actions
 */
export async function requireValidSession(request: Request): Promise<{ shop: string; session: ShopifySessionToken }> {
  const middleware = createSessionMiddleware();
  const context = await middleware(request);
  
  if (!context) {
    throw new Response("Unauthorized - Invalid or missing session token", { 
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  return context;
}

/**
 * Optional session context - returns null if no valid session
 */
export async function getOptionalSession(request: Request): Promise<{ shop: string; session: ShopifySessionToken } | null> {
  const middleware = createSessionMiddleware();
  return await middleware(request);
}