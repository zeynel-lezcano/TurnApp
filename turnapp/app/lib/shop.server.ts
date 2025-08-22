/**
 * Shop Management System für TurnApp - Shopify Shop Verwaltung
 * 
 * Diese Datei verwaltet alle Shopify-Shop-Daten und stellt die zentrale Schnittstelle
 * für Shop-Operationen bereit. Sie abstrahiert die Datenbank-Zugriffe und kümmert
 * sich um die sichere Handhabung von Access Tokens.
 * 
 * HAUPTFUNKTIONEN:
 * - Shop-Daten aus DB laden mit Token-Entschlüsselung
 * - Shop-Status prüfen (installiert/deinstalliert)
 * - Shop-Einstellungen (Branding, Config) verwalten
 * 
 * SICHERHEIT:
 * - Access Tokens werden immer verschlüsselt gespeichert (accessTokenEnc)
 * - Entschlüsselung nur bei tatsächlicher Verwendung (API Calls)
 * - Deinstallierte Shops werden ausgeschlossen
 * 
 * VERWENDUNG IM PROJEKT:
 * - admin-api.server.ts: Lädt Shop + Token für Admin API Calls
 * - storefront.server.ts: Lädt Shop + Token für Storefront API Calls
 * - middleware.server.ts: Prüft Shop-Status bei Session-Validierung
 * - API Routes: Laden Shop-Settings für Config/Branding Endpoints
 */

import { prisma } from "./prisma.server.js";
import { decryptToken } from "./crypto.server.js";

/**
 * Shop-Datenstruktur mit entschlüsseltem Access Token
 * 
 * Diese Interface definiert die Struktur eines vollständig geladenen Shops
 * inklusive entschlüsseltem Shopify Access Token für API-Zugriffe.
 * 
 * FELDER:
 * - shopDomain: Eindeutige Shop-Identifikation (z.B. "myshop.myshopify.com")
 * - accessToken: Entschlüsselter Shopify Access Token für API Calls
 * - installedAt: Zeitpunkt der App-Installation
 * - uninstalledAt: Zeitpunkt der Deinstallation (null = noch installiert)
 * - settings: JSON-Objekt mit Shop-spezifischen Einstellungen (Branding, etc.)
 * 
 * WICHTIG: 
 * accessToken ist hier im Klartext - diese Struktur niemals loggen oder serialisieren!
 */
export interface ShopWithToken {
  shopDomain: string;    // Shop-Domain als eindeutige Identifikation
  accessToken: string;   // SENSIBEL: Entschlüsselter Shopify Access Token
  installedAt: Date;     // Installation-Zeitstempel
  uninstalledAt: Date | null;  // null = installiert, Date = deinstalliert
  settings: any;         // Shop-spezifische Konfiguration (JSON parsed)
}

/**
 * Lädt Shop-Daten mit entschlüsseltem Access Token für Shopify API Calls
 * 
 * VERWENDUNGSZWECK:
 * - Vorbereitung für Shopify Admin/Storefront API Calls
 * - Laden von Shop-Daten mit sicherheitsrelevanten Tokens
 * - Zentrale Funktion für alle Shop-API-Integrationen
 * 
 * SICHERHEITSFEATURES:
 * 1. Prüft Installation-Status (deinstallierte Shops werden ausgeschlossen)
 * 2. Entschlüsselt Access Token nur bei aktivem Shop
 * 3. Parst JSON-Settings sicher mit Fallback auf leeres Objekt
 * 
 * VERWENDUNG:
 * - admin-api.server.ts: getShopInfo(), getAdminProducts() - lädt Shop für Admin API
 * - storefront.server.ts: getStorefrontProducts() - lädt Shop für Storefront API  
 * - Nie Client-seitig verwenden (würde Access Token exponieren)
 * 
 * @param shopDomain - Shop Domain (z.B. "myshop.myshopify.com")
 * @returns Shop-Daten mit entschlüsseltem Token oder null (nicht gefunden/deinstalliert)
 */
export async function getShopWithToken(shopDomain: string): Promise<ShopWithToken | null> {
  try {
    const shop = await prisma.shop.findUnique({
      where: { shopDomain }
    });

    if (!shop || shop.uninstalledAt) {
      return null;
    }

    // SICHERHEITSKRITISCH: Access Token Entschlüsselung
    // Token wird nur hier entschlüsselt und sofort für API Call verwendet
    // Falls Entschlüsselung fehlschlägt, wird null zurückgegeben
    const accessToken = decryptToken(shop.accessTokenEnc);

    return {
      shopDomain: shop.shopDomain,
      accessToken,
      installedAt: shop.installedAt,
      uninstalledAt: shop.uninstalledAt,
      settings: shop.settings ? JSON.parse(shop.settings) : {}  // Sichere JSON-Parsing mit Fallback
    };
  } catch (error) {
    console.error('Failed to get shop with token:', error);
    return null;
  }
}

/**
 * Prüft ob Shop installiert und aktiv ist (ohne Token-Zugriff)
 * 
 * LIGHTWEIGHT CHECK:
 * - Nur uninstalledAt-Feld abfragen (performance-optimiert)
 * - Kein Token-Zugriff nötig (sicherer für häufige Prüfungen)
 * - Schnelle Validierung für Middleware und Guards
 * 
 * VERWENDUNG:
 * - middleware.server.ts: Session-Validierung ohne Token-Entschlüsselung
 * - API Guards: Schnelle Shop-Status Prüfung vor aufwendigen Operationen
 * - Health Checks: Prüfung der Shop-Verfügbarkeit
 * 
 * RÜCKGABE-LOGIK:
 * - true: Shop existiert UND ist nicht deinstalliert
 * - false: Shop nicht gefunden ODER deinstalliert ODER Datenbankfehler
 * 
 * @param shopDomain - Shop Domain für Status-Prüfung
 * @returns true wenn Shop aktiv installiert ist, sonst false
 */
export async function isShopActive(shopDomain: string): Promise<boolean> {
  try {
    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
      select: { uninstalledAt: true }
    });

    // Shop ist aktiv wenn er existiert UND nicht deinstalliert wurde
    // uninstalledAt === null bedeutet "noch installiert"
    return shop ? !shop.uninstalledAt : false;
  } catch (error) {
    console.error('Failed to check shop status:', error);
    return false;
  }
}

/**
 * Lädt Shop-Einstellungen ohne Access Token (sicherheitsoptimiert)
 * 
 * SICHERHEITSFEATURE:
 * - Lädt nur settings-Feld, NICHT den verschlüsselten Access Token
 * - Reduziert Angriffsoberfläche (kein Token im Memory)
 * - Optimiert für häufige Config/Branding-Abfragen
 * 
 * VERWENDUNG:
 * - api.config.tsx: Lädt Branding-Settings für Mobile App Config
 * - api.settings.tsx: Lädt aktuelle Einstellungen für Admin Interface
 * - Alle nicht-API Operationen die nur Settings brauchen
 * 
 * SETTINGS-STRUKTUR:
 * {
 *   branding: { primaryColor, logoUrl, tagline },
 *   features: { ... },
 *   customization: { ... }
 * }
 * 
 * @param shopDomain - Shop Domain für Settings-Load
 * @returns Parsed JSON Settings oder null (nicht gefunden/deinstalliert)
 */
export async function getShopSettings(shopDomain: string): Promise<any | null> {
  try {
    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
      select: { 
        settings: true,      // Nur Settings laden (kein Token für Sicherheit)
        uninstalledAt: true  // Status-Check für Installation
      }
    });

    if (!shop || shop.uninstalledAt) {
      return null;
    }

    // Sichere JSON-Deserialisierung mit Fallback auf leeres Objekt
    // Falls settings null/undefined ist, wird {} zurückgegeben
    return shop.settings ? JSON.parse(shop.settings) : {};
  } catch (error) {
    console.error('Failed to get shop settings:', error);
    return null;
  }
}