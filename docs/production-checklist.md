Production Go-Live Checklist

## Pre-Deployment Validation

### ✅ Core Functionality
- [ ] OAuth Install Flow funktioniert mit production Shopify App
- [ ] HMAC validation korrekt für production webhook secret
- [ ] Token encryption/decryption mit production ENCRYPTION_KEY
- [ ] Shop registration & session management
- [ ] Uninstall flow löscht alle Shop-Daten vollständig

### ✅ API Endpoints
- [ ] GET /api/config liefert korrektes mandantenspezifisches JSON
- [ ] GET /api/products cached korrekt (60s TTL)
- [ ] POST /api/settings validiert & speichert Branding
- [ ] POST /api/upload funktioniert mit production S3 bucket
- [ ] Alle APIs respektieren Shop-Isolation (keine Cross-Tenant Leaks)

### ✅ Webhooks
- [ ] APP_UNINSTALLED webhook registriert & löscht Shop-Daten
- [ ] PRODUCTS_UPDATE webhook invalidiert Product Cache
- [ ] Webhook endpoints antworten < 5s (Shopify Timeout)
- [ ] Idempotente Webhook-Verarbeitung (mehrfache Delivery OK)

### ✅ Cache System
- [ ] Redis connection stabil (production REDIS_URL)
- [ ] Cache TTL funktioniert (Products 60s, Config 5min)
- [ ] Shop-spezifische Cache-Keys verhindern Cross-Tenant Access
- [ ] Cache invalidation via webhooks funktioniert
- [ ] Cache health monitoring in /healthz endpoint

### ✅ Mobile Integration
- [ ] React Native Demo lädt /api/config korrekt
- [ ] Dynamic Branding wird angewendet (Colors, Logo, Name)
- [ ] Product List lädt via /api/products
- [ ] Checkout WebView öffnet korrekte Shopify URLs
- [ ] Keine hardcoded URLs oder Secrets im Mobile Bundle

## Security Audit

### ✅ Authentication & Authorization
- [ ] Shopify OAuth Scopes minimal (nur read_products, write_products, read_orders)
- [ ] Session Tokens (JWT) korrekt validiert
- [ ] Keine Admin API Token in Client-Code
- [ ] HMAC validation für alle Shopify Requests

### ✅ Secrets Management
- [ ] Alle Secrets in environment variables (keine .env files committed)
- [ ] ENCRYPTION_KEY ist cryptographically secure (32 bytes)
- [ ] SESSION_SECRET ist unique & random
- [ ] SHOPIFY_WEBHOOK_SECRET matches Partner Dashboard
- [ ] Database passwords sind strong & rotated

### ✅ Data Protection
- [ ] Token encryption at rest mit AES-256-GCM
- [ ] Database connections encrypted (SSL)
- [ ] S3 bucket private (keine public read access)
- [ ] Logs enthalten keine Secrets oder PII
- [ ] GDPR compliance: Uninstall löscht alle Shop-Daten

### ✅ Network Security
- [ ] HTTPS only (HTTP redirects automatisch)
- [ ] CORS konfiguriert (nur erlaubte Origins)
- [ ] Rate limiting implementiert (nächster Backlog Task)
- [ ] No debug endpoints in production

## Performance Testing

### ✅ Load Testing
- [ ] Backend P99 < 600ms (siehe constraints.md)
- [ ] /api/products responds < 300ms (mit Cache)
- [ ] /api/config responds < 200ms (mit Cache)
- [ ] Database kann ≥100 concurrent connections
- [ ] Redis handles ≥1000 ops/sec

### ✅ Cache Performance
- [ ] Cache hit rate > 80% für Products
- [ ] Cache miss fallback funktioniert (degraded performance OK)
- [ ] Memory usage stabil bei Cache-Load
- [ ] Cache TTL prevents stale data issues

### ✅ Error Scenarios
- [ ] Database offline: App bleibt responsive (graceful degradation)
- [ ] Redis offline: App funktioniert ohne Cache
- [ ] Shopify API rate limit: Exponential backoff works
- [ ] Invalid webhook signatures: Korrekt abgelehnt
- [ ] Malformed requests: 400 errors mit helpful messages

## Infrastructure Readiness

### ✅ Database (PostgreSQL)
- [ ] Production database provisioned & accessible
- [ ] Connection pooling konfiguriert
- [ ] Automated backups aktiviert (täglich, 30 Tage retention)
- [ ] Point-in-time recovery verfügbar
- [ ] Migration deployment tested

### ✅ Cache (Redis)
- [ ] Redis cluster/instance provisioned
- [ ] Memory sizing appropriate (≥2GB für Cache data)
- [ ] Persistence konfiguriert (AOF + RDB)
- [ ] Network security groups korrekt

### ✅ Storage (S3)
- [ ] S3 bucket existiert & accessible
- [ ] IAM permissions minimal (nur nötige bucket access)
- [ ] Versioning aktiviert
- [ ] CORS für direct uploads konfiguriert

### ✅ Application Server
- [ ] Node.js 18+ runtime
- [ ] Environment variables configured
- [ ] Process manager (PM2/systemd) konfiguriert
- [ ] Log rotation aktiviert
- [ ] Health check endpoints erreichbar

## Monitoring & Alerting

### ✅ Health Monitoring
- [ ] /healthz endpoint returns 200 OK
- [ ] /readiness endpoint checks DB + Redis connectivity
- [ ] Uptime monitoring konfiguriert (external service)
- [ ] SSL certificate monitoring (expiry alerts)

### ✅ Application Metrics
- [ ] Response time monitoring (P50, P95, P99)
- [ ] Error rate monitoring (< 0.1% target)
- [ ] Cache hit rate monitoring
- [ ] Database connection pool monitoring

### ✅ Business Metrics
- [ ] App install/uninstall tracking
- [ ] Active shops count
- [ ] API usage per shop
- [ ] Failed webhook deliveries

### ✅ Alerting Rules
- [ ] Error rate > 1% → Immediate alert
- [ ] Response time P99 > 1s → Warning
- [ ] Database connections > 80% → Warning
- [ ] Cache hit rate < 50% → Investigation needed
- [ ] SSL certificate expires in 30 days → Renewal reminder

## Shopify Partner Dashboard

### ✅ App Configuration
- [ ] App URL points to production domain
- [ ] Allowed redirection URLs include production callback
- [ ] Webhook endpoints configured for production
- [ ] App listing ready (wenn public)
- [ ] Privacy policy & Terms of Service URLs

### ✅ Compliance
- [ ] App follows Shopify Partner requirements
- [ ] GDPR compliance documented
- [ ] Data retention policy defined
- [ ] Security contact information provided

## Documentation

### ✅ Operations Runbooks
- [ ] Deployment procedures documented
- [ ] Rollback procedures tested
- [ ] Incident response plan
- [ ] Emergency contacts defined

### ✅ API Documentation
- [ ] API endpoints documented für mobile team
- [ ] Authentication flow documented
- [ ] Error codes & responses documented
- [ ] Rate limiting behavior documented

## Final Validation

### ✅ End-to-End Testing
- [ ] Complete install flow in production Shopify Partner account
- [ ] Mobile Demo app connects & loads data
- [ ] Branding changes reflect immediately
- [ ] Uninstall removes all data (verified in DB)
- [ ] Webhook delivery works (check Partner Dashboard logs)

### ✅ Disaster Recovery Test
- [ ] Database restore from backup tested
- [ ] Application restart after failure tested
- [ ] Cache rebuild after Redis restart tested
- [ ] DNS failover tested (wenn applicable)

### ✅ Performance Validation
- [ ] Load test mit realistic traffic patterns
- [ ] Memory usage unter Last stabil
- [ ] No memory leaks detected
- [ ] Error handling unter extreme load tested

## Sign-off

- [ ] Technical Lead approval
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Monitoring & alerting verified
- [ ] Backup & recovery tested

**Go-Live Date:** ___________
**Responsible Engineer:** ___________
**Emergency Contact:** ___________