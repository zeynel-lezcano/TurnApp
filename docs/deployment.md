Production Deployment Guide

## Environment Setup

### 1. Cloud Provider Requirements
- **Database**: Managed PostgreSQL (AWS RDS, GCP Cloud SQL, Azure Database)
- **Cache**: Managed Redis (AWS ElastiCache, GCP Memorystore, Azure Cache)
- **Storage**: S3-compatible object storage für asset uploads
- **Compute**: Node.js 18+ runtime (Docker recommended)

### 2. Environment Variables (.env.production)
```bash
# Shopify App Configuration
SHOPIFY_API_KEY=your_production_api_key
SHOPIFY_API_SECRET=your_production_api_secret
SHOPIFY_SCOPES="read_products,write_products,read_orders"
SHOPIFY_APP_URL=https://your-app-domain.com
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Database
DATABASE_URL="postgresql://user:pass@host:5432/turn2app_prod"

# Cache
REDIS_URL="redis://user:pass@host:6379"

# Security
ENCRYPTION_KEY=your_32_byte_hex_key
SESSION_SECRET=your_session_secret

# Storage
S3_BUCKET_NAME=your-assets-bucket
S3_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
NODE_ENV=production
```

## Deployment Steps

### 1. Database Migration
```bash
# Run Prisma migrations
pnpm prisma migrate deploy

# Verify schema
pnpm prisma db pull
```

### 2. Build & Deploy
```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build application
pnpm build

# Start production server
pnpm start
```

### 3. Health Check Verification
```bash
# Verify endpoints
curl https://your-app.com/healthz
curl https://your-app.com/readiness

# Expected response: {"status":"ok","timestamp":"..."}
```

### 4. Shopify App Configuration
1. **Partner Dashboard**: Update App URL zu production domain
2. **Allowed redirection URLs**: https://your-app.com/auth/callback
3. **Webhook endpoints**: https://your-app.com/webhooks/*
4. **App proxy** (optional): https://your-app.com/proxy

## Docker Deployment (recommended)

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Generate Prisma client
RUN pnpm prisma generate

EXPOSE 3000
CMD ["pnpm", "start"]
```

### docker-compose.yml (local testing)
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/turn2app
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: turn2app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Monitoring & Observability

### 1. Logging
- **Structured JSON logs** bereits implementiert
- **Log aggregation**: CloudWatch, Datadog, oder ELK Stack
- **Log retention**: 30+ Tage für compliance

### 2. Error Tracking
```bash
# Sentry integration (nächster Backlog-Task)
npm install @sentry/node @sentry/remix
```

### 3. Metrics & Alerts
- **Application metrics**: /healthz endpoint monitoring
- **Infrastructure metrics**: CPU, Memory, Database connections
- **Business metrics**: Install/Uninstall rate, API response times

## Security Checklist

### 1. Secrets Management
- ✅ Alle secrets in environment variables
- ✅ Token encryption at rest (AES-256-GCM)
- ✅ No secrets in code/logs
- 🔄 Rotate ENCRYPTION_KEY quarterly

### 2. Network Security
- ✅ HTTPS only (redirect HTTP → HTTPS)
- ✅ HMAC validation für Shopify webhooks
- 🔄 Rate limiting implementation (nächster Task)
- 🔄 CORS configuration review

### 3. Database Security
- ✅ Encrypted connections (DATABASE_URL mit SSL)
- 🔄 Database user mit minimal privileges
- 🔄 Regular security patches

## Backup & Recovery

### 1. Database Backups
```bash
# Automated daily backups (managed service)
# Point-in-time recovery bis 7 Tage

# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 2. Asset Backups
- S3 versioning aktivieren
- Cross-region replication für kritische assets

### 3. Disaster Recovery
- **RTO**: < 1 Stunde (Recovery Time Objective)
- **RPO**: < 1 Stunde (Recovery Point Objective)
- **Runbook**: Documented recovery procedures

## Performance Optimization

### 1. Caching Strategy
- ✅ Redis cache mit TTL bereits implementiert
- ✅ Product cache: 60s
- ✅ Config cache: 5 minutes
- 🔄 CDN för static assets

### 2. Database Optimization
```sql
-- Index optimization
CREATE INDEX CONCURRENTLY idx_shops_domain ON shops(shop_domain);
CREATE INDEX CONCURRENTLY idx_shops_installed ON shops(installed_at) WHERE uninstalled_at IS NULL;
```

### 3. Monitoring Targets
- **Backend P99**: < 600ms (bereits definiert in constraints.md)
- **Cache hit rate**: > 80%
- **Error rate**: < 0.1%

## Rollback Strategy

### 1. Blue-Green Deployment
```bash
# Deploy zu staging slot
deploy_to_staging()

# Health check staging
verify_staging_health()

# Swap slots
swap_production_staging()

# Rollback if issues
rollback_to_previous_slot()
```

### 2. Database Rollback
- **Migration rollback**: Prisma migration revert
- **Data rollback**: Point-in-time recovery
- **Schema compatibility**: Backward-compatible migrations only