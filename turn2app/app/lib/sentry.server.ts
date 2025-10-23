/**
 * Sentry Error Tracking Service
 * 
 * Production-grade error monitoring, performance tracking, and alerting
 * für turn2app Shopify Integration
 */

import * as Sentry from '@sentry/remix';

// Sentry Configuration
const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || 'development';
const APP_VERSION = '1.0.0'; // TODO: Extract from package.json

/**
 * Initialize Sentry SDK
 * Called once on server startup
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('⚠️  SENTRY_DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: `turn2app@${APP_VERSION}`,
    
    // Performance Monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    
    // Error Filtering
    beforeSend(event) {
      // Filter out noise in development
      if (SENTRY_ENVIRONMENT === 'development') {
        // Skip CORS and other dev-only errors
        if (event.message?.includes('CORS') || 
            event.message?.includes('ngrok')) {
          return null;
        }
      }
      
      return event;
    },

    // Enhanced Context & Integrations
    integrations: [
      // Server-side HTTP instrumentation
      Sentry.httpIntegration(),
    ],
  });

  console.log(`✓ Sentry initialized (${SENTRY_ENVIRONMENT})`);
}

/**
 * Capture API Error with Context
 * Used in API routes for structured error reporting
 */
export function captureApiError(
  error: Error | string,
  context: {
    request: any; // Remix Request object
    shop?: string;
    endpoint?: string;
    userId?: string;
    extra?: Record<string, any>;
  }
) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  Sentry.withScope((scope) => {
    // Request Context
    scope.setTag('component', 'api');
    scope.setTag('endpoint', context.endpoint || context.request.url);
    scope.setLevel('error');
    
    // Shop Context (for multi-tenant debugging)
    if (context.shop) {
      scope.setTag('shop', context.shop);
      scope.setContext('shop', { domain: context.shop });
    }
    
    // User Context
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    
    // Request Details
    scope.setContext('request', {
      method: context.request.method,
      url: context.request.url,
      headers: {
        'user-agent': context.request.headers.get('user-agent'),
        'x-forwarded-for': context.request.headers.get('x-forwarded-for'),
      },
    });
    
    // Extra Context
    if (context.extra) {
      scope.setContext('extra', context.extra);
    }
    
    // Capture Error
    if (typeof error === 'string') {
      Sentry.captureMessage(error);
    } else {
      Sentry.captureException(error);
    }
  });
}

/**
 * Capture Shopify API Error
 * Specialized error handler für Shopify GraphQL/REST API errors
 */
export function captureShopifyError(
  error: Error,
  context: {
    shop: string;
    api: 'graphql' | 'rest' | 'storefront';
    operation?: string;
    request?: any; // Remix Request object
    extra?: Record<string, any>;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag('component', 'shopify-api');
    scope.setTag('shopify_api', context.api);
    scope.setTag('shop', context.shop);
    scope.setLevel('error');
    
    scope.setContext('shopify', {
      shop: context.shop,
      api: context.api,
      operation: context.operation,
    });
    
    if (context.extra) {
      scope.setContext('extra', context.extra);
    }
    
    Sentry.captureException(error);
  });
}

/**
 * Performance Monitoring für kritische Operations
 */
export function trackPerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: {
    shop?: string;
    tags?: Record<string, string>;
  }
): Promise<T> {
  return Sentry.withScope((scope) => {
    scope.setTag('operation', operation);
    
    // Add Context
    if (context?.shop) {
      scope.setTag('shop', context.shop);
    }
    
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    const startTime = Date.now();
    
    return fn().finally(() => {
      const duration = Date.now() - startTime;
      scope.setContext('performance', { 
        operation,
        duration: `${duration}ms`
      });
    });
  });
}

/**
 * Add User Context to current Scope
 * Called after successful authentication
 */
export function setUserContext(userId: string, shop?: string) {
  Sentry.withScope((scope) => {
    scope.setUser({ 
      id: userId,
      username: shop,
    });
    
    if (shop) {
      scope.setTag('shop', shop);
    }
  });
}

/**
 * Capture Business Logic Warning
 * Non-critical issues that need monitoring
 */
export function captureWarning(
  message: string,
  context?: {
    shop?: string;
    level?: 'warning' | 'info';
    extra?: Record<string, any>;
  }
) {
  Sentry.withScope((scope) => {
    scope.setLevel(context?.level || 'warning');
    
    if (context?.shop) {
      scope.setTag('shop', context.shop);
    }
    
    if (context?.extra) {
      scope.setContext('extra', context.extra);
    }
    
    Sentry.captureMessage(message);
  });
}

/**
 * Simple error boundary for catching unhandled errors
 */
export function handleUnexpectedError(error: unknown, context?: string) {
  console.error(`Unexpected error${context ? ` in ${context}` : ''}:`, error);
  
  if (error instanceof Error) {
    Sentry.captureException(error);
  } else {
    Sentry.captureMessage(`Unexpected error: ${String(error)}`);
  }
}

/**
 * Capture Remix Error Boundary Error
 * Used in ErrorBoundary components
 */
export function captureRemixError(error: Error, errorBoundaryContext: any) {
  Sentry.withScope((scope) => {
    scope.setTag('component', 'error-boundary');
    scope.setContext('errorBoundary', errorBoundaryContext);
    Sentry.captureException(error);
  });
}

/**
 * Enhanced request logging with Sentry breadcrumbs
 */
export function logRequestWithSentry(
  request: any,
  context?: { shop?: string; requestId?: string },
  options?: { duration?: number; statusCode?: number; error?: string }
): void {
  // Add breadcrumb for Sentry
  Sentry.addBreadcrumb({
    category: 'http',
    message: `${request.method} ${request.url}`,
    level: options?.error ? 'error' : 'info',
    data: {
      method: request.method,
      url: request.url,
      statusCode: options?.statusCode,
      duration: options?.duration,
      shop: context?.shop,
      requestId: context?.requestId,
    },
  });

  // Capture error if present
  if (options?.error) {
    captureApiError(options.error, {
      request,
      shop: context?.shop,
      endpoint: request.url,
    });
  }
}

/**
 * Check if Sentry is properly configured
 */
export function isSentryConfigured(): boolean {
  return Boolean(SENTRY_DSN);
}

export { Sentry };