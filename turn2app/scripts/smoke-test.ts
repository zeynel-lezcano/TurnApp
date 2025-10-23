#!/usr/bin/env tsx

import { DUMMY_SHOPS } from './seed.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface TestResult {
  url: string;
  status: number;
  success: boolean;
  error?: string;
  data?: any;
}

async function testEndpoint(path: string): Promise<TestResult> {
  const url = `${BASE_URL}${path}`;
  
  try {
    console.log(`🧪 Testing: ${url}`);
    
    const response = await fetch(url);
    const isJson = response.headers.get('content-type')?.includes('application/json');
    
    let data = null;
    if (isJson) {
      try {
        data = await response.json();
      } catch (e) {
        // Non-critical if JSON parsing fails
      }
    }
    
    return {
      url,
      status: response.status,
      success: response.ok,
      data
    };
    
  } catch (error) {
    return {
      url,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function runSmokeTests() {
  console.log('🚀 Running smoke tests...');
  console.log(`📡 Base URL: ${BASE_URL}\n`);
  
  const testCases = [
    // Health checks - new monitoring endpoints
    '/healthz',
    '/readiness',
    
    // Config API for each dummy shop
    ...DUMMY_SHOPS.map(shop => `/api/config?shop=${shop.domain}`),
    
    // Products API (should fail without auth - testing rate limiting)
    '/api/products',
    
    // Auth endpoints (should redirect or show install)
    '/auth/install',
  ];
  
  const results: TestResult[] = [];
  
  for (const path of testCases) {
    const result = await testEndpoint(path);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.url} → ${result.status}`);
      if (result.data && path.includes('/api/config')) {
        const branding = result.data?.branding;
        if (branding?.name) {
          console.log(`   📱 App: ${branding.name} (${branding.primaryColor})`);
        }
      }
      if (result.data && (path.includes('/healthz') || path.includes('/readiness'))) {
        const { database, crypto, cache, sentry } = result.data;
        console.log(`   🔍 DB: ${database?.connected ? '✅' : '❌'} | Crypto: ${crypto?.working ? '✅' : '❌'} | Cache: ${cache?.working ? '✅' : '❌'} | Sentry: ${sentry?.configured ? '✅' : '⚠️'}`);
      }
    } else {
      // Special handling for expected failures
      if (path === '/api/products' && (result.status === 401 || result.status === 403)) {
        console.log(`✅ ${result.url} → ${result.status} (Expected auth failure)`);
        result.success = true; // Mark as success since this is expected
      } else {
        console.log(`❌ ${result.url} → ${result.status} (${result.error || 'Failed'})`);
      }
    }
  }
  
  // Summary
  const passed = results.filter(r => r.success).length;
  const failed = results.length - passed;
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n⚠️  Failed tests:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`   • ${r.url}: ${r.error || `HTTP ${r.status}`}`));
  }
  
  const success = failed === 0;
  console.log(success ? '\n🎉 All smoke tests passed!' : '\n💥 Some tests failed!');
  
  process.exit(success ? 0 : 1);
}

export { runSmokeTests };

// Auto-run when executed as script  
runSmokeTests().catch(console.error);