#!/usr/bin/env tsx

/**
 * Tunnel Configuration Checker
 * 
 * Validates tunnel setup and provides debugging information
 * Use this script to troubleshoot tunnel-related issues
 */

import { getTunnelInfo, validateTunnelConfig } from '../app/lib/tunnel.server.js';

function printTunnelStatus(): void {
  console.log('🔍 Tunnel Configuration Check');
  console.log('═'.repeat(40));
  
  const info = getTunnelInfo();
  
  console.log('\n📊 Current Configuration:');
  console.log(`   Active: ${info.active ? '✅ YES' : '❌ NO'}`);
  console.log(`   Node Environment: ${info.nodeEnv || 'undefined'}`);
  console.log(`   Public App URL: ${info.publicAppUrl || 'undefined'}`);
  console.log(`   Webhook Base URL: ${info.webhookBaseUrl || 'undefined'}`);
  console.log(`   Host: ${info.host || 'undefined'}`);
  console.log(`   Fallback APP_URL: ${info.appUrl || 'undefined'}`);
  
  // Validate configuration
  const errors = validateTunnelConfig();
  
  console.log('\n🔍 Validation Results:');
  if (errors.length === 0) {
    console.log('   ✅ Configuration is valid');
  } else {
    console.log('   ❌ Configuration issues found:');
    errors.forEach(error => {
      console.log(`      • ${error}`);
    });
  }
  
  // Environment variables check
  console.log('\n🔧 Environment Variables:');
  const envVars = [
    'TUNNEL_ACTIVE',
    'NODE_ENV', 
    'APP_URL',
    'WEBHOOK_BASE_URL',
    'SHOPIFY_APP_URL',
    'HOST',
    'NGROK_AUTHTOKEN',
    'NGROK_REGION'
  ];
  
  envVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value ? (varName.includes('TOKEN') ? '***hidden***' : value) : 'undefined';
    console.log(`   ${status} ${varName}: ${displayValue}`);
  });
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (!info.active && info.nodeEnv === 'development') {
    console.log('   • Run "pnpm dev:tunnel" to start ngrok tunnel');
    console.log('   • Make sure ngrok is installed globally or via npm');
  }
  
  if (info.active && errors.length > 0) {
    console.log('   • Fix the configuration errors listed above');
    console.log('   • Restart the tunnel with "pnpm dev:tunnel"');
  }
  
  if (info.active && errors.length === 0) {
    console.log('   • Configuration looks good! 🎉');
    console.log('   • Test webhook endpoints with the URLs above');
  }
  
  console.log('\n📚 Useful Commands:');
  console.log('   • Start tunnel: pnpm dev:tunnel');
  console.log('   • Start full dev env: pnpm dev:full');  
  console.log('   • Check tunnel status: pnpm tunnel:check');
  console.log('   • Test health endpoint: curl <webhook_base_url>/healthz');
}

function main(): void {
  try {
    printTunnelStatus();
  } catch (error) {
    console.error('❌ Failed to check tunnel configuration:', error);
    process.exit(1);
  }
}

// Self-execution check (Node.js compatibility)
const isMainModule = process.argv[1] && process.argv[1].endsWith('tunnel-check.ts');
if (isMainModule) {
  main();
}

export { printTunnelStatus };