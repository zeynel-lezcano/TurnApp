/**
 * Monitoring and Health Check Utilities
 * 
 * Provides health checks, request logging, and error tracking
 * infrastructure according to architecture docs
 */

import { prisma } from './prisma.server.js';
import { testCrypto } from './crypto.server.js';

/**
 * Health check status
 */
export type HealthStatus = 'healthy' | 'unhealthy';

/**
 * Database health check result
 */
export interface DatabaseHealth {
  connected: boolean;
  shops: number;
  latency?: number;
}

/**
 * Crypto health check result  
 */
export interface CryptoHealth {
  working: boolean;
}

/**
 * Application health result
 */
export interface AppHealth {
  status: HealthStatus;
  timestamp: string;
  database?: DatabaseHealth;
  crypto?: CryptoHealth;
  version?: string;
  error?: string;
}

/**
 * Request log entry
 */
export interface RequestLog {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  shopDomain?: string;
  timestamp: string;
  duration?: number;
  statusCode?: number;
  error?: string;
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    const startTime = Date.now();
    
    // Test basic database connectivity
    const shopCount = await prisma.shop.count();
    
    const latency = Date.now() - startTime;
    
    return {
      connected: true,
      shops: shopCount,
      latency
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      connected: false,
      shops: 0
    };
  }
}

/**
 * Check crypto system health
 */
export async function checkCryptoHealth(): Promise<CryptoHealth> {
  try {
    const isWorking = await testCrypto();
    return {
      working: isWorking
    };
  } catch (error) {
    console.error('Crypto health check failed:', error);
    return {
      working: false
    };
  }
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(includeDetails: boolean = false): Promise<AppHealth> {
  try {
    const timestamp = new Date().toISOString();
    
    if (!includeDetails) {
      // Basic health check - just return healthy status
      return {
        status: 'healthy',
        timestamp
      };
    }

    // Detailed health check
    const [databaseHealth, cryptoHealth] = await Promise.allSettled([
      checkDatabaseHealth(),
      checkCryptoHealth()
    ]);

    const dbHealth = databaseHealth.status === 'fulfilled' ? databaseHealth.value : { connected: false, shops: 0 };
    const cryptoHealthResult = cryptoHealth.status === 'fulfilled' ? cryptoHealth.value : { working: false };

    // Determine overall status
    const isHealthy = dbHealth.connected && cryptoHealthResult.working;
    
    const health: AppHealth = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      database: dbHealth,
      crypto: cryptoHealthResult,
      version: process.env.npm_package_version || '1.0.0'
    };

    if (!isHealthy) {
      const issues: string[] = [];
      if (!dbHealth.connected) issues.push('database connection failed');
      if (!cryptoHealthResult.working) issues.push('crypto system failed');
      
      health.error = `Health check failed: ${issues.join(', ')}`;
    }

    return health;

  } catch (error) {
    console.error('Health check failed:', error);
    
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown health check error'
    };
  }
}

/**
 * Check if application is ready to serve traffic
 */
export async function checkReadiness(): Promise<AppHealth> {
  try {
    // Readiness requires database and crypto to be working
    const [databaseHealth, cryptoHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkCryptoHealth()
    ]);

    const isReady = databaseHealth.connected && cryptoHealth.working;
    
    return {
      status: isReady ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: databaseHealth,
      crypto: cryptoHealth,
      error: isReady ? undefined : 'Application not ready'
    };

  } catch (error) {
    console.error('Readiness check failed:', error);
    
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Readiness check failed'
    };
  }
}

/**
 * Log structured request information
 */
export function logRequest(
  request: Request, 
  context?: { shop?: string },
  options?: { duration?: number; statusCode?: number; error?: string }
): void {
  try {
    const requestId = request.headers.get('x-request-id') || generateRequestId();
    const url = new URL(request.url);
    
    const logEntry: RequestLog = {
      requestId,
      method: request.method,
      url: url.pathname + url.search,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      shopDomain: context?.shop,
      timestamp: new Date().toISOString(),
      duration: options?.duration,
      statusCode: options?.statusCode,
      error: options?.error
    };

    // Log as JSON for structured logging
    console.log(JSON.stringify(logEntry, null, 0));

  } catch (error) {
    console.error('Failed to log request:', error);
  }
}

/**
 * Enhanced request logging for middleware integration
 */
export function logRequestWithContext(
  request: Request,
  context?: { shop?: string; session?: any },
  options?: { duration?: number; statusCode?: number; error?: string }
): void {
  logRequest(request, context, options);
}

/**
 * Create request logging middleware
 */
export function createRequestLogger() {
  return (request: Request, context?: { shop?: string }) => {
    const startTime = Date.now();
    
    // Log request start
    logRequest(request, context);
    
    // Return function to log request completion
    return (statusCode: number, error?: string) => {
      const duration = Date.now() - startTime;
      logRequest(request, context, { duration, statusCode, error });
    };
  };
}

/**
 * Get application metrics
 */
export function getApplicationMetrics() {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid
  };
}

/**
 * Check if environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if monitoring is enabled
 */
export function isMonitoringEnabled(): boolean {
  return process.env.MONITORING_ENABLED !== 'false';
}