Ziel & Rahmen:

Produkt: SaaS-Shopify-App, die aus einem Händler-Shop eine mobile Shopping-App erzeugt (White-Label), inkl. Admin-Dashboard (embedded), Storefront-Datenzugriff und Push-Ready Backend.
Primärer Ansatz: Shopify CLI first — wir erzeugen und entwickeln alles über die offiziellen CLI-Werkzeuge, minimieren Boilerplate-Abweichungen und bleiben API-kompatibel.

Harte Constraints:

Zeit & Fokus: MVP in ≤12 Wochen. Feature-Cut rigoros (siehe mvp-scope.md).
Mehrmandantenfähigkeit: Strikte Mandantentrennung (pro Shop eigene OAuth-Session, Token, Settings, Webhooks).
Security by default: HMAC-Validierung, HTTPS überall, keine Secrets im Client, Token verschlüsselt at rest.
Shopify Konformität: Embedded App mit App Bridge + Session Tokens, kein 3rd-party Cookie-Login, Uninstall-Webhook löscht Händlerdaten.
Checkout-Flow MVP: Web-Checkout (Shopify Hosted). Native Checkout erst nach MVP.
App-Store-Richtlinien (Apple/Google): White-Label-Apps werden im Händler-Account veröffentlicht; starke Markenindividualisierung (Name, Icon, Farben, Startseite) — keine Spam/Template-Ablehnungen.
Observability: Error tracking & logs ab Tag 1 (Sentry/Cloud-Logs), Rate-Limit-Handling bei Shopify APIs.

Softe Constraints / Leitlinien:
Tech-Stack: Node/TypeScript (Shopify CLI Express-Template), React + Polaris im Admin, Postgres (prod), SQLite (dev), Redis (optional Cache), pnpm bevorzugt.
Infra: Dev lokal (ngrok), Staging + Prod in Cloud (PaaS oder Docker on K8s). IaC nach V1.
Kosten: MVP < 1.000 €/Monat Cloud; später skalierbar (DB-Plan, CDN).
DX / Automation: CI/CD (GitHub Actions), Lint/Type-check/test gates, Codegen für GraphQL, Auto-register Webhooks on install.

Out of Scope (MVP):
Kein Drag-&-Drop App-Studio (nur Basis-Konfiguration + 1–2 Startseiten-Layouts).
Keine Analytics-Suite (nur minimale Metriken/health).
Keine Partner-Integrationen (Klaviyo/Yotpo/etc.) außer Platzhaltern/Interfaces.
Kein nativer In-App-Checkout; kein Loyalty/Gamification.

Qualitätsbarrieren (Definition of Done – global):
Alle Secrets via .env* / Secret Manager.
Install-/Uninstall-Flow inkl. Datenbereinigung verifiziert.
Mind. 80% Testabdeckung in Auth/Webhooks/Shop-Lifecycle, Smoke-E2E fürs Happy Path.
“Cold Start to First Product List” < 2s (local/dev), < 600ms Backend-P99 auf Kern-APIs (staging).