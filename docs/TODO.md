# Aktuelle ToDos

> Quelle: docs/backlog.yaml (auto-generiert)

## NOW
- [ ] Mobile Home Screen Component (id: mobile-home-screen) — Hero Banner, Featured Collections, Quick Actions, Search Bar - responsive design
- [ ] Product Catalog & Grid View (id: product-catalog-screen) — Grid/List toggle, Filters, Sort, Search, Infinite scroll, Categories navigation
- [ ] Product Detail Screen (id: product-detail-screen) — Image gallery, Variants selection, Add to Cart, Product description, Reviews placeholder
- [ ] Shopping Cart & Checkout Flow (id: cart-checkout-flow) — Cart sidebar/screen, Quantity updates, Remove items, Checkout button → Shopify Checkout


## NEXT
- [ ] Search & Autocomplete System (id: search-autocomplete) — Real-time search, suggestions, recent searches, voice search, search analytics
- [ ] User Account & Profile Screens (id: user-account-screens) — Login/Register, Profile editing, Order history, Wishlist, Address book
- [ ] Navigation & Menu Components (id: navigation-components) — Bottom tab bar, Drawer menu, Category navigation, Breadcrumbs, Back navigation
- [ ] App Onboarding & First-Time UX (id: onboarding-flow) — Welcome screens, Feature introduction, Permissions requests, Shop selection
- [ ] Mobile Preview in Admin (id: mobile-preview-admin) — Live preview iframe, Device frames, Orientation toggle, QR code generation
- [ ] Enhanced Brand Customization UI (id: brand-customization-ui) — Color picker, Font selection, Layout templates, Logo positioning, Theme presets
- [ ] Collections & Categories API (id: collections-api) — GET /api/collections, Nested categories, Collection filtering, Featured collections
- [ ] Search API Enhancement (id: search-api) — Search endpoint, Filters, Faceted search, Autocomplete, Analytics tracking
- [ ] Wishlist & Favorites API (id: wishlist-api) — User wishlist storage, Add/remove items, Wishlist sharing, Analytics
- [ ] User Preferences & Settings API (id: user-preferences-api) — User settings storage, App preferences, Notification settings, Theme preferences


## LATER
- [ ] Social Features & Sharing (id: social-features) — Social login, Share products, Social proof, Reviews integration, User-generated content
- [ ] Promotional & Marketing Features (id: promotional-features) — Discount codes, Banners, Flash sales, Loyalty program, Referral system
- [ ] Advanced Product Features (id: advanced-product-features) — Product comparison, Recently viewed, Recommendations, Bundling, Subscriptions
- [ ] Offline Support & PWA (id: offline-support) — Service worker, Offline browsing, Cache strategies, Background sync
- [ ] Animations & Micro-Interactions (id: animations-micro-interactions) — Loading animations, Transition effects, Gesture feedback, Smooth scrolling
- [ ] Accessibility & WCAG Compliance (id: accessibility-enhancements) — Screen reader support, Keyboard navigation, High contrast mode, Voice navigation
- [ ] Multi-language Support (id: multi-language-support) — i18n für mobile apps, localized content, currency handling, RTL support
- [ ] Push Notification Service (id: push-notifications) — Push infrastructure, segmentation, automation triggers, delivery tracking
- [ ] Advanced Caching Strategy (id: advanced-caching) — Multi-layer caching, cache warming, predictive preloading
- [ ] Advanced Analytics & Reporting (id: advanced-analytics) — Shop performance metrics, conversion tracking, dashboard visualization, A/B testing


## DONE
- [x] Shopify CLI App Setup + DB Schema (id: oauth-setup) — Shopify CLI scaffolding, Prisma schema für shops table, .env template
- [x] OAuth Install-Flow + HMAC (id: oauth-flow) — /auth/callback endpoint, HMAC-Validierung, Code-Token-Tausch
- [x] Embedded Admin Shell (id: admin-shell) — Polaris+App Bridge, Overview + Branding Seite
- [x] Branding & Config API (id: branding-config-api) — /api/config GET, /api/settings POST + Zod
- [x] Webhooks (APP_UNINSTALLED, PRODUCTS_UPDATE) (id: webhooks-min) — Registrierung + Handler, idempotent
- [x] Token-Verschlüsselung at rest (id: token-encryption) — crypto utilities, AES-256-GCM für access_token_enc
- [x] Shop-Registrierung + Session (id: shop-registry) — Shop-Model CRUD, Session-Token für embedded admin
- [x] OAuth Auth-Flow Tests (id: oauth-tests) — Unit tests für HMAC, encryption, integration test install-flow
- [x] Dev Seed Script (id: dev-seed-script) — pnpm seed command with dummy shop data, smoke test scripts
- [x] Logo Upload to S3/Cloud Storage (id: logo-upload-s3) — File upload endpoint, S3/cloud storage integration, asset URL generation
- [x] Session Token Middleware Hardening (id: session-token-middleware) — JWT verification middleware, 401 error handling, request context shop resolution
- [x] Config API Schema Validation (id: config-api-validation) — Zod schema validation for config endpoints, error responses, type safety
- [x] Storefront API Setup (id: storefront-api-setup) — GET /api/products proxy mit Shopify Storefront GraphQL, error handling, rate limits
- [x] Dev Tunnel Setup (ngrok) (id: dev-tunnel-setup) — ngrok integration für local dev, webhook endpoint routing, .env setup
- [x] Admin API Integration (id: admin-api-integration) — GraphQL client setup für Admin API, shop validation, product queries
- [x] Health & Monitoring Endpoints (id: health-endpoints) — /healthz, /readiness endpoints, request logging, error tracking setup
- [x] Mobile Demo Scaffold (id: mobile-demo-scaffold) — RN/Flutter template consuming /api/config, basic product list, checkout links
- [x] Simple Cache Integration (id: cache-integration) — Redis/memory cache für Product Proxy, 60s TTL, cache invalidation
- [x] Error Tracking Setup (MVP → Production) (id: error-tracking-setup) — Sentry integration, structured logging, error reporting, performance monitoring
- [x] Rate Limit Implementation (MVP → Production) (id: rate-limit-implementation) — Rate limiting middleware, Shopify GraphQL budget management, exponential backoff
- [x] CI/CD Pipeline Setup (MVP → Production) (id: ci-cd-setup) — GitHub Actions, lint/test/build gates, automated deployment, rollback strategy
- [x] Storefront Token Management (Production) (id: storefront-token-management) — Short-lived storefront access tokens, token refresh API, security hardening
