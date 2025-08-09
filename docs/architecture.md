Zielarchitektur (MVP → V1-ready):

Mobile App (RN/; später)
         │
         │(Storefront API for product/catalog, web checkout)
         ▼
Shopify ←→ Shopify Admin API (OAuth, Webhooks)
         │
         │ embedded Admin (React + Polaris + App Bridge)
         ▼
   Backend (Node/TS, Express – Shopify CLI)
     ├─ Auth & Tenant Registry (shops, tokens, settings)
     ├─ Config API (branding, theme options)
     ├─ Proxy/Facade (optional) to Storefront/Admin
     ├─ Webhook Handlers (products/update, app/uninstalled, …)
     ├─ Build/CI Hooks (later: trigger mobile builds)
     └─ (later) Push Service, Automation Engine
     ├─ DB: Postgres (prod), SQLite (dev)
     └─ Cache: Redis (optional)



Verzeichnisse (Vorschlag):

/apps
  /admin            # embedded admin UI (React + Polaris)
  /web              # Node/Express app (Shopify CLI server)
  /mobile           # placeholder for RN/Flutter template (post-MVP)
/docs               # this folder
/packages
  /types            # shared TypeScript types
  /config           # shared config (eslint, tsconfig)
/infra              # (post-MVP) IaC, k8s manifests


Kernkomponenten:

1) OAuth & Tenanting
Offline access token pro Shop speichern (verschlüsselt).
HMAC-Validierung am Install-Callback.
Shop table: id, shop_domain, access_token_enc, installed_at, uninstalled_at, settings_json.
2) Embedded Admin
App Bridge + Polaris.
Session Tokens (JWT) für eingebettete Requests (kein Cookie-Login).
Grundseiten: Overview, Branding/Theme, API-Keys/Endpoints, Uninstall-Info.
3) Webhooks
Registrieren bei Install: APP_UNINSTALLED, PRODUCTS_UPDATE (oder products/update), optional INVENTORY_LEVELS_UPDATE.
Idempotente Handler; Löschen von Shop-Daten bei Uninstall.
Retries (Shopify) korrekt beantworten (200 schnell, async work offloaded).
4) Datenfluss (MVP)
Produkt-/Katalogdaten: direkt via Storefront API (Mobile) oder via Backend-Proxy (optional Caching).
Checkout: In-App WebView/Browser zu Shopify Checkout URL.
Branding/Theme: Mobile lädt JSON-Konfig vom Backend.
5) Sicherheit
HTTPS only.
HMAC Check aller Shopify Signatures (OAuth return, Webhooks).
Secrets im Server, nie im Mobile Bundle. Storefront Access Token nicht fest einbacken → short-lived / fetch via backend.
6) Observability
Request-ID pro call; strukturierte Logs (JSON).
Sentry/Crashlytics hooks (admin & mobile).
Health endpoints /healthz, /readiness.

Skalierung (nach MVP):
Caching Layer (Redis) für Produktlisten & Shop config.
Queue/Worker (BullMQ/RabbitMQ) für Webhook-Fanout & Push.
Extract BFF/API-Gateway (GraphQL) falls Mobile verlangt.
Postgres→Managed; Read-replicas & backups; secrets→manager.