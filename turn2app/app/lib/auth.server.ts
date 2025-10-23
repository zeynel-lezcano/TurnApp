/**
 * turn2app - Authentication Middleware für Shopify App
 * 
 * Zentrale Authentifizierung für alle geschützten Routes
 * Implementiert Shopify's OAuth-Flow und Session-Management
 */

import { redirect } from "@remix-run/node";
import { prisma } from "./prisma.server";
import { decryptToken } from "./crypto.server";

/**
 * Shop Authentication Result
 * Wird von requireShopAuth zurückgegeben
 */
export interface AuthenticatedShop {
  id: string;
  shopDomain: string;
  shopifyShopId: string | null;
  shopName: string | null;
  shopEmail: string | null;
  accessToken: string; // Entschlüsselter Token für API-Calls
  onboardingCompleted: boolean;
  onboardingStep: string | null;
  ownerFirstName: string | null;
  ownerLastName: string | null;
  ownerEmail: string | null;
  appName: string | null;
  lastActiveAt: Date;
}

/**
 * Shop Authentication Error Types
 */
export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Extrahiert Shop-Domain aus Request URL oder Query Parameters
 * 
 * @param request - Remix Request Object
 * @returns Shop Domain oder null wenn nicht gefunden
 */
function extractShopDomain(request: Request): string | null {
  const url = new URL(request.url);
  
  // 1. Query Parameter: ?shop=händler.myshopify.com
  const shopParam = url.searchParams.get("shop");
  if (shopParam) {
    return shopParam;
  }
  
  // 2. Embedded App: Shopify sendet Shop in Headers
  const shopHeader = request.headers.get("x-shopify-shop-domain");
  if (shopHeader) {
    return shopHeader;
  }
  
  // 3. Subdomain: händler.turn2app.com (falls custom domain)
  const hostname = url.hostname;
  if (hostname.includes('.') && !hostname.includes('localhost')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain && subdomain !== 'www') {
      return `${subdomain}.myshopify.com`;
    }
  }
  
  return null;
}

/**
 * Validiert Shopify-spezifische Domain-Format
 * 
 * @param shop - Shop Domain zu validieren
 * @returns true wenn gültiges Format
 */
function isValidShopDomain(shop: string): boolean {
  // Shopify Domain Pattern: händler.myshopify.com
  const shopifyDomainPattern = /^[a-zA-Z0-9-]+\.myshopify\.com$/;
  return shopifyDomainPattern.test(shop);
}

/**
 * Lädt Shop-Daten aus Datenbank und entschlüsselt Access Token
 * 
 * @param shopDomain - Shop Domain (z.B. "händler.myshopify.com")
 * @returns Shop-Daten mit entschlüsseltem Access Token
 * @throws AuthError wenn Shop nicht gefunden oder Token-Entschlüsselung fehlschlägt
 */
async function loadShopFromDatabase(shopDomain: string): Promise<AuthenticatedShop> {
  // Shop aus Datenbank laden
  const shop = await prisma.shop.findUnique({
    where: { shopDomain },
    select: {
      id: true,
      shopDomain: true,
      shopifyShopId: true,
      shopName: true,
      shopEmail: true,
      accessTokenEnc: true, // Verschlüsselter Token
      onboardingCompleted: true,
      onboardingStep: true,
      ownerFirstName: true,
      ownerLastName: true,
      ownerEmail: true,
      appName: true,
      lastActiveAt: true,
      uninstalledAt: true
    }
  });
  
  if (!shop) {
    throw new AuthError(
      `Shop ${shopDomain} not found in database`, 
      'SHOP_NOT_FOUND'
    );
  }
  
  // Prüfen ob Shop uninstalliert
  if (shop.uninstalledAt) {
    throw new AuthError(
      `Shop ${shopDomain} has uninstalled the app`, 
      'SHOP_UNINSTALLED'
    );
  }
  
  // Access Token entschlüsseln
  let accessToken: string;
  try {
    accessToken = decryptToken(shop.accessTokenEnc);
  } catch (error) {
    console.error(`❌ Failed to decrypt token for shop ${shopDomain}:`, error);
    throw new AuthError(
      'Failed to decrypt access token - shop may need to reinstall', 
      'TOKEN_DECRYPT_FAILED'
    );
  }
  
  // Last Active Timestamp aktualisieren
  await prisma.shop.update({
    where: { id: shop.id },
    data: { lastActiveAt: new Date() }
  });
  
  return {
    ...shop,
    accessToken
  };
}

/**
 * Validiert Shopify Session Token (für Embedded Apps)
 * 
 * @param request - Request mit Session Token
 * @param shopDomain - Shop Domain für Validierung
 * @returns true wenn Session gültig
 */
async function validateShopifySession(
  request: Request, 
  shopDomain: string
): Promise<boolean> {
  // In einer vollständigen Implementierung würden wir hier:
  // 1. JWT Session Token aus Headers extrahieren
  // 2. Token mit Shopify's öffentlichem Schlüssel verifizieren
  // 3. Ablaufzeit und Shop-Domain prüfen
  
  // Für MVP: Basic Header-Prüfung
  const sessionToken = request.headers.get('authorization');
  const shopHeader = request.headers.get('x-shopify-shop-domain');
  
  // Embedded App: Session Token und Shop Header müssen vorhanden sein
  if (request.headers.get('sec-fetch-dest') === 'iframe') {
    return sessionToken !== null && shopHeader === shopDomain;
  }
  
  // Standalone App: Weniger strenge Validierung
  return true;
}

/**
 * Shopify API Health Check - prüft ob Access Token noch gültig ist
 * 
 * @param accessToken - Entschlüsselter Shopify Access Token
 * @param shopDomain - Shop Domain
 * @returns true wenn Token gültig und API erreichbar
 */
async function validateShopifyApiAccess(
  accessToken: string, 
  shopDomain: string
): Promise<boolean> {
  try {
    // Minimaler GraphQL Query um Token zu testen
    const response = await fetch(`https://${shopDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: `{ shop { id name } }`
      })
    });
    
    if (!response.ok) {
      console.error(`❌ Shopify API returned ${response.status} for ${shopDomain}`);
      return false;
    }
    
    const data = await response.json();
    
    // Prüfen auf GraphQL Errors
    if (data.errors) {
      console.error(`❌ Shopify GraphQL errors for ${shopDomain}:`, data.errors);
      return false;
    }
    
    return data.data?.shop?.id !== undefined;
    
  } catch (error) {
    console.error(`❌ Shopify API validation failed for ${shopDomain}:`, error);
    return false;
  }
}

/**
 * Hauptfunktion: Authentifiziert Shop für geschützte Routes
 * 
 * VERWENDUNG in Route Loadern:
 * ```typescript
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   const shop = await requireShopAuth(request);
 *   // Route ist jetzt geschützt, shop.accessToken verfügbar für API-Calls
 * }
 * ```
 * 
 * AUTHENTIFIZIERUNGSFLOW:
 * 1. Shop Domain aus Request extrahieren
 * 2. Domain-Format validieren
 * 3. Shop aus Datenbank laden
 * 4. Access Token entschlüsseln
 * 5. Shopify Session validieren (bei Embedded Apps)
 * 6. Optional: API-Zugriff testen
 * 
 * @param request - Remix Request Object
 * @param options - Zusätzliche Optionen
 * @returns Authentifizierte Shop-Daten
 * @throws redirect() zu Installation/Login wenn Auth fehlschlägt
 */
export async function requireShopAuth(
  request: Request,
  options: {
    requireOnboarding?: boolean;
    validateApiAccess?: boolean;
  } = {}
): Promise<AuthenticatedShop> {
  const { requireOnboarding = false, validateApiAccess = false } = options;
  
  try {
    // 1. Shop Domain extrahieren
    const shopDomain = extractShopDomain(request);
    if (!shopDomain) {
      console.log('🔒 No shop domain found, redirecting to install');
      throw redirect('/auth/install');
    }
    
    // 2. Domain Format validieren
    if (!isValidShopDomain(shopDomain)) {
      console.log(`🔒 Invalid shop domain format: ${shopDomain}`);
      throw redirect('/auth/install');
    }
    
    // 3. Shop aus Datenbank laden
    let shop: AuthenticatedShop;
    try {
      shop = await loadShopFromDatabase(shopDomain);
    } catch (error) {
      if (error instanceof AuthError) {
        console.log(`🔒 ${error.message} (${error.code})`);
        
        if (error.code === 'SHOP_NOT_FOUND') {
          // Shop nicht in DB → Installation starten
          throw redirect(`/auth/install?shop=${shopDomain}`);
        } else if (error.code === 'SHOP_UNINSTALLED') {
          // Shop hat App deinstalliert → Neuinstallation
          throw redirect(`/auth/install?shop=${shopDomain}&reinstall=true`);
        } else {
          // Token-Probleme → Neuinstallation
          throw redirect(`/auth/install?shop=${shopDomain}&reauth=true`);
        }
      }
      throw error;
    }
    
    // 4. Shopify Session validieren (für Embedded Apps)
    const sessionValid = await validateShopifySession(request, shopDomain);
    if (!sessionValid) {
      console.log(`🔒 Invalid Shopify session for ${shopDomain}`);
      throw redirect(`/auth/install?shop=${shopDomain}&session_expired=true`);
    }
    
    // 5. Optional: API-Zugriff testen
    if (validateApiAccess) {
      const apiValid = await validateShopifyApiAccess(shop.accessToken, shopDomain);
      if (!apiValid) {
        console.log(`🔒 Invalid API access for ${shopDomain}, token may be expired`);
        throw redirect(`/auth/install?shop=${shopDomain}&token_expired=true`);
      }
    }
    
    // 6. Onboarding-Status prüfen
    if (requireOnboarding && !shop.onboardingCompleted) {
      console.log(`🔒 Shop ${shopDomain} has not completed onboarding`);
      throw redirect(`/onboarding/welcome?shop=${shopDomain}`);
    }
    
    console.log(`✅ Successfully authenticated shop: ${shopDomain}`);
    return shop;
    
  } catch (error) {
    // Wenn es ein redirect() ist, weiterwerfen
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      throw error;
    }
    
    // Unerwartete Fehler loggen und zu Installation umleiten
    console.error('❌ Unexpected auth error:', error);
    const shopDomain = extractShopDomain(request);
    const fallbackUrl = shopDomain 
      ? `/auth/install?shop=${shopDomain}&error=unexpected` 
      : '/auth/install';
    throw redirect(fallbackUrl);
  }
}

/**
 * Optionale Auth-Funktion für Routes die sowohl angemeldete als auch anonyme User unterstützen
 * 
 * @param request - Remix Request Object  
 * @returns Shop-Daten wenn angemeldet, null wenn anonym
 */
export async function getOptionalShopAuth(request: Request): Promise<AuthenticatedShop | null> {
  try {
    return await requireShopAuth(request);
  } catch (error) {
    // Bei Redirect-Errors null zurückgeben statt umzuleiten
    if (error instanceof Response) {
      return null;
    }
    throw error;
  }
}

/**
 * Utility: Extrahiert nur Shop Domain ohne Auth-Checks
 * Nützlich für öffentliche Pages die Shop-Kontext brauchen
 * 
 * @param request - Remix Request Object
 * @returns Shop Domain oder null
 */
export function getShopDomain(request: Request): string | null {
  return extractShopDomain(request);
}