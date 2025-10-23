Zielarchitektur (MVP → V1-ready):

Mobile Demo (React Native - ✅ IMPLEMENTIERT)
         │
         │(Storefront API for product/catalog, web checkout)
         ▼
Shopify ←→ Shopify Admin API (OAuth, Webhooks)
         │
         │ embedded Admin (React + Polaris + App Bridge)
         ▼
   Backend (Node/TS, Remix – Shopify CLI)
     ├─ Auth & Tenant Registry (shops, tokens, settings) ✅
     ├─ Config API (branding, theme options) ✅
     ├─ Product Proxy with 60s Cache ✅
     ├─ Webhook Handlers (products/update, app/uninstalled) ✅
     ├─ Health & Monitoring (/healthz, /readiness) ✅
     ├─ Cache Service (Redis/Memory) ✅
     └─ (later) Push Service, Automation Engine
     ├─ DB: SQLite (dev/staging), Postgres (prod ready)
     └─ Storage: S3 Asset Management ✅



Aktuelle Verzeichnisstruktur:

/turn2app            # Hauptapp (Shopify CLI + Remix)
  ├─ app/
  │  ├─ routes/      # API endpoints + Admin UI
  │  ├─ lib/         # Services (cache, monitoring, crypto)
  │  └─ components/  # React components (Polaris)
  ├─ prisma/         # DB schema + migrations
  └─ tests/          # Unit + Integration tests
/mobile-demo         # React Native Demo App ✅
  ├─ src/           # RN components, screens
  ├─ config/        # Branding integration
  └─ services/      # API clients
/docs               # Projektdokumentation
└─ scripts/         # Build, seed, deployment scripts


Kernkomponenten (✅ = IMPLEMENTIERT):

1) OAuth & Tenanting ✅
✅ Offline access token pro Shop speichern (AES-256-GCM verschlüsselt).
✅ HMAC-Validierung am Install-Callback.
✅ Shop table: id, shop_domain, access_token_enc, installed_at, uninstalled_at, settings_json.

2) Embedded Admin ✅
✅ App Bridge + Polaris integration.
✅ Session Tokens (JWT) für eingebettete Requests (kein Cookie-Login).
✅ Seiten: Overview, Branding/Theme, Asset Upload.

3) Webhooks ✅
✅ Registriert bei Install: APP_UNINSTALLED, PRODUCTS_UPDATE.
✅ Idempotente Handler; Cache-Invalidierung bei Product Updates.
✅ Shop-Daten löschen bei Uninstall.

4) Cache System ✅
✅ Redis/Memory cache mit TTL (60s Products, 5min Config).
✅ Shop-spezifische Cache-Keys für Mandantentrennung.
✅ Webhook-getriggerte Cache-Invalidierung.
✅ Health monitoring integration.

5) API Layer ✅
✅ Config API: GET /api/config → branding/theme JSON (mandantenbezogen).
✅ Product Proxy: GET /api/products → Storefront GraphQL + Cache.
✅ Settings API: POST /api/settings → Zod-validierte Updates.
✅ Upload API: POST /api/upload → S3 Asset Management.

6) Mobile Integration ✅
✅ React Native Demo consuming /api/config.
✅ Dynamic Branding (Farben, Logo, Name).
✅ Product List via Storefront API.
✅ Shopify Checkout WebView Integration.

7) Security & Observability ✅
✅ HTTPS only, HMAC-Validierung aller Shopify Signatures.
✅ Secrets server-side, Token-Verschlüsselung at rest.
✅ Structured Logging mit Request-IDs.
✅ Health endpoints /healthz, /readiness mit Cache-Status.

Nächste Schritte (Production-Ready):
- Sentry Error Tracking Integration
- Rate Limiting für API endpoints
- CI/CD Pipeline (GitHub Actions)
- Short-lived Storefront Token Management
- Managed Postgres mit Backups
- Queue/Worker für Background Jobs
- Extract BFF/API-Gateway falls Mobile skaliert
- IaC für Cloud Infrastructure