# TurnApp Production Deployment Guide 🚀

Komplette Anleitung für das Production Deployment deiner TurnApp mit verschiedenen Hosting-Optionen.

## 📋 Table of Contents

- [Deployment Optionen](#deployment-optionen)
- [Vercel Deployment (Empfohlen)](#vercel-deployment-empfohlen)
- [Railway Deployment](#railway-deployment)
- [Database Setup](#database-setup)
- [Environment Variablen](#environment-variablen)
- [Domain & SSL Setup](#domain--ssl-setup)
- [Shopify Partner Dashboard Update](#shopify-partner-dashboard-update)
- [Post-Deployment Tests](#post-deployment-tests)

## 🎯 Deployment Optionen

### **Vercel (Empfohlen) - Kostenlos**
- ✅ Automatisches HTTPS
- ✅ Globales CDN
- ✅ Serverless Functions
- ✅ GitHub Integration
- ✅ Custom Domain Support

### **Railway - $5/Monat**
- ✅ PostgreSQL inklusive
- ✅ Einfache Environment Konfiguration
- ✅ Automatische Backups
- ✅ Docker Support

### **Render - Kostenlos/Paid**
- ✅ PostgreSQL inklusive
- ✅ Automatische SSL
- ✅ GitHub Integration

## 🚀 Vercel Deployment (Empfohlen)

### **Schritt 1: Vercel CLI installieren**

```bash
npm install -g vercel
```

### **Schritt 2: Vercel Login**

```bash
vercel login
# Folge den Anweisungen im Browser
```

### **Schritt 3: Projekt initialisieren**

```bash
# In deinem turnapp Verzeichnis
cd /Users/zeynel/Desktop/TurnApp/turnapp
vercel
```

**Bei der Konfiguration wählen:**
- Framework: Remix
- Build Command: `npm run build` 
- Output Directory: `build`
- Install Command: `npm install`

### **Schritt 4: Environment Variablen in Vercel setzen**

```bash
# API Credentials
vercel env add SHOPIFY_API_KEY
# Eingabe: fb96d4f7e65dcc56b7118b4b276f420c

vercel env add SHOPIFY_API_SECRET  
# Eingabe: d101d8c9e7805a27fda48307d6d28905

# App URLs (wird nach erstem Deploy angepasst)
vercel env add SHOPIFY_APP_URL
# Eingabe: https://deine-app.vercel.app

vercel env add APP_URL
# Eingabe: https://deine-app.vercel.app

# Scopes
vercel env add SCOPES
# Eingabe: read_products,write_products,read_themes,read_customers

# Session Keys (sichere Zufallsstrings)
vercel env add SESSION_KEYS
# Eingabe: ba5eb03041b0341e560f4d69d998bae6,6157a5055875129c06897f4b9b370397,b6f826fd86b9356829acc9e2dbd26b22

# Encryption Key  
vercel env add ENCRYPTION_KEY
# Eingabe: 771e7c2bd446e561076a5e23307f2940ef677a137c534c56545f61802d0087c7

# Webhook Secret
vercel env add SHOPIFY_WEBHOOK_SECRET
# Eingabe: 8b7f655e877360bbe267ab735eb385137081032fa54fec8ad955fccb28b1688d

# Database (PostgreSQL URL)
vercel env add DATABASE_URL
# Eingabe: postgresql://username:password@host:port/database

# Environment
vercel env add NODE_ENV
# Eingabe: production
```

### **Schritt 5: Production Deploy**

```bash
vercel --prod
```

## 🗄️ Database Setup

### **Option A: PlanetScale (MySQL - Kostenlos)**

```bash
# PlanetScale CLI installieren
npm install -g @planetscale/cli

# Login
pscale auth login

# Database erstellen
pscale database create turnapp-prod

# Connection String abrufen
pscale connect turnapp-prod main
```

### **Option B: Railway PostgreSQL**

```bash
# Railway CLI installieren
npm install -g @railway/cli

# Login
railway login

# Projekt erstellen
railway init

# PostgreSQL hinzufügen
railway add postgresql

# Connection String abrufen
railway variables
```

### **Schritt 6: Database Migration**

```bash
# Nach Database Setup - Lokal ausführen mit Production URL
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma generate
```

## 📡 Railway Deployment

### **Schritt 1: Railway Setup**

```bash
# Railway CLI installieren
npm install -g @railway/cli

# Login und Projekt erstellen
railway login
railway init
railway add postgresql
```

### **Schritt 2: Environment Variablen**

```bash
railway variables set SHOPIFY_API_KEY=fb96d4f7e65dcc56b7118b4b276f420c
railway variables set SHOPIFY_API_SECRET=d101d8c9e7805a27fda48307d6d28905
# ... (alle anderen Variablen wie bei Vercel)
```

### **Schritt 3: Deploy**

```bash
railway up
```

## 🌐 Domain & SSL Setup

### **Vercel Custom Domain**

1. **Domain hinzufügen:**
   ```bash
   vercel domains add deine-domain.com
   ```

2. **DNS konfigurieren:**
   - A Record: `@ → 76.76.19.61`
   - CNAME: `www → deine-app.vercel.app`

3. **SSL:** Automatisch von Vercel

### **Subdomain für TurnApp**

**Empfehlung:** `turnapp.deine-domain.com`

```bash
vercel domains add turnapp.deine-domain.com
```

**DNS:**
- CNAME: `turnapp → deine-app.vercel.app`

## 🔄 Shopify Partner Dashboard Update

Nach erfolgreichem Deployment:

### **1. App URLs aktualisieren**

```
App URL: https://turnapp.deine-domain.com
Allowed redirection URL(s): https://turnapp.deine-domain.com/auth/callback
```

### **2. Webhook URLs**

```
App uninstalled webhook: https://turnapp.deine-domain.com/webhooks/app_uninstalled
```

### **3. Webhook Secret**

Trage den generierten Webhook Secret ein:
```
8b7f655e877360bbe267ab735eb385137081032fa54fec8ad955fccb28b1688d
```

## 📝 Environment Variablen Template

Erstelle eine `.env.production` für lokale Tests:

```env
# Shopify App Configuration
SHOPIFY_API_KEY=fb96d4f7e65dcc56b7118b4b276f420c
SHOPIFY_API_SECRET=d101d8c9e7805a27fda48307d6d28905
SCOPES=read_products,write_products,read_themes,read_customers

# Production URLs
SHOPIFY_APP_URL=https://turnapp.deine-domain.com
APP_URL=https://turnapp.deine-domain.com

# Database (PostgreSQL Production)
DATABASE_URL=postgresql://user:password@host:port/database

# Security Keys (NIEMALS in Git committen!)
SESSION_KEYS=ba5eb03041b0341e560f4d69d998bae6,6157a5055875129c06897f4b9b370397,b6f826fd86b9356829acc9e2dbd26b22
ENCRYPTION_KEY=771e7c2bd446e561076a5e23307f2940ef677a137c534c56545f61802d0087c7
SHOPIFY_WEBHOOK_SECRET=8b7f655e877360bbe267ab735eb385137081032fa54fec8ad955fccb28b1688d

# Production Settings
NODE_ENV=production
MONITORING_ENABLED=true

# Optional: Redis für Performance
REDIS_URL=redis://user:password@host:port
```

## ✅ Post-Deployment Tests

### **1. Health Check**

```bash
curl https://turnapp.deine-domain.com/healthz
# Sollte: {"status":"healthy","timestamp":"..."}
```

### **2. API Endpoints**

```bash
# Products API
curl "https://turnapp.deine-domain.com/api/products?shop=zeytestshop.myshopify.com"

# Config API  
curl "https://turnapp.deine-domain.com/api/config?shop=zeytestshop.myshopify.com"

# Readiness Check
curl https://turnapp.deine-domain.com/readiness
```

### **3. OAuth Flow**

1. **Gehe zu:** `https://turnapp.deine-domain.com`
2. **Teste:** OAuth Installation mit Testshop
3. **Überprüfe:** Database enthält Shop-Eintrag

### **4. Shopify Admin Integration**

1. **Shopify Partner Dashboard** → Apps → TurnApp
2. **Test Installation** in Development Store
3. **App im Shopify Admin** öffnen
4. **Keine ngrok-Warnung** mehr sichtbar

## 🔒 Sicherheits-Checklist

- [ ] Environment Variablen sind sicher gesetzt
- [ ] HTTPS ist aktiviert (automatisch bei Vercel)
- [ ] Database Verbindung ist verschlüsselt
- [ ] Webhook HMAC Verifikation funktioniert
- [ ] Access Tokens sind AES-256 verschlüsselt
- [ ] Keine Secrets in Git Repository

## 📊 Monitoring & Logging

### **Vercel Analytics**

```bash
# Analytics aktivieren
vercel --prod
# Im Vercel Dashboard Analytics einschalten
```

### **Error Tracking (Optional)**

```bash
# Sentry Integration
npm install @sentry/remix
```

**Sentry Config in `app/entry.client.tsx`:**

```typescript
import * as Sentry from "@sentry/remix";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 🚀 CI/CD Pipeline (Optional)

### **GitHub Actions für automatisches Deployment**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🔧 Troubleshooting

### **Häufige Probleme:**

#### **Build Errors**
```bash
# Lokal testen vor Deploy
npm run build
npm run start
```

#### **Environment Variables**
```bash
# Alle Variablen auflisten
vercel env ls

# Variable aktualisieren  
vercel env rm VARIABLE_NAME
vercel env add VARIABLE_NAME
```

#### **Database Connection**
```bash
# Connection testen
npx prisma studio --browser none
```

#### **SSL/Domain Issues**
- DNS Propagation kann 24-48h dauern
- `dig turnapp.deine-domain.com` zur Überprüfung

## 📞 Support & Weiterführende Links

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app/
- **Shopify App Docs:** https://shopify.dev/apps
- **Prisma Deployment:** https://www.prisma.io/docs/guides/deployment

---

## 🎯 Schnell-Start Checklist

1. [ ] **Hosting wählen** (Vercel empfohlen)
2. [ ] **Database Setup** (PostgreSQL)
3. [ ] **Environment Variablen** setzen
4. [ ] **Deploy ausführen**
5. [ ] **Domain konfigurieren**
6. [ ] **Shopify Partner Dashboard** updaten
7. [ ] **Tests durchführen**
8. [ ] **Live mit echtem Shop** testen

**Deine TurnApp ist bereit für Production! 🚀**

*Nach erfolgreichem Deployment bist du ready für App Store Submission.*