# turn2app Mobile Demo

React Native Demo App für turn2app Shopify Integration. Diese App demonstriert wie Mobile Apps die turn2app Config API konsumieren und Dynamic Branding verwenden können.

## Features

✅ **Dynamic Branding** - Lädt Shop-spezifische Farben, Namen und Logo von turn2app API  
✅ **Product List** - Zeigt Shopify Products via turn2app Backend Proxy  
✅ **Shopify Checkout** - WebView Integration für Shopify Hosted Checkout  
✅ **Error Handling** - Graceful Fallbacks und Retry Funktionen  
✅ **TypeScript** - Vollständige Typisierung für turn2app APIs  

## Setup

### Voraussetzungen

- Node.js ≥ 18
- React Native CLI
- Android Studio (für Android) oder Xcode (für iOS)
- turn2app Backend lokal oder deployed

### Installation

```bash
# Dependencies installieren
npm install
# oder
yarn install

# iOS Dependencies (nur macOS)
cd ios && pod install && cd ..
```

### Konfiguration

1. Kopiere `.env.example` zu `.env`:
```bash
cp .env.example .env
```

2. Setze deine turn2app Backend URL und Test Shop:
```bash
# .env
TURN2APP_API_URL=https://your-app.ngrok.app
SHOP_DOMAIN=your-test-shop.myshopify.com
DEMO_MODE=true
```

### Development

```bash
# Metro bundler starten
npm start

# Android
npm run android

# iOS
npm run ios
```

## Architektur

```
src/
├── components/          # React Native Components
│   ├── ProductCard.tsx  # Product Display mit Branding
│   └── CheckoutWebView.tsx # Shopify Checkout WebView
├── services/           # API Services
│   └── Turn2AppAPI.ts   # turn2app Backend Communication
├── types/             # TypeScript Interfaces
│   └── index.ts       # turn2app API Types
└── App.tsx           # Main App Component
```

## turn2app Integration

### Config Loading

```typescript
const api = new Turn2AppAPI(shopDomain);
const config = await api.loadConfig();

// Returns:
// {
//   shop: "myshop.myshopify.com",
//   branding: {
//     brandName: "My Shop",
//     primaryColor: "#FF6B35",
//     logoUrl: "https://...",
//     tagline: "Welcome to my shop"
//   },
//   storefrontEndpoint: "https://myshop.myshopify.com/api/2024-01/graphql.json",
//   appVersion: "1.0.0"
// }
```

### Product Loading

```typescript
const products = await api.loadProducts(20);
// Lädt Products via turn2app Backend (/api/products)
```

### Checkout Flow

```typescript
const checkoutUrl = await api.getCheckoutUrl(variantId);
// Öffnet Shopify Checkout in WebView
```

## API Endpunkte

Die App konsumiert folgende turn2app Backend APIs:

- `GET /api/config?shop=DOMAIN` - Shop Configuration
- `GET /api/products?shop=DOMAIN&limit=N` - Product List (optional)
- Direct Shopify Checkout URLs für Kaufabwicklung

## Demo Mode

Wenn `DEMO_MODE=true`, zeigt die App Demo-Daten falls das Backend nicht erreichbar ist. Nützlich für:

- UI/UX Testing ohne Backend
- App Store Screenshots
- Offline Development

## Deployment

### Android

```bash
# Release APK generieren
cd android && ./gradlew assembleRelease

# APK Location: android/app/build/outputs/apk/release/app-release.apk
```

### iOS

1. Xcode öffnen: `ios/Turn2AppDemo.xcworkspace`
2. Product → Archive
3. Distribute App

## Testing

```bash
# TypeScript Check
npm run typecheck

# Lint
npm run lint

# Unit Tests
npm test
```

## Troubleshooting

**Config API Error**: Prüfe TURN2APP_API_URL und stelle sicher dass Backend läuft

**Products nicht geladen**: Prüfe `/api/products` Endpoint im turn2app Backend

**Checkout funktioniert nicht**: Shopify Test Store muss Zahlungen aktiviert haben

**Android Build Fails**: Prüfe Android SDK und Java Version

## Integration mit turn2app

Diese Demo App zeigt das End-to-End Szenario:

1. **Merchant installiert turn2app** in Shopify Admin
2. **Merchant konfiguriert Branding** in turn2app Admin
3. **Mobile App lädt Configuration** via `/api/config`
4. **App wendet Dynamic Branding an** (Farben, Name, Logo)
5. **Products werden angezeigt** via Storefront API
6. **Checkout führt zu Shopify** für sichere Kaufabwicklung

## Next Steps

Nach MVP können folgende Features hinzugefügt werden:

- Native Checkout Integration
- Push Notifications
- User Authentication
- Offline Caching
- Analytics Integration