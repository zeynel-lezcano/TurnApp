/**
 * Manual test for Rate Limiting system
 * Run with: npx tsx test/rate-limit-test.ts
 */

import { 
  checkRateLimit, 
  getShopifyBudget, 
  addShopifyApiCost, 
  canMakeShopifyRequest,
  withRetry,
  calculateBackoffDelay
} from '../app/lib/rate-limit.server.js';

console.log('🔧 Testing Rate Limiting System...\n');

async function testBasicRateLimit() {
  console.log('📊 Testing basic rate limiting...');
  
  const mockRequest = {
    method: 'GET',
    url: 'http://localhost:3000/api/products',
    headers: new Map([
      ['x-forwarded-for', '127.0.0.1'],
      ['user-agent', 'test-client']
    ])
  } as any;

  // Test multiple requests to trigger rate limit
  for (let i = 1; i <= 5; i++) {
    const result = await checkRateLimit(mockRequest, 'api.products', { shop: 'test-shop.myshopify.com' });
    console.log(`Request ${i}: ${result.allowed ? '✅ Allowed' : '❌ Blocked'} (remaining: ${result.remaining})`);
  }
  
  console.log('');
}

function testShopifyBudget() {
  console.log('💰 Testing Shopify API budget management...');
  
  const shopDomain = 'test-shop.myshopify.com';
  
  // Check initial budget
  let budget = getShopifyBudget(shopDomain);
  console.log(`Initial budget: ${budget.currentCost}/${budget.maxCost} (remaining: ${budget.remaining})`);
  
  // Simulate API calls
  console.log('Adding API costs...');
  addShopifyApiCost(shopDomain, 100);
  addShopifyApiCost(shopDomain, 200);
  addShopifyApiCost(shopDomain, 300);
  
  budget = getShopifyBudget(shopDomain);
  console.log(`After API calls: ${budget.currentCost}/${budget.maxCost} (remaining: ${budget.remaining})`);
  
  // Test if we can make more requests
  console.log(`Can make request (cost 50): ${canMakeShopifyRequest(shopDomain, 50) ? '✅ Yes' : '❌ No'}`);
  console.log(`Can make request (cost 500): ${canMakeShopifyRequest(shopDomain, 500) ? '✅ Yes' : '❌ No'}`);
  
  console.log('');
}

function testBackoffCalculation() {
  console.log('⏱️  Testing exponential backoff...');
  
  for (let attempt = 0; attempt < 5; attempt++) {
    const delay = calculateBackoffDelay(attempt, 1000);
    console.log(`Attempt ${attempt + 1}: ${delay}ms delay`);
  }
  
  console.log('');
}

async function testRetryMechanism() {
  console.log('🔄 Testing retry mechanism...');
  
  let attemptCount = 0;
  const failingOperation = async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error(`Attempt ${attemptCount} failed`);
    }
    return 'Success!';
  };
  
  try {
    const result = await withRetry(
      failingOperation,
      3,
      100, // Fast delays for testing
      { shop: 'test-shop.myshopify.com', operation: 'test-operation' }
    );
    console.log(`✅ Retry succeeded: ${result}`);
  } catch (error) {
    console.log(`❌ Retry failed: ${error instanceof Error ? error.message : error}`);
  }
  
  console.log('');
}

// Run all tests
async function runTests() {
  await testBasicRateLimit();
  testShopifyBudget();
  testBackoffCalculation();
  await testRetryMechanism();
  
  console.log('🎉 Rate limiting system tests completed');
}

runTests().catch(console.error);