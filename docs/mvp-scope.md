MVP Zielbild (≤12 Wochen):

Ein Händler kann die App installieren, Branding setzen, und eine mobile App-Vorschau (Demo) rendert Shop-Produkte und leitet zu Shopify Checkout weiter.

Features (IN):

Install/Uninstall Flow inkl. Token-Persistenz & Cleanup.

Embedded Admin UI:
    Branding (Name, Primärfarbe, Logo upload → S3/Cloud-Storage).
    Basiskonfig (Start-Layout: Hero Banner + Produkt-Grid).
    Anzeigen von Storefront-Endpoint & Mobile App Info.
Config API: GET /api/config → branding/theme/layout JSON (mandantenbezogen).
(Optional) Product Proxy: GET /api/products → pass-through + minimal cache.
Webhooks: APP_UNINSTALLED, PRODUCTS_UPDATE.
Dev Experience: ngrok-Tunnel, seed script, one-command dev.

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