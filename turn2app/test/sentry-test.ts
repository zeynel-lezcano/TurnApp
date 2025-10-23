/**
 * Manual test for Sentry integration
 * Run with: npx tsx test/sentry-test.ts
 */

import { initSentry, captureApiError, isSentryConfigured } from '../app/lib/sentry.server.js';

console.log('🔧 Testing Sentry Integration...\n');

// Initialize Sentry
initSentry();

// Check if Sentry is configured
console.log(`✅ Sentry configured: ${isSentryConfigured()}`);

if (isSentryConfigured()) {
  console.log('📤 Testing error capture...');
  
  // Test error capture
  const mockRequest = {
    method: 'GET',
    url: 'http://localhost:3000/test',
    headers: new Map([
      ['user-agent', 'test-agent'],
      ['x-forwarded-for', '127.0.0.1']
    ])
  };

  try {
    throw new Error('Test error for Sentry integration');
  } catch (error) {
    captureApiError(error as Error, {
      request: mockRequest,
      shop: 'test-shop.myshopify.com',
      endpoint: '/test',
      extra: {
        testType: 'integration-test',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('✅ Error captured and sent to Sentry');
  }
} else {
  console.log('⚠️  Sentry not configured - set SENTRY_DSN in .env to test');
}

console.log('\n🎉 Sentry integration test completed');