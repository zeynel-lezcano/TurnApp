/**
 * Rate Limiting & API Budget Management
 * 
 * Provides rate limiting for API endpoints and Shopify GraphQL budget management
 * to prevent abuse and ensure fair resource usage
 */

import { captureApiError, captureWarning } from './sentry.server.js';

/**
 * Rate limit configuration for different endpoint types
 */
interface RateLimitConfig {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
}

/**
 * Shopify GraphQL cost budget tracking
 */
interface ShopifyBudget {
  currentCost: number;
  maxCost: number;
  resetTime: number; // Unix timestamp
  shop: string;
}

/**
 * Rate limit store for tracking requests
 */
class MemoryRateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const data = this.store.get(key);
    if (!data) return null;
    
    // Clean up expired entries
    if (Date.now() > data.resetTime) {
      this.store.delete(key);
      return null;
    }
    
    return data;
  }

  async set(key: string, count: number, windowMs: number): Promise<void> {
    const resetTime = Date.now() + windowMs;
    this.store.set(key, { count, resetTime });
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const existing = await this.get(key);
    
    if (!existing) {
      const resetTime = Date.now() + windowMs;
      const data = { count: 1, resetTime };
      this.store.set(key, data);
      return data;
    }
    
    existing.count++;
    this.store.set(key, existing);
    return existing;
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Shopify API budget store for tracking GraphQL costs
 */
class ShopifyBudgetStore {
  private budgets = new Map<string, ShopifyBudget>();

  getBudget(shop: string): ShopifyBudget {
    const existing = this.budgets.get(shop);
    const now = Date.now();
    
    // Reset budget if expired (Shopify resets every minute)
    if (!existing || now > existing.resetTime) {
      const budget: ShopifyBudget = {
        currentCost: 0,
        maxCost: 1000, // Shopify's default limit
        resetTime: now + 60000, // 1 minute
        shop
      };
      this.budgets.set(shop, budget);
      return budget;
    }
    
    return existing;
  }

  addCost(shop: string, cost: number): ShopifyBudget {
    const budget = this.getBudget(shop);
    budget.currentCost += cost;
    this.budgets.set(shop, budget);
    return budget;
  }

  getRemainingBudget(shop: string): number {
    const budget = this.getBudget(shop);
    return Math.max(0, budget.maxCost - budget.currentCost);
  }

  canMakeRequest(shop: string, estimatedCost: number = 50): boolean {
    return this.getRemainingBudget(shop) >= estimatedCost;
  }
}

// Global stores
const rateLimitStore = new MemoryRateLimitStore();
const budgetStore = new ShopifyBudgetStore();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  rateLimitStore.cleanup();
}, 5 * 60 * 1000);

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Public API endpoints - more restrictive
  'api.config': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,     // 60 requests per minute
    message: 'Too many config requests'
  },
  
  'api.products': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,     // 30 requests per minute
    message: 'Too many product requests'
  },

  // Admin API endpoints - less restrictive for authenticated users
  'admin.api': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120,    // 120 requests per minute
    message: 'Too many admin API requests'
  },

  // Webhook endpoints - very restrictive
  'webhooks': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,    // 100 webhooks per minute per shop
    message: 'Too many webhook calls'
  },

  // Upload endpoints - restrictive due to resource usage
  'uploads': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,     // 10 uploads per minute
    message: 'Too many upload requests'
  },

  // Health checks - very permissive
  'health': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 300,    // 300 health checks per minute
    skipSuccessfulRequests: true
  }
};

/**
 * Generate rate limit key for request
 */
function getRateLimitKey(request: Request, shop?: string, limitType?: string): string {
  const url = new URL(request.url);
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Use shop domain if available for shop-specific limits
  if (shop) {
    return `${limitType || 'api'}:${shop}:${url.pathname}`;
  }
  
  // Use IP for anonymous limits
  return `${limitType || 'api'}:${ip}:${url.pathname}`;
}

/**
 * Check if request is rate limited
 */
export async function checkRateLimit(
  request: Request,
  limitType: keyof typeof RATE_LIMITS,
  context?: { shop?: string }
): Promise<{ allowed: boolean; remaining: number; resetTime: number; error?: string }> {
  try {
    const config = RATE_LIMITS[limitType];
    if (!config) {
      return { allowed: true, remaining: Infinity, resetTime: 0 };
    }

    const key = getRateLimitKey(request, context?.shop, limitType);
    const result = await rateLimitStore.increment(key, config.windowMs);
    
    const allowed = result.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - result.count);

    if (!allowed) {
      // Log rate limit violation
      captureWarning('Rate limit exceeded', {
        shop: context?.shop,
        level: 'warning',
        extra: {
          limitType,
          count: result.count,
          maxRequests: config.maxRequests,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      });
    }

    return {
      allowed,
      remaining,
      resetTime: result.resetTime,
      error: allowed ? undefined : (config.message || 'Rate limit exceeded')
    };

  } catch (error) {
    console.error('Rate limit check failed:', error);
    
    if (error instanceof Error) {
      captureApiError(error, {
        request,
        shop: context?.shop,
        endpoint: 'rate-limit-check',
        extra: { limitType }
      });
    }

    // Fail open - allow request if rate limiting fails
    return { allowed: true, remaining: 0, resetTime: 0 };
  }
}

/**
 * Create rate limit headers for HTTP response
 */
export function createRateLimitHeaders(
  remaining: number,
  resetTime: number,
  maxRequests: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(), // Unix timestamp
    'X-RateLimit-Reset-MS': resetTime.toString() // Milliseconds for precision
  };
}

/**
 * Shopify GraphQL Budget Management
 */
export function getShopifyBudget(shop: string): {
  currentCost: number;
  maxCost: number;
  remaining: number;
  resetTime: number;
} {
  const budget = budgetStore.getBudget(shop);
  return {
    currentCost: budget.currentCost,
    maxCost: budget.maxCost,
    remaining: budget.maxCost - budget.currentCost,
    resetTime: budget.resetTime
  };
}

/**
 * Add cost to Shopify GraphQL budget
 */
export function addShopifyApiCost(shop: string, cost: number): void {
  const budget = budgetStore.addCost(shop, cost);
  
  // Warn if budget is getting low
  const remaining = budget.maxCost - budget.currentCost;
  if (remaining < 100) {
    captureWarning('Shopify API budget running low', {
      shop,
      level: 'warning',
      extra: {
        currentCost: budget.currentCost,
        maxCost: budget.maxCost,
        remaining
      }
    });
  }
}

/**
 * Check if Shopify API request can be made
 */
export function canMakeShopifyRequest(shop: string, estimatedCost: number = 50): boolean {
  return budgetStore.canMakeRequest(shop, estimatedCost);
}

/**
 * Exponential backoff utility for failed requests
 */
export function calculateBackoffDelay(attempt: number, baseDelay: number = 1000): number {
  // Exponential backoff with jitter: 2^attempt * baseDelay + random(0, 1000)
  const exponentialDelay = Math.pow(2, attempt) * baseDelay;
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context?: { shop?: string; operation?: string }
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        // Final attempt failed
        if (context) {
          captureApiError(lastError, {
            request: { method: 'RETRY', url: context.operation || 'unknown' } as any,
            shop: context.shop,
            endpoint: context.operation,
            extra: {
              attempt,
              maxRetries,
              finalError: true
            }
          });
        }
        throw lastError;
      }
      
      // Calculate delay for next attempt
      const delay = calculateBackoffDelay(attempt, baseDelay);
      
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Rate limiting middleware for Remix actions/loaders
 */
export async function rateLimitMiddleware(
  request: Request,
  limitType: keyof typeof RATE_LIMITS,
  context?: { shop?: string }
): Promise<Response | null> {
  const { allowed, remaining, resetTime, error } = await checkRateLimit(request, limitType, context);
  
  if (!allowed) {
    const config = RATE_LIMITS[limitType];
    const headers = createRateLimitHeaders(remaining, resetTime, config.maxRequests);
    
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: error || 'Too many requests',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      }
    );
  }
  
  return null; // Allow request to proceed
}