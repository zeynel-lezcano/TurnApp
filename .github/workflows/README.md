# CI/CD Workflows

This directory contains GitHub Actions workflows for automated testing, building, and deployment.

## Workflows

### `ci.yml` - Continuous Integration
- **Triggers**: Push to main/master/develop, Pull Requests
- **Jobs**:
  - **Test & Lint**: Runs tests, type checking, and linting on Node 18 & 20
  - **Build Check**: Verifies the application builds successfully
  - **Security Audit**: Checks for vulnerabilities and outdated packages

### `deploy.yml` - Continuous Deployment
- **Triggers**: Push to main/master, Tags starting with 'v', Manual dispatch
- **Jobs**:
  - **Deploy to Staging**: Automatic deployment to staging environment
  - **Deploy to Production**: Deployment to production (requires approval for tags)

### `maintenance.yml` - Maintenance & Security
- **Triggers**: Daily at 2 AM UTC, Manual dispatch
- **Jobs**:
  - **Dependency Audit**: Daily security checks and dependency audits
  - **Health Check**: Production health monitoring
  - **Cleanup**: Removes old workflow runs and artifacts

## Required Secrets

### Repository Secrets
Set these in GitHub repository settings → Secrets and variables → Actions:

#### Shopify Configuration
- `SHOPIFY_API_KEY`: Shopify app API key
- `SHOPIFY_API_SECRET`: Shopify app API secret

#### Staging Environment
- `STAGING_DATABASE_URL`: Staging database connection string
- `STAGING_SESSION_KEYS`: Comma-separated session encryption keys
- `STAGING_ENCRYPTION_KEY`: 32-byte hex string for token encryption
- `STAGING_SENTRY_DSN`: Sentry DSN for staging error tracking
- `STAGING_APP_URL`: Staging application URL

#### Production Environment
- `PRODUCTION_DATABASE_URL`: Production database connection string
- `PRODUCTION_SESSION_KEYS`: Comma-separated session encryption keys
- `PRODUCTION_ENCRYPTION_KEY`: 32-byte hex string for token encryption
- `PRODUCTION_SENTRY_DSN`: Sentry DSN for production error tracking
- `PRODUCTION_APP_URL`: Production application URL

#### Deployment
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

#### Notifications (Optional)
- `SLACK_WEBHOOK`: Slack webhook URL for deployment notifications

## Environment Setup

### Generate Encryption Keys
```bash
# Session keys (generate 3)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption key (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Local Testing
```bash
# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run tests
pnpm test

# Run smoke tests (requires running server)
BASE_URL="http://localhost:3000" pnpm test:smoke
```

## Workflow Features

### Test Matrix
- Tests run on Node.js 18 and 20
- Ensures compatibility across versions

### Security Checks
- Daily dependency audits
- Vulnerability scanning
- Outdated package detection

### Production Health Monitoring
- Automated health checks
- API endpoint validation
- Slack notifications on failures

### Deployment Strategy
- **Staging**: Automatic deployment on main branch
- **Production**: Manual approval required for tagged releases
- **Rollback**: Can be triggered manually through GitHub Actions

### Rate Limiting Testing
- Smoke tests verify rate limiting is working
- Health checks validate monitoring endpoints
- API endpoint validation ensures proper error handling

## Troubleshooting

### Common Issues

**Tests failing with "Shop not found"**
- This is expected for smoke tests against empty databases
- Seed data is only for development environments

**Deployment failing**
- Check that all required secrets are set
- Verify Vercel token has proper permissions
- Ensure database URLs are accessible

**Security audit failing**
- Review the specific vulnerabilities reported
- Update dependencies as needed
- Consider adding audit exceptions for false positives

### Getting Help
- Check workflow logs in GitHub Actions tab
- Review error messages in deployment notifications
- Verify environment variable configuration