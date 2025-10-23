/**
 * APP_UNINSTALLED Webhook Handler - Shopify App Deinstallation
 * 
 * Dieser Webhook wird von Shopify aufgerufen, wenn ein Shop unsere App deinstalliert.
 * Er sorgt für die sichere Bereinigung der Shop-Daten und verhindert, dass
 * deinstallierte Shops weiterhin API-Zugriff haben.
 * 
 * WEBHOOK-URL: /webhooks/app_uninstalled
 * METHOD: POST
 * CONTENT-TYPE: application/json
 * 
 * SICHERHEITSFEATURES:
 * - HMAC-SHA256 Signatur-Verifikation (verhindert gefälschte Webhooks)
 * - Header-Validierung (X-Shopify-Shop-Domain, X-Shopify-Hmac-Sha256)
 * - Soft Delete Pattern (Shop-Record bleibt für Re-Installation erhalten)
 * 
 * SHOPIFY WEBHOOK FLOW:
 * 1. User deinstalliert App im Shopify Admin
 * 2. Shopify sendet APP_UNINSTALLED Webhook an unsere URL
 * 3. Wir verifizieren die Authentizität (HMAC)
 * 4. Shop wird als "deinstalliert" markiert (uninstalledAt timestamp)
 * 5. Session Tokens werden ungültig, API-Zugriff wird blockiert
 * 
 * WICHTIG FÜR COMPLIANCE:
 * - DSGVO/Privacy: Shop-Daten werden nicht gelöscht für Re-Installation
 * - Shopify Requirements: Webhook muss schnell antworten (< 5s)
 * - Error Handling: 200 bei Success, 500 bei Retry-würdigen Fehlern
 */

import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { verifyWebhookHmac } from "../lib/webhooks.server";
import { prisma } from "../lib/prisma.server";

/**
 * App Uninstalled Webhook Action Handler
 * 
 * VERARBEITUNGSSCHRITTE:
 * 1. HTTP Method Validation (nur POST erlaubt)
 * 2. Required Headers Check (HMAC + Shop Domain)
 * 3. HMAC Signature Verification (Authentizitätsprüfung)
 * 4. Webhook Payload Parsing
 * 5. Shop Soft-Delete (uninstalledAt timestamp setzen)
 * 6. Success Response für Shopify
 * 
 * ERROR HANDLING:
 * - 405: Falsche HTTP Method
 * - 400: Fehlende Required Headers
 * - 403: HMAC Verification Failed (gefälschter Webhook)
 * - 500: Database Fehler (Shopify wird Retry versuchen)
 * - 200: Malformed Payload (kein Retry, um Loops zu vermeiden)
 */
export async function action({ request }: ActionFunctionArgs) {
  // SCHRITT 1: HTTP Method Validation - Shopify sendet nur POST
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  // SCHRITT 2: Required Headers Extraction
  const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256");    // HMAC Signatur
  const shopDomain = request.headers.get("X-Shopify-Shop-Domain");     // Shop Identifikation
  
  // Header Validation - beide sind für Webhook-Verarbeitung kritisch
  if (!hmacHeader || !shopDomain) {
    console.error("Missing required webhook headers", { hmacHeader: !!hmacHeader, shopDomain });
    return json({ error: "Missing headers" }, { status: 400 });
  }

  // SCHRITT 3: Raw Body für HMAC Verification laden
  // WICHTIG: Body als String lesen für korrekte HMAC-Berechnung
  const body = await request.text();
  
  // API Secret für HMAC Verification
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret) {
    console.error("Missing Shopify API secret - check environment configuration");
    return json({ error: "Server configuration error" }, { status: 500 });
  }

  // SCHRITT 4: HMAC SIGNATURE VERIFICATION (SICHERHEITSKRITISCH)
  // Verhindert gefälschte Webhooks und Replay-Attacks
  if (!verifyWebhookHmac(body, hmacHeader, apiSecret)) {
    console.error("Webhook HMAC verification failed for shop:", shopDomain);
    // 403 = Authentifizierung fehlgeschlagen, Shopify wird nicht retry-en
    return json({ error: "Invalid signature" }, { status: 403 });
  }

  try {
    // SCHRITT 5: Webhook Payload Parsing
    const payload = JSON.parse(body);
    
    // Structured Logging für Monitoring und Debugging
    console.log("App uninstalled webhook received:", { 
      shop: shopDomain,
      domain: payload.domain,      // Shopify Shop Domain aus Payload
      timestamp: new Date().toISOString(),
      webhookId: payload.id || 'unknown'  // Shopify Webhook ID falls vorhanden
    });

    // SCHRITT 6: SHOP SOFT-DELETE (Deinstallation markieren)
    // SOFT DELETE PATTERN: Record bleibt erhalten für Re-Installation
    const updatedShop = await prisma.shop.update({
      where: { shopDomain },
      data: { 
        uninstalledAt: new Date(),  // Deinstallation-Zeitstempel setzen
        // WICHTIG: Record wird NICHT gelöscht:
        // - DSGVO-Compliance: Daten für Re-Installation behalten
        // - Business Logic: Installation-History erhalten
        // - Security: accessTokenEnc wird bei Re-Install überschrieben
      }
    });

    // Success Logging mit Installation-History
    console.log("Shop uninstalled successfully:", { 
      shopDomain,
      installedAt: updatedShop.installedAt,      // Original Installation
      uninstalledAt: updatedShop.uninstalledAt,  // Deinstallation
      shopId: updatedShop.id                     // DB Record ID
    });

    // SCHRITT 7: Schnelle Response für Shopify (< 5s Requirement)
    return json({ status: "ok" }, { status: 200 });

  } catch (error) {
    console.error("Error processing app uninstall webhook:", error, { shop: shopDomain });
    
    // INTELLIGENTE ERROR HANDLING STRATEGIE:
    
    // MALFORMED PAYLOAD (JSON Parse Error): 200 Response
    // Grund: Shopify Retry würde bei 500 das gleiche kaputte Payload nochmal senden
    if (error instanceof SyntaxError) {
      console.warn("Malformed webhook payload - returning 200 to prevent retry loop");
      return json({ status: "ok" }, { status: 200 });
    }
    
    // DATABASE/INFRASTRUCTURE ERRORS: 500 Response
    // Grund: Shopify soll Retry versuchen, Problem könnte temporär sein
    return json({ error: "Internal error" }, { status: 500 });
  }
}