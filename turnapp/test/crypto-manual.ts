#!/usr/bin/env tsx
/**
 * Manual crypto test script
 * Run with: pnpm tsx test/crypto-manual.ts
 */

import { encryptToken, decryptToken, testCrypto, generateEncryptionKey } from "../app/lib/crypto.server";

console.log("🔐 Token Encryption Test");

// Test typical Shopify tokens
const testTokens = [
  "shp_ca123456789abcdef123456789abcdef",
  "shp_us987654321fedcba987654321fedcba9",
  "shp_test_development_token_12345"
];

console.log("\n📋 Test Results:");
for (const token of testTokens) {
  console.log(`\n🎯 Testing: ${token.substring(0, 20)}...`);
  
  const encrypted = encryptToken(token);
  console.log(`   Encrypted: ${encrypted.substring(0, 40)}... (${encrypted.length} chars)`);
  
  const decrypted = decryptToken(encrypted);
  const success = decrypted === token;
  console.log(`   Decrypted: ${decrypted.substring(0, 20)}...`);
  console.log(`   Success: ${success ? '✅' : '❌'}`);
}

// Test crypto implementation
console.log("\n🧪 Built-in Test:");
const cryptoTest = testCrypto();
console.log(`   Crypto Implementation: ${cryptoTest ? '✅' : '❌'}`);

// Show encryption key info
console.log("\n🔑 Encryption Key Info:");
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   ENCRYPTION_KEY set: ${process.env.ENCRYPTION_KEY ? 'Yes' : 'No'}`);

// Generate new key example
console.log("\n🆕 Generate New Key:");
const newKey = generateEncryptionKey();
console.log(`   New Key: ${newKey}`);
console.log("   ⚠️  Store this in production as ENCRYPTION_KEY environment variable");

// Performance test
console.log("\n⚡ Performance Test:");
const perfToken = "shp_performance_test_token_abcdef123456";
const start = Date.now();
let iterations = 0;

for (let i = 0; i < 1000; i++) {
  const enc = encryptToken(perfToken);
  const dec = decryptToken(enc);
  if (dec === perfToken) iterations++;
}

const duration = Date.now() - start;
console.log(`   1000 roundtrips: ${duration}ms`);
console.log(`   Success rate: ${iterations}/1000`);
console.log(`   Rate: ${Math.round(1000000 / duration)} ops/second`);

console.log("\n✅ All tests completed!");
console.log("\n💡 Usage in production:");
console.log("   1. Set ENCRYPTION_KEY environment variable");
console.log("   2. Tokens are automatically encrypted before DB storage");
console.log("   3. Tokens are decrypted when needed for API calls");
console.log("   4. Uses AES-256-CBC + HMAC-SHA256 for security");