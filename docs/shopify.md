Shopify Grundlagen (für dieses Projekt)

APIs:

Admin API (GraphQL/REST): OAuth-geschützt. Nutzen für: App-Install, Webhooks registrieren, ggf. Storefront Token erstellen, Shop-Info.
Storefront API (GraphQL): Shop-Daten für Käufer-Frontends (Produkte, Collections, Cart/Checkout). Vom Mobile-Client oder via Backend-Proxy konsumiert.

Auth & Session:

OAuth Install Flow:
Händler installiert App (Partner Dashboard/App Store).
Redirect zu unserer App mit shop, code, hmac.
HMAC prüfen, Code gegen Offline-Token tauschen.
Token verschlüsselt speichern; Shop registrieren; Webhooks registrieren.
Embedded Admin: App Bridge + Session Token. Keine Drittanbieter-Cookies benutzen.

Webhooks (Pflicht): 

APP_UNINSTALLED: Shopsatz & Secrets löschen, S3-Assets optional behalten/entkoppeln.
PRODUCTS_UPDATE/INVENTORY_LEVELS_UPDATE: optional Cache invalidieren, mobile clients später anstoßen.

Datenmodell (minimal):

shops(
  id uuid pk,
  shop_domain text unique,
  access_token_enc text not null,
  installed_at timestamptz,
  uninstalled_at timestamptz,
  settings jsonb default '{}'
)

assets(
  id uuid pk,
  shop_id fk,
  kind enum('logo','banner'),
  url text,
  created_at timestamptz
)


Sicherheit:

HMAC für Query-Validierung (Install return) und Webhook-HMAC (X-Shopify-Hmac-Sha256).
Rate Limits: Admin/Storefront GraphQL Budgets beachten; Exponential Backoff & retries.
Tokens: serverseitig verschlüsselt; niemals an Clients loggen.
PII/DSGVO: Nur nötige Daten speichern; Löschroutinen (Uninstall, Subject Requests) vorsehen.

Mobile Zugriffspfade:

Direkt (empfohlen nach MVP-Härtung): App holt kurzlebigen Storefront Token vom Backend per authenticated call (JWT), nutzt Storefront GraphQL direkt.
Proxy (MVP-freundlich): App ruft GET /api/products etc.; Backend spricht Storefront. Besseres Caching + Limit-Kontrolle, aber höhere Latenz.