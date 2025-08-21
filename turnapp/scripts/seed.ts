#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { encryptToken, generateEncryptionKey } from '../app/lib/crypto.server.js';

const prisma = new PrismaClient();

interface DummyShop {
  domain: string;
  accessToken: string;
  settings: {
    branding: {
      name: string;
      primaryColor: string;
      logoUrl?: string;
    };
    layout: {
      type: string;
      heroText: string;
    };
  };
}

const DUMMY_SHOPS: DummyShop[] = [
  {
    domain: 'demo-electronics.myshopify.com',
    accessToken: 'shpat_dummy_electronics_token_12345',
    settings: {
      branding: {
        name: 'TechHub Electronics',
        primaryColor: '#2563eb',
        logoUrl: 'https://picsum.photos/200/100?random=1'
      },
      layout: {
        type: 'hero-grid',
        heroText: 'Discover the Latest Tech'
      }
    }
  },
  {
    domain: 'demo-fashion.myshopify.com', 
    accessToken: 'shpat_dummy_fashion_token_67890',
    settings: {
      branding: {
        name: 'StyleCo Fashion',
        primaryColor: '#ec4899',
        logoUrl: 'https://picsum.photos/200/100?random=2'
      },
      layout: {
        type: 'hero-grid',
        heroText: 'Express Your Style'
      }
    }
  },
  {
    domain: 'demo-home.myshopify.com',
    accessToken: 'shpat_dummy_home_token_54321',
    settings: {
      branding: {
        name: 'CozyHome Decor',
        primaryColor: '#059669',
        logoUrl: 'https://picsum.photos/200/100?random=3'
      },
      layout: {
        type: 'hero-grid', 
        heroText: 'Make Your House a Home'
      }
    }
  }
];

async function seed() {
  console.log('🌱 Seeding database...');
  
  try {
    // Test crypto functionality
    console.log('🔐 Testing encryption...');
    const testToken = 'test-token-123';
    const encrypted = encryptToken(testToken);
    console.log(`✓ Encryption test passed (length: ${encrypted.length})`);
    
    // Clear existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.asset.deleteMany();
    await prisma.shop.deleteMany();
    
    // Seed shops
    console.log('🏪 Creating dummy shops...');
    
    for (const dummyShop of DUMMY_SHOPS) {
      const encryptedToken = encryptToken(dummyShop.accessToken);
      
      const shop = await prisma.shop.create({
        data: {
          shopDomain: dummyShop.domain,
          accessTokenEnc: encryptedToken,
          settings: JSON.stringify(dummyShop.settings),
          installedAt: new Date(),
        }
      });
      
      console.log(`✓ Created shop: ${dummyShop.domain} (${shop.id})`);
      
      // Add dummy logo asset
      if (dummyShop.settings.branding.logoUrl) {
        await prisma.asset.create({
          data: {
            shopId: shop.id,
            kind: 'logo',
            url: dummyShop.settings.branding.logoUrl,
          }
        });
        console.log(`  ✓ Added logo asset`);
      }
    }
    
    // Show summary
    const shopCount = await prisma.shop.count();
    const assetCount = await prisma.asset.count();
    
    console.log(`\n✨ Seeding completed!`);
    console.log(`   📊 Shops: ${shopCount}`);
    console.log(`   🖼️  Assets: ${assetCount}`);
    console.log(`\n🧪 Test URLs:`);
    
    for (const shop of DUMMY_SHOPS) {
      console.log(`   • /api/config?shop=${shop.domain}`);
    }
    
    console.log(`\n💡 Run smoke tests:`);
    console.log(`   pnpm test scripts/smoke-test.ts`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

export { seed, DUMMY_SHOPS };

// Auto-run when executed as script
seed().catch(console.error);