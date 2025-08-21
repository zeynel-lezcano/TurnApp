import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prisma } from '~/lib/prisma.server';
import { testCrypto } from '~/lib/crypto.server';
import { HealthResponseSchema } from '~/lib/validation.server';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Test database connection
    const shopCount = await prisma.shop.count();
    
    // Test crypto functionality
    const cryptoOk = testCrypto();
    
    const health = {
      status: 'healthy' as const,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        shops: shopCount
      },
      crypto: {
        working: cryptoOk
      },
      version: process.env.npm_package_version || 'unknown'
    };

    // Validate response schema
    const validatedHealth = HealthResponseSchema.parse(health);
    
    return json(validatedHealth, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const unhealthyResponse = {
      status: 'unhealthy' as const,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    // Validate error response schema
    const validatedError = HealthResponseSchema.parse(unhealthyResponse);
    
    return json(validatedError, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
}