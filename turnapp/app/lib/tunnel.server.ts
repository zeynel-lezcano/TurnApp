/**
 * Tunnel helper utilities for development
 * Handles tunnel detection and URL routing for webhook endpoints
 */

/**
 * Check if tunnel is currently active (development mode)
 */
export function isTunnelActive(): boolean {
  return process.env.TUNNEL_ACTIVE === 'true' && process.env.NODE_ENV === 'development';
}

/**
 * Get the base URL for webhook endpoints
 * Uses tunnel URL in development, falls back to APP_URL
 */
export function getWebhookBaseUrl(): string {
  if (isTunnelActive() && process.env.WEBHOOK_BASE_URL) {
    return process.env.WEBHOOK_BASE_URL;
  }
  
  return process.env.APP_URL || 'http://localhost:3000';
}

/**
 * Get the public app URL
 * Uses tunnel URL in development, falls back to APP_URL
 */
export function getPublicAppUrl(): string {
  if (isTunnelActive() && process.env.SHOPIFY_APP_URL) {
    return process.env.SHOPIFY_APP_URL;
  }
  
  return process.env.APP_URL || 'http://localhost:3000';
}

/**
 * Build webhook endpoint URL for a specific webhook type
 */
export function buildWebhookUrl(webhookPath: string): string {
  const baseUrl = getWebhookBaseUrl();
  const cleanPath = webhookPath.startsWith('/') ? webhookPath : `/${webhookPath}`;
  
  return `${baseUrl}${cleanPath}`;
}

/**
 * Get tunnel configuration info for debugging
 */
export function getTunnelInfo() {
  return {
    active: isTunnelActive(),
    webhookBaseUrl: getWebhookBaseUrl(),
    publicAppUrl: getPublicAppUrl(),
    nodeEnv: process.env.NODE_ENV,
    appUrl: process.env.APP_URL,
    host: process.env.HOST
  };
}

/**
 * Validate tunnel configuration
 * Returns array of validation errors, empty if valid
 */
export function validateTunnelConfig(): string[] {
  const errors: string[] = [];
  
  if (isTunnelActive()) {
    if (!process.env.WEBHOOK_BASE_URL) {
      errors.push('WEBHOOK_BASE_URL is required when tunnel is active');
    }
    
    if (!process.env.SHOPIFY_APP_URL) {
      errors.push('SHOPIFY_APP_URL is required when tunnel is active');
    }
    
    // Check if URLs are HTTPS (required for Shopify)
    const webhookUrl = process.env.WEBHOOK_BASE_URL;
    if (webhookUrl && !webhookUrl.startsWith('https://')) {
      errors.push('WEBHOOK_BASE_URL must use HTTPS for Shopify compatibility');
    }
    
    const appUrl = process.env.SHOPIFY_APP_URL;
    if (appUrl && !appUrl.startsWith('https://')) {
      errors.push('SHOPIFY_APP_URL must use HTTPS for Shopify compatibility');
    }
  }
  
  return errors;
}