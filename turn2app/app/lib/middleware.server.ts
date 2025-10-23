/**
 * Request Middleware System für turn2app - Authentifizierung & Request Context
 * 
 * Diese Datei implementiert das zentrale Middleware-System für alle API Requests.
 * Sie kombiniert Session-Validierung mit Datenbank-Checks und Request-Logging
 * für umfassende Request-Verarbeitung.
 * 
 * MIDDLEWARE-STRATEGIEN:
 * 1. requireSession(): STRIKT - Session Token + DB Check erforderlich
 * 2. optionalSession(): FLEXIBEL - Session optional, graceful fallback
 * 3. flexibleAuth(): HYBRID - Session Token ODER Shop Parameter
 * 
 * VERWENDUNG IM PROJEKT:
 * - Admin Routes (admin.tsx): requireSession() für eingeloggte User
 * - API Endpoints: flexibleAuth() für Mobile + Admin Zugriff
 * - Public APIs: optionalSession() für erweiterte Funktionen bei Login
 * 
 * SICHERHEITSFEATURES:
 * - Session Token Validierung (JWT Signatur + Expiration)
 * - Datenbank-Konsistenz (Shop muss existieren + installiert sein)
 * - Strukturierte Error Responses mit Error Codes
 * - Request Logging für Monitoring und Debugging
 */

import { json } from '@remix-run/cloudflare';
import { requireValidSession, getOptionalSession } from './session.server.js';
import { prisma } from './prisma.server.js';
import { logRequestWithContext, generateRequestId } from './monitoring.server.js';

/**
 * Request Context - Einheitliche Datenstruktur für alle authentifizierten Requests
 * 
 * Diese Interface definiert den Standard-Context, den alle Middleware-Funktionen
 * zurückgeben und den API Routes für Request-Verarbeitung verwenden.
 * 
 * FELDER:
 * - shop: Shop Domain String für einfache Verwendung ("myshop.myshopify.com")
 * - session: Vollständige Shopify Session mit User-Info (null bei Shop-Parameter Auth)
 * - shopRecord: Datenbank-Record mit verschlüsselten Tokens und Settings
 * 
 * VERWENDUNG:
 * - API Loaders: const context = await requireSession(request)
 * - Shop-spezifische Operationen: context.shop
 * - User-spezifische Features: context.session.sub (User ID)
 * - Token-Zugriff: über shopRecord für API Calls
 */
export interface RequestContext {
  shop: string;        // Shop Domain für API Calls und Identifikation
  session: any;        // Shopify Session Token (null bei Shop Parameter Auth)
  shopRecord?: any;    // Vollständiger DB Shop Record mit Tokens
}

/**
 * STRENGE Session-Authentifizierung - Erfordert gültigen Session Token
 * 
 * VERWENDUNG:
 * - Admin UI Routes (admin.tsx, admin.branding.tsx)
 * - Sichere API Endpoints die User-Kontext brauchen
 * - Alle Operationen die eindeutige User-Identifikation erfordern
 * 
 * VALIDIERUNGSSCHRITTE:
 * 1. Session Token Validierung (JWT Signatur + Expiration)
 * 2. Shop-Existenz in Datenbank prüfen
 * 3. Installation-Status prüfen (nicht deinstalliert)
 * 
 * FEHLERVERHALTEN:
 * - 401: Kein/ungültiger Session Token
 * - 404: Shop nicht in Datenbank gefunden
 * - 403: Shop wurde deinstalliert
 * 
 * @param request - Remix Request mit X-Shopify-Session-Token Header
 * @returns Garantiert gültigen RequestContext
 * @throws Response mit entsprechendem HTTP Status bei Fehlern
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
 * Request logging helper with enhanced monitoring
 */
export function logRequest(request: Request, context?: RequestContext): void {
  logRequestWithContext(request, context);
}

/**
 * Add request ID header if not present
 */
export function ensureRequestId(request: Request): Request {
  if (!request.headers.get('x-request-id')) {
    const requestId = generateRequestId();
    const headers = new Headers(request.headers);
    headers.set('x-request-id', requestId);
    
    return new Request(request.url, {
      method: request.method,
      headers,
      body: request.body
    });
  }
  return request;
}