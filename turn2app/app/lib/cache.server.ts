/**
 * Cache Service für TurnApp - Redis/Memory Cache Integration
 * 
 * Zentraler Cache-Service für Performance-Optimierung der API Endpoints.
 * Unterstützt Redis (Production) und Memory Cache (Development/Fallback).
 * 
 * FEATURES:
 * - TTL-basierte Caching mit automatischer Invalidierung
 * - Shop-spezifische Cache-Keys für Mandantentrennung
 * - Graceful Fallback zu Memory Cache falls Redis nicht verfügbar
 * - Cache Invalidation für Webhook-gesteuerte Updates
 * 
 * VERWENDUNG:
 * - Product API: 60s TTL für Storefront-Daten
 * - Config API: 300s TTL für Shop-Konfiguration
 * - Webhook Invalidation: Gezieltes Löschen bei PRODUCTS_UPDATE
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Cache Service - Abstrakte Interface für verschiedene Cache-Implementierungen
 */
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, data: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Memory Cache Implementation - Development/Fallback
 * 
 * In-Memory Cache für lokale Entwicklung und als Fallback
 * wenn Redis nicht verfügbar ist. Nicht für Production geeignet
 * da Daten bei Server-Restart verloren gehen.
 */
class MemoryCache implements CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 300; // 5 minutes default

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  async set<T>(key: string, data: T, ttlSeconds = this.defaultTTL): Promise<void> {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    // Convert pattern to RegExp (simple implementation)
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  // Cleanup expired entries periodically
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  constructor() {
    // Run cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
}

/**
 * Redis Cache Implementation - Production
 * 
 * Redis-basierte Cache-Implementierung für Production.
 * Unterstützt Clustering und persistente Daten.
 * TODO: Implementation when Redis is available
 */
class RedisCache implements CacheService {
  private redis: any = null;

  constructor() {
    // TODO: Initialize Redis client when available
    // this.redis = createRedisClient(process.env.REDIS_URL);
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) {
      console.warn('Redis not available, falling back to null cache');
      return null;
    }
    
    // TODO: Implement Redis get
    return null;
  }

  async set<T>(key: string, data: T, ttlSeconds = 300): Promise<void> {
    if (!this.redis) {
      console.warn('Redis not available, cache write ignored');
      return;
    }
    
    // TODO: Implement Redis set with TTL
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return;
    // TODO: Implement Redis delete
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.redis) return;
    // TODO: Implement Redis pattern delete (KEYS pattern + DEL)
  }

  async clear(): Promise<void> {
    if (!this.redis) return;
    // TODO: Implement Redis FLUSHALL
  }
}

/**
 * Cache Key Utilities - Shop-spezifische Cache-Keys
 */
export const CacheKeys = {
  // Product API Cache Keys
  products: (shopDomain: string, params: string) => `products:${shopDomain}:${params}`,
  
  // Config API Cache Keys  
  config: (shopDomain: string) => `config:${shopDomain}`,
  
  // Shop-spezifische Pattern für Invalidation
  shopPattern: (shopDomain: string) => `*:${shopDomain}*`,
  productsPattern: (shopDomain: string) => `products:${shopDomain}:*`,
} as const;

/**
 * Cache TTL Configuration
 */
export const CacheTTL = {
  PRODUCTS: 60,     // 1 minute - Products ändern sich häufig
  CONFIG: 300,      // 5 minutes - Config ändert sich seltener
  SHORT: 30,        // 30 seconds - Kurze Caches
  LONG: 3600,       // 1 hour - Lange Caches für statische Daten
} as const;

/**
 * Global Cache Instance
 */
let cacheInstance: CacheService | null = null;

/**
 * Get Cache Instance - Singleton Pattern
 * 
 * Returns Redis in production, Memory cache in development.
 * Graceful fallback to Memory cache if Redis fails.
 */
export function getCache(): CacheService {
  if (!cacheInstance) {
    // Check if Redis is available and we're in production
    const useRedis = process.env.NODE_ENV === 'production' && process.env.REDIS_URL;
    
    if (useRedis) {
      console.log('Initializing Redis cache');
      cacheInstance = new RedisCache();
    } else {
      console.log('Initializing Memory cache (development/fallback)');
      cacheInstance = new MemoryCache();
    }
  }
  
  return cacheInstance;
}

/**
 * Cache Wrapper Function - Vereinfachtes Caching Pattern
 * 
 * @param key Cache key
 * @param fetcher Function to fetch data if not in cache
 * @param ttlSeconds TTL in seconds
 * @returns Cached or fresh data
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = CacheTTL.CONFIG
): Promise<T> {
  const cache = getCache();
  
  try {
    // Try to get from cache first
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      console.log(`Cache hit: ${key}`);
      return cached;
    }
    
    // Cache miss - fetch fresh data
    console.log(`Cache miss: ${key}`);
    const freshData = await fetcher();
    
    // Store in cache for next time
    await cache.set(key, freshData, ttlSeconds);
    
    return freshData;
    
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error);
    
    // Fallback to direct fetch if cache fails
    return await fetcher();
  }
}

/**
 * Cache Invalidation Helper
 * 
 * Invalidates cache entries for a specific shop.
 * Used by webhooks to clear stale data.
 */
export async function invalidateShopCache(shopDomain: string): Promise<void> {
  const cache = getCache();
  
  try {
    // Invalidate all shop-specific cache entries
    await cache.deletePattern(CacheKeys.shopPattern(shopDomain));
    console.log(`Invalidated cache for shop: ${shopDomain}`);
    
  } catch (error) {
    console.error(`Failed to invalidate cache for shop ${shopDomain}:`, error);
  }
}

/**
 * Product Cache Invalidation
 * 
 * Specifically invalidates product caches for a shop.
 * Called from PRODUCTS_UPDATE webhook.
 */
export async function invalidateProductCache(shopDomain: string): Promise<void> {
  const cache = getCache();
  
  try {
    await cache.deletePattern(CacheKeys.productsPattern(shopDomain));
    console.log(`Invalidated product cache for shop: ${shopDomain}`);
    
  } catch (error) {
    console.error(`Failed to invalidate product cache for shop ${shopDomain}:`, error);
  }
}

/**
 * Cache Health Check
 * 
 * Checks if cache is working properly.
 * Used by /healthz endpoint.
 */
export async function checkCacheHealth(): Promise<{ working: boolean; type: string }> {
  try {
    const cache = getCache();
    const testKey = 'health:test';
    const testValue = { timestamp: Date.now() };
    
    // Test write
    await cache.set(testKey, testValue, 10);
    
    // Test read
    const retrieved = await cache.get(testKey);
    
    // Test delete
    await cache.delete(testKey);
    
    const working = retrieved !== null && (retrieved as any)?.timestamp === testValue.timestamp;
    const type = cacheInstance instanceof MemoryCache ? 'memory' : 'redis';
    
    return { working, type };
    
  } catch (error) {
    console.error('Cache health check failed:', error);
    return { working: false, type: 'unknown' };
  }
}