#!/usr/bin/env tsx

/**
 * Dev Tunnel Script using ngrok
 * 
 * Automatically starts ngrok tunnel for local development
 * Updates .env.local with tunnel URLs for Shopify webhooks
 */

import ngrok from 'ngrok';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PORT = 3000;
const ENV_FILE = '.env.local';
const PROJECT_ROOT = process.cwd();

interface TunnelConfig {
  url: string;
  port: number;
  protocol: 'https';
}

async function startTunnel(): Promise<TunnelConfig> {
  console.log(`🚀 Starting ngrok tunnel for port ${PORT}...`);
  
  try {
    const url = await ngrok.connect({
      port: PORT,
      proto: 'http',
      region: 'eu', // Use EU region for better performance in Europe
      onStatusChange: (status: string) => {
        console.log(`📡 Tunnel status: ${status}`);
      },
      onLogEvent: (data: any) => {
        // Only log errors to avoid spam
        if (data.lvl === 'ERROR') {
          console.error('🚨 Tunnel error:', data.msg);
        }
      }
    });

    console.log(`✅ Tunnel established: ${url}`);
    
    return {
      url,
      port: PORT,
      protocol: 'https'
    };
  } catch (error) {
    console.error('❌ Failed to start ngrok tunnel:', error);
    throw error;
  }
}

function updateEnvFile(tunnelConfig: TunnelConfig): void {
  const envPath = join(PROJECT_ROOT, ENV_FILE);
  let envContent = '';
  
  // Read existing .env.local if it exists
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8');
  }
  
  // Parse existing environment variables
  const envVars: Record<string, string> = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  // Update tunnel-specific variables
  envVars['APP_URL'] = tunnelConfig.url;
  envVars['HOST'] = tunnelConfig.url.replace('https://', '').replace('http://', '');
  envVars['SHOPIFY_APP_URL'] = tunnelConfig.url;
  envVars['WEBHOOK_BASE_URL'] = tunnelConfig.url;
  
  // Add development flag
  envVars['NODE_ENV'] = 'development';
  envVars['TUNNEL_ACTIVE'] = 'true';
  
  // Generate new env content
  const newEnvContent = Object.entries(envVars)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // Write updated .env.local
  writeFileSync(envPath, newEnvContent + '\n');
  
  console.log(`📝 Updated ${ENV_FILE} with tunnel URLs`);
  console.log(`   APP_URL=${tunnelConfig.url}`);
  console.log(`   HOST=${envVars['HOST']}`);
}

function printUsageInfo(tunnelConfig: TunnelConfig): void {
  console.log('\n🎯 Development Setup Complete!');
  console.log('═'.repeat(50));
  console.log(`🌐 Public URL: ${tunnelConfig.url}`);
  console.log(`🔧 Local Port: ${tunnelConfig.port}`);
  console.log('\n📋 Next Steps:');
  console.log('1. Update your Shopify Partner Dashboard:');
  console.log(`   - App URL: ${tunnelConfig.url}`);
  console.log(`   - Allowed redirection URLs: ${tunnelConfig.url}/auth/callback`);
  console.log(`   - Webhook URLs: ${tunnelConfig.url}/webhooks/*`);
  console.log('\n2. Start your development server:');
  console.log('   pnpm dev');
  console.log('\n3. Test the tunnel:');
  console.log(`   curl ${tunnelConfig.url}/healthz`);
  console.log('\n🛑 Keep this terminal running while developing!');
  console.log('   Press Ctrl+C to stop the tunnel');
}

async function cleanup(): Promise<void> {
  console.log('\n🧹 Cleaning up tunnel...');
  try {
    await ngrok.kill();
    console.log('✅ Tunnel closed successfully');
  } catch (error) {
    console.error('❌ Error closing tunnel:', error);
  }
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function main(): Promise<void> {
  try {
    // Check if ngrok is already running
    const api = ngrok.getApi();
    if (api) {
      try {
        const tunnels = await api.listTunnels();
        if (tunnels.tunnels && tunnels.tunnels.length > 0) {
          console.log('⚠️  Existing ngrok tunnels detected. Closing them...');
          await ngrok.kill();
          // Wait a moment for cleanup
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        // Ignore API errors, proceed with tunnel creation
      }
    }
    
    // Start tunnel
    const tunnelConfig = await startTunnel();
    
    // Update environment file
    updateEnvFile(tunnelConfig);
    
    // Print usage information
    printUsageInfo(tunnelConfig);
    
    // Keep the process running
    console.log('\n⏳ Tunnel is running... (Press Ctrl+C to stop)');
    
    // Keep alive
    setInterval(() => {
      // Ping ngrok to keep connection alive
    }, 30000);
    
  } catch (error) {
    console.error('❌ Failed to setup development tunnel:', error);
    process.exit(1);
  }
}

// Self-execution check (Node.js compatibility)
const isMainModule = process.argv[1] && process.argv[1].endsWith('dev-tunnel.ts');
if (isMainModule) {
  main();
}

export { startTunnel, updateEnvFile };