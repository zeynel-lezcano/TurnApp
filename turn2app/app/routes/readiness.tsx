import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { checkReadiness, logRequest } from '../lib/monitoring.server';
import { HealthResponseSchema } from '../lib/validation.server';

/**
 * GET /readiness - Readiness probe endpoint
 * 
 * Returns detailed health status to determine if the application
 * is ready to serve traffic. Performs comprehensive checks.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const startTime = Date.now();
  
  try {
    // Log the readiness check request
    logRequest(request);
    
    // Comprehensive readiness check
    const readiness = await checkReadiness();
    
    // Validate response schema
    const validatedReadiness = HealthResponseSchema.parse(readiness);
    
    const duration = Date.now() - startTime;
    const statusCode = readiness.status === 'healthy' ? 200 : 503;
    
    logRequest(request, undefined, { duration, statusCode });
    
    return json(validatedReadiness, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Readiness check endpoint error:', error);
    
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Readiness check failed';
    
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