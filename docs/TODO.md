# Aktuelle ToDos

> Quelle: docs/backlog.yaml (auto-generiert)

## NOW
- [ ] Dev Seed Script (id: dev-seed-script) — pnpm seed command with dummy shop data, smoke test scripts
- [ ] Logo Upload to S3/Cloud Storage (id: logo-upload-s3) — File upload endpoint, S3/cloud storage integration, asset URL generation
- [ ] Session Token Middleware Hardening (id: session-token-middleware) — JWT verification middleware, 401 error handling, request context shop resolution
- [ ] Config API Schema Validation (id: config-api-validation) — Zod schema validation for config endpoints, error responses, type safety


## NEXT


## LATER
- [ ] Product Proxy + Cache (id: product-proxy) — GET /api/products, 60s Cache


## DONE
- [x] Shopify CLI App Setup + DB Schema (id: oauth-setup) — Shopify CLI scaffolding, Prisma schema für shops table, .env template
- [x] OAuth Install-Flow + HMAC (id: oauth-flow) — /auth/callback endpoint, HMAC-Validierung, Code-Token-Tausch
- [x] Embedded Admin Shell (id: admin-shell) — Polaris+App Bridge, Overview + Branding Seite
- [x] Branding & Config API (id: branding-config-api) — /api/config GET, /api/settings POST + Zod
- [x] Webhooks (APP_UNINSTALLED, PRODUCTS_UPDATE) (id: webhooks-min) — Registrierung + Handler, idempotent
- [x] Token-Verschlüsselung at rest (id: token-encryption) — crypto utilities, AES-256-GCM für access_token_enc
- [x] Shop-Registrierung + Session (id: shop-registry) — Shop-Model CRUD, Session-Token für embedded admin
- [x] OAuth Auth-Flow Tests (id: oauth-tests) — Unit tests für HMAC, encryption, integration test install-flow
