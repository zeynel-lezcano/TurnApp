import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { performHealthCheck, logRequest } from '../lib/monitoring.server.js';
import { HealthResponseSchema } from '../lib/validation.server';
import { rateLimitMiddleware } from '../lib/rate-limit.server';

/**
 * GET /healthz - Basic health check endpoint
 * 
 * Returns simple health status for load balancers and monitoring systems
 * Does not perform extensive checks to avoid impacting performance
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const startTime = Date.now();
  
  try {
    // Apply rate limiting for health checks (very permissive)
    const rateLimitResponse = await rateLimitMiddleware(request, 'health');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Log the health check request
    logRequest(request);
    
    // Basic health check (no deep checks for performance)
    const health = await performHealthCheck(false);
    
    // Validate response schema
    const validatedHealth = HealthResponseSchema.parse(health);
    
    const duration = Date.now() - startTime;
    logRequest(request, undefined, { duration, statusCode: 200 });
    
    return json(validatedHealth, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Health check endpoint error:', error);
    
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Health check failed';
    
    logRequest(request, undefined, { 
      duration, 
      statusCode: 503, 
      error: errorMessage 
    });

    return json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: errorMessage
      },
      { 
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }
}