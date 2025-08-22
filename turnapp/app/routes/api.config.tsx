/**
 * /api/config - Mobile App Configuration Endpoint
 * 
 * Dieser API Endpoint stellt die zentrale Konfiguration für Mobile Apps bereit.
 * Er liefert Shop-spezifische Branding-Daten, API-Endpoints und App-Metadaten,
 * die Mobile Apps benötigen, um sich an den Shop anzupassen.
 * 
 * API ENDPOINT: GET /api/config?shop=myshop.myshopify.com
 * 
 * AUTHENTIFIZIERUNG:
 * - flexibleAuth(): Unterstützt sowohl Session Token (Admin UI) als auch ?shop= Parameter (Mobile)
 * - Mobile Apps verwenden Shop Parameter da sie keine Shopify Session haben
 * - Admin UI kann Session Token verwenden für Preview-Funktionen
 * 
 * RESPONSE STRUKTUR:
 * {
 *   shop: "myshop.myshopify.com",
 *   branding: { brandName, primaryColor, logoUrl, tagline },
 *   storefrontEndpoint: "https://shop.../graphql.json",
 *   appVersion: "1.0.0"
 * }
 * 
 * VERWENDUNG:
 * - Mobile Apps laden diese Config beim App-Start
 * - Branding wird für UI-Customization verwendet (Farben, Logo, Name)
 * - storefrontEndpoint für direkte Shopify Storefront API Calls
 * 
 * CACHING:
 * - 5 Minuten Public Cache (CDN-freundlich)
 * - Reduziert DB-Load bei häufigen Mobile App Starts
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { ConfigResponseSchema } from "~/lib/validation.server";
import { getShopSettings } from "~/lib/shop.server";
import { flexibleAuth, logRequest } from "~/lib/middleware.server";

/**
 * Config API Loader - Verarbeitet GET Requests für Mobile App Konfiguration
 * 
 * REQUEST FLOW:
 * 1. flexibleAuth() - Session Token ODER ?shop= Parameter validieren
 * 2. Shop-Settings aus Datenbank laden (nur settings, KEIN Token)
 * 3. Branding-Daten aufbereiten mit Fallbacks für fehlende Werte
 * 4. Shopify Storefront API Endpoint für Mobile Apps bereitstellen
 * 5. Schema-Validierung für Type Safety
 * 6. Response mit Cache Headers
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // SCHRITT 1: Authentifizierung - Mobile Apps nutzen ?shop= Parameter
  const context = await flexibleAuth(request);
  logRequest(request, context);

  try {
    // SCHRITT 2: Shop-Einstellungen laden (OHNE Token für Sicherheit)
    // getShopSettings() lädt nur Branding-Daten, nicht die sensiblen Access Tokens
    const settings = await getShopSettings(context.shop);

    // Shop nicht gefunden oder deinstalliert
    if (!settings) {
      return json({ error: "Shop not found or not active" }, { status: 404 });
    }

    // SCHRITT 3: Branding-Daten aufbereiten mit intelligenten Fallbacks
    const branding = {
      // Shop-Name: Einstellung oder automatisch aus Domain extrahieren ("myshop" aus "myshop.myshopify.com")
      brandName: settings.brandName || context.shop.split('.')[0],
      
      // Shopify-Grün als Default für bessere Brand-Konsistenz
      primaryColor: settings.primaryColor || "#007C3B",
      
      // Logo: Upload-URL oder leer (Mobile App kann Default-Logo verwenden)
      logoUrl: settings.logoUrl || "",
      
      // Tagline: Custom oder generischer Fallback
      tagline: settings.tagline || "Your mobile shopping experience"
    };

    // SCHRITT 4: Mobile App Configuration zusammenstellen
    const configResponse = {
      // Shop-Domain für Mobile App Identifikation
      shop: context.shop,
      
      // Branding für UI-Customization
      branding,
      
      // Direkter Shopify Storefront API Endpoint für Mobile Apps
      // Mobile Apps können damit direkt Produkte laden ohne unseren Server
      storefrontEndpoint: `https://${context.shop}/api/2024-01/graphql.json`,
      
      // App-Version für Feature-Compatibility Checks
      appVersion: "1.0.0"
    };

    // SCHRITT 5: Schema-Validierung mit Zod für Type Safety
    // ConfigResponseSchema stellt sicher, dass alle Required Fields vorhanden sind
    const validatedConfig = ConfigResponseSchema.parse(configResponse);

    // SCHRITT 6: Response mit CDN-freundlichen Cache Headers
    return json(validatedConfig, {
      headers: {
        // Public Cache für 5 Minuten - reduziert DB-Load bei häufigen Mobile App Starts
        "Cache-Control": "public, max-age=300",
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    // Fehlerbehandlung: Alle unerwarteten Errors als 500 behandeln
    console.error("Config API error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}