# TurnApp - Merchant Authentication & Registration Flow

## Übersicht
TurnApp nutzt Shopifys OAuth-System für die Authentifizierung. Händler müssen sich NICHT separat registrieren - die Shopify-Installation reicht aus.

## 1. App-Installation (Shopify App Store)

### Händler-Sicht:
1. Händler findet TurnApp im Shopify App Store
2. Klickt "App installieren"
3. Shopify zeigt Berechtigungsanfrage
4. Händler bestätigt Installation

### Technischer Ablauf:
```
Händler klickt "Installieren"
    ↓
Shopify OAuth Redirect: 
https://turnapp.com/auth/install?shop=händlershop.myshopify.com
    ↓
Unsere App holt Shopify Access Token
    ↓
Shop-Daten von Shopify API laden
    ↓
Entscheidung: Neuer Shop oder existierender Shop?
```

## 2. Neue Shop-Registrierung

### Wenn Shop NICHT in unserer DB existiert:

```typescript
// app/routes/auth.callback.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const code = url.searchParams.get("code");
  
  // 1. Shopify Access Token holen
  const accessToken = await getShopifyAccessToken(code, shop);
  
  // 2. Shop-Daten von Shopify laden
  const shopifyData = await fetchShopData(shop, accessToken);
  
  // 3. Prüfen ob Shop bereits existiert
  const existingShop = await prisma.shop.findUnique({
    where: { shopDomain: shop }
  });
  
  if (!existingShop) {
    // 4. Neuer Shop - Basis-Eintrag erstellen
    await prisma.shop.create({
      data: {
        shopDomain: shop,
        shopifyShopId: shopifyData.id,
        accessToken: encrypt(accessToken), // Verschlüsselt speichern!
        shopName: shopifyData.name,
        shopEmail: shopifyData.email,
        onboardingCompleted: false,
        installedAt: new Date()
      }
    });
    
    // 5. Zu Onboarding weiterleiten
    return redirect(`/onboarding/welcome?shop=${shop}`);
  } else {
    // 6. Existierender Shop - Access Token updaten
    await prisma.shop.update({
      where: { shopDomain: shop },
      data: { 
        accessToken: encrypt(accessToken),
        uninstalledAt: null // Falls re-installiert
      }
    });
    
    // 7. Zu Dashboard weiterleiten
    return redirect(`/dashboard?shop=${shop}`);
  }
}
```

## 3. Onboarding-Prozess

### Was passiert im Onboarding:

```typescript
// app/routes/onboarding.welcome.tsx - Action Handler
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const shop = url.searchParams.get("shop");
  
  // Zusätzliche Händler-Daten sammeln
  const additionalData = {
    ownerFirstName: formData.get("firstName"),
    ownerLastName: formData.get("lastName"),
    ownerEmail: formData.get("email"),
    ownerPhone: formData.get("phone"),
    appName: formData.get("appName"),
  };
  
  // Shop-Eintrag mit Onboarding-Daten erweitern
  await prisma.shop.update({
    where: { shopDomain: shop },
    data: {
      ...additionalData,
      onboardingStep: 'profile_completed'
    }
  });
  
  return redirect(`/onboarding/setup?shop=${shop}`);
}
```

## 4. Session-Management

### Wie Authentication funktioniert:

```typescript
// app/lib/auth.server.ts
export async function requireShopAuth(request: Request) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  if (!shop) {
    throw redirect('/auth/install');
  }
  
  // Shop aus DB laden
  const shopRecord = await prisma.shop.findUnique({
    where: { shopDomain: shop }
  });
  
  if (!shopRecord) {
    throw redirect(`/auth/install?shop=${shop}`);
  }
  
  // Shopify Session validieren
  const sessionToken = request.headers.get('authorization');
  const isValidSession = await validateShopifySession(sessionToken, shop);
  
  if (!isValidSession) {
    throw redirect(`/auth/install?shop=${shop}`);
  }
  
  return shopRecord;
}
```

### In jeder geschützten Route:

```typescript
// app/routes/dashboard.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  // Automatische Auth-Prüfung
  const shop = await requireShopAuth(request);
  
  if (!shop.onboardingCompleted) {
    return redirect(`/onboarding/welcome?shop=${shop.shopDomain}`);
  }
  
  return json({ shop });
}
```

## 5. Datenbank-Schema

### Vollständiges Prisma Schema:

```prisma
model Shop {
  id                    String   @id @default(cuid())
  
  // Shopify-Daten (automatisch)
  shopDomain           String   @unique  // "händler.myshopify.com"
  shopifyShopId        String   @unique  // Shopify's interne ID
  accessToken          String             // Verschlüsselt
  shopName             String?            // Von Shopify API
  shopEmail            String?            // Von Shopify API
  planName             String?            // Basic/Pro/etc.
  
  // Onboarding-Daten (vom Händler eingegeben)
  ownerFirstName       String?
  ownerLastName        String?
  ownerEmail           String?  // Kann anders sein als Shop-Email
  ownerPhone           String?
  appName              String?
  
  // App-Status
  onboardingCompleted  Boolean  @default(false)
  onboardingStep       String?  // 'profile', 'setup', 'completed'
  
  // App-Konfiguration
  appSettings          Json?    // Features, Design, etc.
  
  // Zeitstempel
  installedAt          DateTime @default(now())
  lastActiveAt         DateTime @default(now())
  uninstalledAt        DateTime?
  
  @@map("shops")
}
```

## 6. Security & Best Practices

### Access Token Verschlüsselung:

```typescript
// app/lib/crypto.server.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes key

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### Environment Variables:

```bash
# .env
SHOPIFY_API_KEY=deine_shopify_api_key
SHOPIFY_API_SECRET=deine_shopify_api_secret
ENCRYPTION_KEY=32_byte_encryption_key_für_access_tokens
DATABASE_URL=postgresql://...
```

## 7. Händler-Experience Zusammenfassung

### Was der Händler erlebt:
1. **App Store**: Klickt "Installieren" → Shopify OAuth
2. **Erste Nutzung**: Landet auf Willkommensseite
3. **Onboarding**: Füllt zusätzliche Daten aus (Name, App-Name, etc.)
4. **Setup**: Konfiguriert App-Features
5. **Dashboard**: Nutzt die App

### Was der Händler NICHT erlebt:
- ❌ Separates Passwort erstellen
- ❌ Separaten Login-Prozess
- ❌ Email-Bestätigung für unsere App
- ❌ Vergessenes-Passwort-Flow

### Warum das so ist:
- ✅ Shopify übernimmt komplette Authentifizierung
- ✅ Händler ist bereits bei Shopify angemeldet
- ✅ Nahtlose Integration in Shopify Admin
- ✅ Single Sign-On Experience

## 8. Nächste Schritte für Implementierung

1. **Prisma Schema erweitern** mit Shop-Model
2. **Verschlüsselung implementieren** für Access Tokens
3. **Auth-Middleware erstellen** für alle geschützten Routes
4. **Onboarding-Daten speichern** in Datenbank
5. **Session-Validation** mit Shopify API

Möchtest du, dass ich diese Implementierung starte?