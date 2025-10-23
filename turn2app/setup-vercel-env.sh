#!/bin/bash
echo "🚀 Setting up Vercel Environment Variables..."

# Shopify App Configuration
vercel env add SHOPIFY_API_KEY production
vercel env add SHOPIFY_API_SECRET production
vercel env add SCOPES production

# App URLs (will be updated after first deploy)
vercel env add SHOPIFY_APP_URL production
vercel env add APP_URL production

# Security Keys
vercel env add SESSION_KEYS production
vercel env add ENCRYPTION_KEY production
vercel env add SHOPIFY_WEBHOOK_SECRET production

# Database
vercel env add DATABASE_URL production

# Environment
vercel env add NODE_ENV production

echo "✅ Environment setup complete!"
echo "Run this script after vercel login is complete."