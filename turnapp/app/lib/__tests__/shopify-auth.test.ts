import { describe, it, expect } from 'vitest';
import { verifyShopifyHmac, verifyWebhookHmac } from '../shopify-auth.server';

describe('Shopify Auth', () => {
  describe('verifyShopifyHmac', () => {
    it('should verify valid HMAC signature', () => {
      // Test with manually calculated HMAC
      const secret = 'test_secret';
      const params = new URLSearchParams({
        code: 'test_code',
        shop: 'test-shop.myshopify.com',
        state: 'test_state',
        timestamp: '1234567890'
      });
      
      // Calculate expected HMAC manually for this test
      const sortedParams = 'code=test_code&shop=test-shop.myshopify.com&state=test_state&timestamp=1234567890';
      const expectedHmac = require('crypto').createHmac('sha256', secret).update(sortedParams).digest('hex');
      
      params.set('hmac', expectedHmac);

      const result = verifyShopifyHmac(params, secret);
      expect(result).toBe(true);
    });

    it('should reject invalid HMAC signature', () => {
      const secret = 'hush';
      const params = new URLSearchParams({
        code: '0907a61c0c8d55e99db179b68161bc00',
        hmac: 'invalid_hmac',
        shop: 'test-shop.myshopify.com',
        state: '0.6784241404160823',
        timestamp: '1337178173'
      });

      const result = verifyShopifyHmac(params, secret);
      expect(result).toBe(false);
    });

    it('should reject missing HMAC', () => {
      const secret = 'hush';
      const params = new URLSearchParams({
        code: '0907a61c0c8d55e99db179b68161bc00',
        shop: 'test-shop.myshopify.com',
      });

      const result = verifyShopifyHmac(params, secret);
      expect(result).toBe(false);
    });
  });

  describe('verifyWebhookHmac', () => {
    it('should verify valid webhook HMAC', () => {
      const secret = 'my_webhook_secret';
      const body = '{"test": "data"}';
      
      // Calculate expected HMAC manually for this test
      const expectedHmac = require('crypto').createHmac('sha256', secret).update(body, 'utf8').digest('base64');

      const result = verifyWebhookHmac(body, expectedHmac, secret);
      expect(result).toBe(true);
    });

    it('should reject invalid webhook HMAC', () => {
      const secret = 'my_webhook_secret';
      const body = '{"test": "data"}';
      const invalidHmac = 'invalid_hmac';

      const result = verifyWebhookHmac(body, invalidHmac, secret);
      expect(result).toBe(false);
    });
  });
});