import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isTunnelActive,
  getWebhookBaseUrl,
  getPublicAppUrl,
  buildWebhookUrl,
  getTunnelInfo,
  validateTunnelConfig
} from '../app/lib/tunnel.server.js';

describe('Tunnel Server Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment for each test
    process.env = { ...originalEnv };
    vi.resetAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isTunnelActive', () => {
    it('should return true when tunnel is active in development', () => {
      process.env.TUNNEL_ACTIVE = 'true';
      process.env.NODE_ENV = 'development';
      
      expect(isTunnelActive()).toBe(true);
    });

    it('should return false when tunnel is not active', () => {
      process.env.TUNNEL_ACTIVE = 'false';
      process.env.NODE_ENV = 'development';
      
      expect(isTunnelActive()).toBe(false);
    });

    it('should return false in production even if tunnel flag is set', () => {
      process.env.TUNNEL_ACTIVE = 'true';
      process.env.NODE_ENV = 'production';
      
      expect(isTunnelActive()).toBe(false);
    });

    it('should return false when environment variables are missing', () => {
      const { TUNNEL_ACTIVE, NODE_ENV, ...cleanEnv } = originalEnv;
      process.env = { ...cleanEnv, NODE_ENV: 'test' };
      
      expect(isTunnelActive()).toBe(false);
    });
  });

  describe('getWebhookBaseUrl', () => {
    it('should return webhook URL when tunnel is active', () => {
      process.env.TUNNEL_ACTIVE = 'true';
      process.env.NODE_ENV = 'development';
      process.env.WEBHOOK_BASE_URL = 'https://abc123.ngrok.app';
      
      expect(getWebhookBaseUrl()).toBe('https://abc123.ngrok.app');
    });

    it('should fallback to APP_URL when tunnel is not active', () => {
      process.env.TUNNEL_ACTIVE = 'false';
      process.env.APP_URL = 'https://production-app.com';
      
      expect(getWebhookBaseUrl()).toBe('https://production-app.com');
    });

    it('should use localhost default when no URLs are set', () => {
      const { TUNNEL_ACTIVE, APP_URL, WEBHOOK_BASE_URL, ...cleanEnv } = originalEnv;
      process.env = { ...cleanEnv, APP_URL: 'http://localhost:3000' };
      
      expect(getWebhookBaseUrl()).toBe('http://localhost:3000');
    });
  });

  describe('getPublicAppUrl', () => {
    it('should return Shopify app URL when tunnel is active', () => {
      process.env.TUNNEL_ACTIVE = 'true';
      process.env.NODE_ENV = 'development';
      process.env.SHOPIFY_APP_URL = 'https://xyz789.ngrok.app';
      
      expect(getPublicAppUrl()).toBe('https://xyz789.ngrok.app');
    });

    it('should fallback to APP_URL when tunnel is not active', () => {
      process.env.TUNNEL_ACTIVE = 'false';
      process.env.APP_URL = 'https://my-production-app.com';
      
      expect(getPublicAppUrl()).toBe('https://my-production-app.com');
    });
  });

  describe('buildWebhookUrl', () => {
    beforeEach(() => {
      process.env.TUNNEL_ACTIVE = 'true';
      process.env.NODE_ENV = 'development';
      process.env.WEBHOOK_BASE_URL = 'https://tunnel.ngrok.app';
    });

    it('should build webhook URL with leading slash', () => {
      const url = buildWebhookUrl('/webhooks/app_uninstalled');
      expect(url).toBe('https://tunnel.ngrok.app/webhooks/app_uninstalled');
    });

    it('should build webhook URL without leading slash', () => {
      const url = buildWebhookUrl('webhooks/products_update');
      expect(url).toBe('https://tunnel.ngrok.app/webhooks/products_update');
    });

    it('should handle empty path', () => {
      const url = buildWebhookUrl('');
      expect(url).toBe('https://tunnel.ngrok.app/');
    });

    it('should handle root path', () => {
      const url = buildWebhookUrl('/');
      expect(url).toBe('https://tunnel.ngrok.app/');
    });
  });

  describe('getTunnelInfo', () => {
    it('should return complete tunnel configuration', () => {
      process.env.TUNNEL_ACTIVE = 'true';
      process.env.NODE_ENV = 'development';
      process.env.WEBHOOK_BASE_URL = 'https://webhook.ngrok.app';
      process.env.SHOPIFY_APP_URL = 'https://app.ngrok.app';
      process.env.APP_URL = 'https://fallback.com';
      process.env.HOST = 'tunnel.ngrok.app';

      const info = getTunnelInfo();
      
      expect(info).toEqual({
        active: true,
        webhookBaseUrl: 'https://webhook.ngrok.app',
        publicAppUrl: 'https://app.ngrok.app',
        nodeEnv: 'development',
        appUrl: 'https://fallback.com',
        host: 'tunnel.ngrok.app'
      });
    });

    it('should return info when tunnel is not active', () => {
      process.env.TUNNEL_ACTIVE = 'false';
      process.env.NODE_ENV = 'production';
      process.env.APP_URL = 'https://production.com';

      const info = getTunnelInfo();
      
      expect(info.active).toBe(false);
      expect(info.webhookBaseUrl).toBe('https://production.com');
      expect(info.publicAppUrl).toBe('https://production.com');
      expect(info.nodeEnv).toBe('production');
      expect(info.appUrl).toBe('https://production.com');
    });
  });

  describe('validateTunnelConfig', () => {
    it('should return no errors for valid tunnel config', () => {
      process.env.TUNNEL_ACTIVE = 'true';
      process.env.NODE_ENV = 'development';
      process.env.WEBHOOK_BASE_URL = 'https://webhook.ngrok.app';
      process.env.SHOPIFY_APP_URL = 'https://app.ngrok.app';

      const errors = validateTunnelConfig();
      expect(errors).toEqual([]);
    });

    it('should return no errors when tunnel is not active', () => {
      process.env.TUNNEL_ACTIVE = 'false';
      
      const errors = validateTunnelConfig();
      expect(errors).toEqual([]);
    });

    it('should return errors for missing webhook URL', () => {
      process.env.TUNNEL_ACTIVE = 'true';
      process.env.NODE_ENV = 'development';
      process.env.SHOPIFY_APP_URL = 'https://app.ngrok.app';
      process.env.WEBHOOK_BASE_URL = undefined;

      const errors = validateTunnelConfig();
      expect(errors).toContain('WEBHOOK_BASE_URL is required when tunnel is active');
    });

    it('should return errors for missing Shopify app URL', () => {
      process.env.TUNNEL_ACTIVE = 'true';
      process.env.NODE_ENV = 'development';
      process.env.WEBHOOK_BASE_URL = 'https://webhook.ngrok.app';
      process.env.SHOPIFY_APP_URL = undefined;

      const errors = validateTunnelConfig();
      expect(errors).toContain('SHOPIFY_APP_URL is required when tunnel is active');
    });

    it('should return errors for non-HTTPS webhook URL', () => {
      process.env.TUNNEL_ACTIVE = 'true';
      process.env.NODE_ENV = 'development';
      process.env.WEBHOOK_BASE_URL = 'http://insecure.ngrok.app';
      process.env.SHOPIFY_APP_URL = 'https://app.ngrok.app';

      const errors = validateTunnelConfig();
      expect(errors).toContain('WEBHOOK_BASE_URL must use HTTPS for Shopify compatibility');
    });

    it('should return errors for non-HTTPS Shopify app URL', () => {
      process.env.TUNNEL_ACTIVE = 'true';
      process.env.NODE_ENV = 'development';
      process.env.WEBHOOK_BASE_URL = 'https://webhook.ngrok.app';
      process.env.SHOPIFY_APP_URL = 'http://insecure.ngrok.app';

      const errors = validateTunnelConfig();
      expect(errors).toContain('SHOPIFY_APP_URL must use HTTPS for Shopify compatibility');
    });

    it('should return multiple errors when multiple issues exist', () => {
      process.env.TUNNEL_ACTIVE = 'true';
      process.env.NODE_ENV = 'development';
      process.env.WEBHOOK_BASE_URL = 'http://insecure.ngrok.app';
      process.env.SHOPIFY_APP_URL = undefined;

      const errors = validateTunnelConfig();
      expect(errors).toHaveLength(2);
      expect(errors).toContain('SHOPIFY_APP_URL is required when tunnel is active');
      expect(errors).toContain('WEBHOOK_BASE_URL must use HTTPS for Shopify compatibility');
    });
  });
});