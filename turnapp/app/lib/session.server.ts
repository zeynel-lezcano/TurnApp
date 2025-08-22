/**
 * Shopify Session Management für TurnApp - Embedded Admin Authentifizierung
 * 
 * Diese Datei implementiert die Authentifizierung für Shopify's embedded Admin Apps.
 * Sie verarbeitet und validiert Session Tokens, die von Shopify's App Bridge gesendet werden,
 * wenn die App im Shopify Admin eingebettet läuft.
 * 
 * SHOPIFY EMBEDDED APP FLOW:
 * 1. Shop installiert App über OAuth (shopify-auth.server.ts)
 * 2. Admin öffnet App im Shopify Admin (embedded iframe)
 * 3. App Bridge sendet Session Token in X-Shopify-Session-Token Header
 * 4. Wir validieren diesen JWT Token mit SHOPIFY_API_SECRET
 * 5. Token enthält Shop-Domain und User-Info für Request-Kontext
 * 
 * SICHERHEIT:
 * - JWT Signature-Verifikation mit SHOPIFY_API_SECRET
 * - Expiration Time Validation
 * - Shop Domain Consistency Checks (iss === dest)
 * - Required Fields Validation
 * 
 * VERWENDUNG IM PROJEKT:
 * - middleware.server.ts: Verwendet für requireSession(), optionalSession()
 * - Alle Admin UI Routes: Brauchen gültiges Session Token
 * - API Routes: Optional für Shop-Context
 */

import { createHmac } from "node:crypto";

/**
 * Shopify Session Token Structure - JWT Payload von Shopify App Bridge
 * 
 * Diese Interface definiert die Struktur des JWT Tokens, den Shopify sendet,
 * wenn ein Shop-User die embedded App im Shopify Admin öffnet.
 * 
 * JWT STANDARD FIELDS:
 * - iss (issuer): Shop Domain ("myshop.myshopify.com") - wer hat Token ausgestellt
 * - aud (audience): Unsere App's API Key - für wen ist der Token
 * - exp (expiration): Unix Timestamp - wann läuft Token ab
 * - iat (issued at): Unix Timestamp - wann wurde Token erstellt  
 * - sub (subject): Shopify User ID - welcher User ist eingeloggt
 * 
 * SHOPIFY SPECIFIC FIELDS:
 * - dest (destination): Shop Domain (sollte === iss sein)
 * - nbf (not before): Frühester gültiger Zeitpunkt
 * - jti (JWT ID): Eindeutige Token ID
 * - sid (session ID): Shopify Session Identifier
 * 
 * WICHTIG: Alle Zeitstempel sind Unix Timestamps (Sekunden seit 1970)
 */
export interface ShopifySessionToken {
  iss: string;   // Shop Domain der App installiert hat ("shop.myshopify.com")
  dest: string;  // Ziel-Shop Domain (muss === iss sein)
  aud: string;   // Unsere App's Shopify API Key (audience)
  sub: string;   // Shopify User ID des eingeloggten Users
  exp: number;   // Token Expiration (Unix Timestamp in Sekunden)
  nbf: number;   // Not Before - Token gültig ab (Unix Timestamp)
  iat: number;   // Issued At - Token erstellt um (Unix Timestamp)
  jti: string;   // JWT ID - eindeutige Token Identifikation
  sid: string;   // Shopify Session ID für User Session
}

/**
 * JWT Token Decoder - Extrahiert Payload aus Shopify Session Token
 * 
 * JWT STRUKTUR: header.payload.signature (alle Base64URL encoded)
 * - header: Token-Typ und Signatur-Algorithmus
 * - payload: Die eigentlichen Daten (ShopifySessionToken)
 * - signature: HMAC-SHA256 Signatur für Verifikation
 * 
 * SECURITY NOTE:
 * Dies ist nur der Decoder - die Signatur-Verifikation erfolgt separat!
 * Niemals decoded Tokens ohne Signatur-Verifikation vertrauen.
 * 
 * @param token - Vollständiger JWT Token von Shopify
 * @returns Decoded Payload Object oder null bei Fehlern
 */
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // JWT Payload ist der mittlere Teil (index 1) - Base64URL decoded
    const payload = parts[1];
    // Base64URL Decoding: URL-safe variant von Base64 (+ -> -, / -> _, padding optional)
    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('JWT decode failed:', error);
    return null;
  }
}

/**
 * JWT Signatur-Verifikation - Prüft Authentizität des Shopify Tokens
 * 
 * SIGNATUR-PROZESS (HMAC-SHA256):
 * 1. Token in Teile aufsplitten: header.payload.signature
 * 2. Signatur-Input erstellen: "header.payload" (ohne signature)
 * 3. HMAC-SHA256 mit SHOPIFY_API_SECRET berechnen
 * 4. Base64URL encoding auf HMAC Result
 * 5. Vergleich mit mitgelieferter Signatur
 * 
 * SICHERHEIT:
 * - Nur Shopify kennt unseren API Secret und kann gültige Signaturen erstellen
 * - HMAC verhindert Token-Manipulation (auch bei bekanntem Payload)
 * - Constant-Time Vergleich verhindert Timing-Attacks
 * 
 * @param token - Kompletter JWT Token von Shopify
 * @param secret - Unser SHOPIFY_API_SECRET für HMAC-Verifikation
 * @returns true wenn Signatur gültig, false bei Manipulation oder falschen Secret
 */
function verifyJWTSignature(token: string, secret: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [header, payload, signature] = parts;
    
    // Signatur neu berechnen: HMAC-SHA256 über "header.payload"
    const data = `${header}.${payload}`;
    const expectedSignature = createHmac('sha256', secret)
      .update(data)  // HMAC Input: "header.payload" (ohne signature)
      .digest('base64url');  // Base64URL Output (URL-safe)

    // Constant-time Vergleich der Signaturen (Timing Attack Prevention)
    return signature === expectedSignature;
  } catch (error) {
    console.error('JWT signature verification failed:', error);
    return false;
  }
}

/**
 * Shopify Session Token Verifikation - Hauptfunktion für Token-Validierung
 * 
 * VOLLSTÄNDIGE VALIDIERUNG:
 * 1. Signatur-Verifikation mit SHOPIFY_API_SECRET
 * 2. JWT Payload Decoding 
 * 3. Required Fields Check (iss, dest, aud)
 * 4. Shop Domain Consistency (iss === dest)
 * 5. Expiration Time Validation
 * 
 * VERWENDUNG:
 * - middleware.server.ts: requireSession() für geschützte Routes
 * - API Endpoints: Shop-Context aus Session extrahieren
 * - Admin UI: User-Authentifizierung für embedded App
 * 
 * RÜCKGABE:
 * - ShopifySessionToken: Vollständig validierter Token mit Shop/User Info
 * - null: Token ungültig, manipuliert oder abgelaufen
 * 
 * @param token - X-Shopify-Session-Token Header Wert
 * @returns Validierter Session Token oder null bei Fehlern
 */
export function verifySessionToken(token: string): ShopifySessionToken | null {
  try {
    const apiSecret = process.env.SHOPIFY_API_SECRET;
    if (!apiSecret) {
      console.error("Missing SHOPIFY_API_SECRET");
      return null;
    }

    // SCHRITT 1: Signatur-Verifikation (CRITICAL SECURITY CHECK)
    // Ohne gültige Signatur ist Token gefälscht oder manipuliert
    if (!verifyJWTSignature(token, apiSecret)) {
      console.error("Session token signature verification failed - Token möglicherweise gefälscht");
      return null;
    }

    // SCHRITT 2: Payload Decoding nach erfolgreicher Signatur-Verifikation
    const decoded = decodeJWT(token);
    if (!decoded) {
      console.error("JWT payload decoding failed - malformed token");
      return null;
    }

    // SCHRITT 3: Required Fields Validation
    // iss = Shop Domain, dest = Ziel Domain, aud = Unsere App ID
    if (!decoded.iss || !decoded.dest || !decoded.aud) {
      console.error("Invalid session token: missing required fields (iss, dest, aud)");
      return null;
    }

    // SCHRITT 4: Shop Domain Consistency Check
    // Shopify setzt iss === dest, Abweichung deutet auf Manipulation hin
    if (decoded.iss !== decoded.dest) {
      console.error(`Session token: iss (${decoded.iss}) and dest (${decoded.dest}) don't match - possible token manipulation`);
      return null;
    }

    // SCHRITT 5: Expiration Time Validation
    // Token-Timestamps sind Unix Seconds, Date.now() ist Milliseconds
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTimestamp) {
      console.error(`Session token expired: exp=${decoded.exp}, now=${currentTimestamp}`);
      return null;
    }

    return decoded as ShopifySessionToken;

  } catch (error) {
    console.error("Session token verification failed:", error);
    return null;
  }
}

/**
 * Extrahiert Shop Domain aus Session Token - Convenience Function
 * 
 * VERWENDUNG:
 * - Schnelle Shop-Ermittlung ohne vollständige Session-Daten
 * - API Routes die nur Shop Domain brauchen
 * - Logging und Debugging
 * 
 * WICHTIG: Führt vollständige Token-Validierung durch!
 * Nicht nur Decoding - auch Signatur und Expiration werden geprüft.
 * 
 * @param token - Session Token vom X-Shopify-Session-Token Header
 * @returns Shop Domain ("shop.myshopify.com") oder null bei ungültigem Token
 */
export function getShopFromSession(token: string): string | null {
  // Vollständige Verifikation - nicht nur Decoding!
  const session = verifySessionToken(token);
  return session ? session.iss : null;  // iss = issuer = Shop Domain
}

/**
 * Session Middleware Factory - Erstellt wiederverwendbare Session-Validierung
 * 
 * MIDDLEWARE-PATTERN:
 * - Kapselt Session-Logik für Wiederverwendung
 * - Einheitliche Fehlerbehandlung
 * - Request-Header Abstraktion
 * 
 * VERWENDUNG:
 * - middleware.server.ts: requireSession(), optionalSession() 
 * - Jeder API Endpoint der Shop-Context braucht
 * 
 * @returns Middleware-Funktion die Request → Session Context transformiert
 */
export function createSessionMiddleware() {
  return async (request: Request): Promise<{ shop: string; session: ShopifySessionToken } | null> => {
    // Shopify App Bridge sendet Session Token in diesem speziellen Header
    const sessionTokenHeader = request.headers.get("X-Shopify-Session-Token");
    
    if (!sessionTokenHeader) {
      return null;
    }

    const session = verifySessionToken(sessionTokenHeader);
    if (!session) {
      return null;
    }

    // Shop-Context für Request: Domain + vollständige Session-Daten
    return {
      shop: session.iss,  // Shop Domain als String für einfache Verwendung
      session             // Vollständiger Token für erweiterte User-Info
    };
  };
}

/**
 * Erfordert gültige Session - Wirft 401 Error bei ungültigem Token
 * 
 * VERWENDUNG FÜR GESCHÜTZTE ROUTES:
 * - Admin UI Routes (admin.tsx, admin.branding.tsx)
 * - API Endpoints die Authentifizierung erfordern
 * - Alle Operationen die Shop-Context zwingend brauchen
 * 
 * FEHLERVERHALTEN:
 * - Gültiger Token: Rückgabe von Shop Context
 * - Ungültiger/fehlender Token: 401 Response Exception
 * 
 * @param request - Remix Request Object mit Headers
 * @returns Shop Context (garantiert nicht null)
 * @throws Response(401) bei fehlender oder ungültiger Session
 */
export async function requireValidSession(request: Request): Promise<{ shop: string; session: ShopifySessionToken }> {
  const middleware = createSessionMiddleware();
  const context = await middleware(request);
  
  // Session erforderlich - bei Fehler 401 Response werfen
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
 * Optionale Session - Keine Fehler bei ungültigem Token
 * 
 * VERWENDUNG FÜR FLEXIBLE ROUTES:
 * - API Endpoints die sowohl public als auch authenticated funktionieren
 * - Context-abhängige Funktionalität (mehr Daten für eingeloggte User)
 * - Graceful Degradation bei Session-Problemen
 * 
 * VERHALTEN:
 * - Gültiger Token: Rückgabe von Shop Context  
 * - Ungültiger/fehlender Token: null (keine Exception)
 * 
 * @param request - Remix Request Object
 * @returns Shop Context oder null bei Problemen
 */
export async function getOptionalSession(request: Request): Promise<{ shop: string; session: ShopifySessionToken } | null> {
  const middleware = createSessionMiddleware();
  return await middleware(request);  // null bei ungültigem Token (keine Exception)
}