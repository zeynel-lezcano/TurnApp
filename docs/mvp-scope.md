MVP Zielbild (≤12 Wochen):

Ein Händler kann die App installieren, Branding setzen, und eine mobile App-Vorschau (Demo) rendert Shop-Produkte und leitet zu Shopify Checkout weiter.

## Features (IMPLEMENTIERT ✅):

**Core Shopify Integration:**
✅ Install/Uninstall Flow inkl. Token-Persistenz & Cleanup
✅ OAuth Flow mit HMAC-Validierung und verschlüsselter Token-Speicherung  
✅ Webhooks: APP_UNINSTALLED, PRODUCTS_UPDATE mit Cache-Invalidierung
✅ Session Token Middleware für sichere API-Authentifizierung

**Embedded Admin UI:**
✅ Branding (Name, Primärfarbe, Logo upload → S3/Cloud-Storage)
✅ Basiskonfig mit dynamischem Branding
✅ Anzeigen von Storefront-Endpoint & Mobile App Info
✅ Polaris + App Bridge Integration für embedded Experience

**API Layer:**
✅ Config API: GET /api/config → branding/theme/layout JSON (mandantenbezogen)
✅ Product Proxy: GET /api/products → Storefront GraphQL + 60s Cache
✅ Settings API: POST /api/settings → Zod-validierte Branding-Updates
✅ Upload API: POST /api/upload → S3 Asset Management

**Mobile Integration:**
✅ Mobile Demo (React Native) consuming /api/config
✅ Dynamic Branding Application (Farben, Logo, Name)
✅ Product List via Storefront API Integration
✅ Shopify Checkout WebView Integration

**Development & Operations:**
✅ Dev Experience: ngrok-Tunnel, seed script, one-command dev
✅ Health & Monitoring: /healthz, /readiness endpoints
✅ Cache Integration: Redis/Memory mit TTL-basierter Invalidierung
✅ Structured Logging mit Request-IDs
✅ Comprehensive Test Suite (Unit + Integration)

Features (OUT / später):

Push Service, Segmente, Automation.
Drag&Drop-Builder.
Partner-Integrationen.
Native Checkout & Wallets.
Analytics-Suite.

Akzeptanzkriterien (MVP):

Installierbar in einem Shopify Dev Store (OAuth läuft, HMAC geprüft); Admin lädt embedded.
Uninstall löscht Shop-Datensatz (nachweisbar).
Admin Branding speichert & wird in /api/config je Shop ausgeliefert.
Mobile Demo (RN/Flutter template) kann:
    /api/config laden und Farben anwenden,
    Produkte via Storefront abfragen,
    Checkout-Link öffnen.
Stabilität: 0 unhandled rejections, strukturierte Logs, Health-Checks OK.

Tasks (Backlog in Reihenfolge):

1. Repo & Shopify CLI Scaffold (Node/TS + React Admin).
2. OAuth & Shop registry (DB), crypto at rest.
3. Embedded Admin Shell (App Bridge + Polaris).
4. Branding Settings + upload (S3) + config API.
5. Webhooks register/handle (uninstall, products).
6. Product Proxy (optional) + simple cache.
7. Local Dev (ngrok), seeders, smoke tests.
8. RN Demo App consuming config + Storefront (post-MVP if time allows).