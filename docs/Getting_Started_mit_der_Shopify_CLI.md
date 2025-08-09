Audience: Devs & AI-Agents (Cursor / Claude Code).
Ziel: In <15 Min lokal lauffähige, eingebettete App mit funktionierender Installation gegen einen Shopify Dev-Store.

Voraussetzungen:
Node ≥ 18, pnpm ≥ 8
Git, OpenSSL
Shopify Partner Account + Dev Store
Shopify CLI installiert
ngrok (oder Cloudflare Tunnel)
Postgres lokal (Docker) oder SQLite für dev


1) Projekt anlegen (Shopify CLI-first)
Option A (aktuelle Empfehlung):
npm create @shopify/app@latest my-shopify-app
# → Node + React (Polaris) wählen, TypeScript aktivieren
cd my-shopify-app
pnpm install

2) Umgebung konfigurieren
.env Beispiel (dev)
SHOPIFY_API_KEY=xxxxx
SHOPIFY_API_SECRET=xxxxx
SCOPES=read_products,write_products,read_themes,read_customers
HOST=scaffolded-by-cli
APP_URL=https://<your-ngrok-subdomain>.ngrok.app
# DB
DATABASE_URL=file:./dev.sqlite
# or Postgres:
# DATABASE_URL=postgresql://user:pass@localhost:5432/app?sslmode=disable
SESSION_KEYS=comma,separated,random,keys

ngrok starten
ngrok http 3000
# URL in Partners Dashboard als App URL & Callback setzen (e.g., https://<sub>.ngrok.app)


3) Dev-Server & erste Installation
pnpm dev
# CLI öffnet den Browser → Dev Store auswählen → App installieren
Erwartet:
OAuth läuft durch, Admin UI lädt embedded im Shopify Admin.
In der App-DB entsteht ein shops Datensatz mit Token.


4) Embedded Admin UI (Polaris + App Bridge)
Admin-Shell liegt in /apps/admin (oder vom CLI vorgegebenen Pfad).

Beispiel-View „Branding“ erstellen:
// apps/admin/src/routes/Branding.tsx
export default function Branding() {
  // form (logo upload, primaryColor), POST /api/settings
}

Backendlayer:
// apps/web/src/routes/api/settings.post.ts
// verify session token, upsert shops.settings JSON, return 200

5) Webhooks registrieren (Install Hook)
In der App-Bootstrap/after-auth Logik:
APP_UNINSTALLED → DELETE Shop row.
PRODUCTS_UPDATE → invalidate cache.
CLI-Gerüst hat üblicherweise registerWebhooks() — ergänze Topics & Handlers.


6) Config API bereitstellen
// GET /api/config
// auth: session token; loads shop by session.shop, returns {brand, theme, layout, storefrontEndpoint}

7) (Optional) Product Proxy
// GET /api/products?limit=20
// server calls Storefront API with tenant's token, caches 60s

8) Lokale Tests
pnpm test       # unit
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit

9) Cursor / Claude Code – Prompts & Tasks
Task: Hardening OAuth + HMAC
You are modifying the Shopify CLI Node/TS scaffold.
Implement strict HMAC validation on install callback and webhook handlers.
Encrypt offline access tokens before persisting (libsodium or Node crypto).
Expose verifyShopifyHmac(req) and withVerifiedWebhook(handler) utilities with tests.

Task: Embedded Session Tokens
Migrate any cookie-based admin calls to App Bridge session tokens.
Add a server middleware that verifies and decodes the JWT from X-Shopify-Session-Token.
Reject unauthenticated requests with 401.
Task: Config API + Branding form
Create /api/config (GET) and /api/settings (POST).
Schema: brandName, primaryColor, logoUrl, homeLayout:{hero:..., sections:[grid, banner]}.
Add a Polaris form in /admin that updates this schema per tenant.
Add zod validation on server, write unit tests.

Task: Webhooks
Register APP_UNINSTALLED and PRODUCTS_UPDATE during install.
Create /webhooks/app_uninstalled → delete shop data (soft delete) and revoke sessions.
Create /webhooks/products_update → invalidate cache key "sf:products:<shop>".
Return 200 quickly; move work to a queue if needed.

Task: Seed & Smoke
Add pnpm seed to create a dev shop row with dummy settings.
Add pnpm smoke to run a supertest hitting /api/config with a mocked session, expecting 200 + schema.


10) Deploy (Staging Quickstart)
DB: Managed Postgres (Railway/Neon/Render/Cloud SQL).
App URL: Setze produktive DOMAIN + HTTPS.
ENV: Secrets als Manager/Actions Secrets.
CI:
pnpm install --frozen-lockfile
pnpm lint && pnpm typecheck && pnpm test
pnpm build
Deploy (PaaS or Docker).


Troubleshooting:
403 in embedded Admin: Session Token fehlt/ungültig → App Bridge fetch + Server-Middleware prüfen.
Webhook 401/400: Prüfe X-Shopify-Hmac-Sha256 und raw body handling (verwende unparsed body für HMAC).
Dev Store nicht sichtbar: Partner Account/Permissions prüfen, App url/callback stimmen mit ngrok URL überein.