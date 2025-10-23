#!/usr/bin/env tsx
/**
 * Manual webhook test script
 * Run with: pnpm tsx test/webhook-manual.ts
 */

import { createHmac } from "node:crypto";
import { verifyWebhookHmac } from "../app/lib/webhooks.server";

const secret = process.env.SHOPIFY_API_SECRET || "test-secret";

// Test app uninstall webhook payload
const uninstallPayload = {
  id: 1,
  domain: "test-shop.myshopify.com",
  scope: "write_orders,read_customers",
  uninstalled_at: new Date().toISOString()
};

// Test products update webhook payload  
const productPayload = {
  id: 123456789,
  title: "Test Product",
  handle: "test-product",
  updated_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  status: "active"
};

function generateWebhookHmac(payload: object, secret: string): string {
  const body = JSON.stringify(payload);
  return createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');
}

function testWebhookSignature(payload: object, description: string) {
  console.log(`\n🧪 Testing ${description}`);
  
  const body = JSON.stringify(payload);
  const hmac = generateWebhookHmac(payload, secret);
  const isValid = verifyWebhookHmac(body, `sha256=${hmac}`, secret);
  
  console.log(`   Body: ${body.substring(0, 60)}...`);
  console.log(`   HMAC: sha256=${hmac.substring(0, 20)}...`);
  console.log(`   Valid: ${isValid ? '✅' : '❌'}`);
  
  // Test with tampered payload
  const tamperedBody = body.replace('"test-', '"tampered-');
  const tamperedValid = verifyWebhookHmac(tamperedBody, `sha256=${hmac}`, secret);
  console.log(`   Tampered: ${tamperedValid ? '❌ Should be invalid!' : '✅ Correctly rejected'}`);
}

console.log("🎣 Webhook HMAC Verification Test");
console.log(`Secret: ${secret.substring(0, 10)}...`);

testWebhookSignature(uninstallPayload, "APP_UNINSTALLED webhook");
testWebhookSignature(productPayload, "PRODUCTS_UPDATE webhook");

console.log("\n🎯 Test Headers:");
console.log("X-Shopify-Hmac-Sha256: sha256=<calculated_hmac>");
console.log("X-Shopify-Shop-Domain: test-shop.myshopify.com");
console.log("Content-Type: application/json");

console.log("\n📡 Webhook URLs:");
console.log("POST /webhooks/app_uninstalled");
console.log("POST /webhooks/products_update");

console.log("\n✅ All tests completed!");