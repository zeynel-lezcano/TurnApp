/**
 * Tests for monitoring.server.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateRequestId,
  checkDatabaseHealth,
  checkCryptoHealth,
  performHealthCheck,
  checkReadiness,
  logRequest,
  getApplicationMetrics,
  isProduction,
  isMonitoringEnabled
} from '../../app/lib/monitoring.server.js';

// Mock dependencies
vi.mock('../../app/lib/prisma.server.js', () => ({
  prisma: {
    shop: {
      count: vi.fn()
    }
  }
}));

vi.mock('../../app/lib/crypto.server.js', () => ({
  testCrypto: vi.fn()
}));

import { prisma } from '../../app/lib/prisma.server.js';
import { testCrypto } from '../../app/lib/crypto.server.js';

describe('monitoring.server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      
      expect(id1).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('checkDatabaseHealth', () => {
    it('should return healthy database status', async () => {
      vi.mocked(prisma.shop.count).mockResolvedValue(5);

      const health = await checkDatabaseHealth();

      expect(health).toEqual({
        connected: true,
        shops: 5,
        latency: expect.any(Number)
      });
      expect(health.latency).toBeGreaterThanOrEqual(0);
    });

    it('should return unhealthy status on database error', async () => {
      vi.mocked(prisma.shop.count).mockRejectedValue(new Error('DB connection failed'));

      const health = await checkDatabaseHealth();

      expect(health).toEqual({
        connected: false,
        shops: 0
      });
      expect(console.error).toHaveBeenCalledWith('Database health check failed:', expect.any(Error));
    });
  });

  describe('checkCryptoHealth', () => {
    it('should return healthy crypto status', async () => {
      vi.mocked(testCrypto).mockResolvedValue(true);

      const health = await checkCryptoHealth();

      expect(health).toEqual({
        working: true
      });
    });

    it('should return unhealthy status on crypto error', async () => {
      vi.mocked(testCrypto).mockRejectedValue(new Error('Crypto test failed'));

      const health = await checkCryptoHealth();

      expect(health).toEqual({
        working: false
      });
      expect(console.error).toHaveBeenCalledWith('Crypto health check failed:', expect.any(Error));
    });
  });

  describe('performHealthCheck', () => {
    it('should return basic health check without details', async () => {
      const health = await performHealthCheck(false);

      expect(health).toEqual({
        status: 'healthy',
        timestamp: expect.any(String)
      });
    });

    it('should return detailed health check when requested', async () => {
      vi.mocked(prisma.shop.count).mockResolvedValue(3);
      vi.mocked(testCrypto).mockResolvedValue(true);

      const health = await performHealthCheck(true);

      expect(health).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        database: {
          connected: true,
          shops: 3,
          latency: expect.any(Number)
        },
        crypto: {
          working: true
        },
        version: expect.any(String)
      });
    });

    it('should return unhealthy status when subsystems fail', async () => {
      vi.mocked(prisma.shop.count).mockRejectedValue(new Error('DB error'));
      vi.mocked(testCrypto).mockResolvedValue(false);

      const health = await performHealthCheck(true);

      expect(health.status).toBe('unhealthy');
      expect(health.error).toContain('database connection failed');
      expect(health.error).toContain('crypto system failed');
    });
  });

  describe('checkReadiness', () => {
    it('should return ready status when all systems healthy', async () => {
      vi.mocked(prisma.shop.count).mockResolvedValue(2);
      vi.mocked(testCrypto).mockResolvedValue(true);

      const readiness = await checkReadiness();

      expect(readiness.status).toBe('healthy');
      expect(readiness.database?.connected).toBe(true);
      expect(readiness.crypto?.working).toBe(true);
      expect(readiness.error).toBeUndefined();
    });

    it('should return not ready when systems fail', async () => {
      vi.mocked(prisma.shop.count).mockRejectedValue(new Error('DB error'));
      vi.mocked(testCrypto).mockResolvedValue(false);

      const readiness = await checkReadiness();

      expect(readiness.status).toBe('unhealthy');
      expect(readiness.error).toBe('Application not ready');
    });
  });

  describe('logRequest', () => {
    it('should log structured request data', () => {
      const request = new Request('https://example.com/api/test?param=value', {
        method: 'POST',
        headers: {
          'user-agent': 'test-agent',
          'x-request-id': 'test-123'
        }
      });

      logRequest(request, { shop: 'test.myshopify.com' }, { 
        duration: 100, 
        statusCode: 200 
      });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"requestId":"test-123"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"method":"POST"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"shopDomain":"test.myshopify.com"')
      );
    });

    it('should generate request ID if not present', () => {
      const request = new Request('https://example.com/api/test');

      logRequest(request);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"requestId":"req_')
      );
    });
  });

  describe('getApplicationMetrics', () => {
    it('should return application metrics', () => {
      const metrics = getApplicationMetrics();

      expect(metrics).toEqual({
        uptime: expect.any(Number),
        memory: expect.any(Object),
        nodeVersion: expect.any(String),
        platform: expect.any(String),
        arch: expect.any(String),
        pid: expect.any(Number)
      });
    });
  });

  describe('isProduction', () => {
    it('should return true in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      expect(isProduction()).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it('should return false in non-production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      expect(isProduction()).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('isMonitoringEnabled', () => {
    it('should return true when monitoring is enabled', () => {
      const originalEnv = process.env.MONITORING_ENABLED;
      delete process.env.MONITORING_ENABLED;

      expect(isMonitoringEnabled()).toBe(true);

      process.env.MONITORING_ENABLED = originalEnv;
    });

    it('should return false when monitoring is disabled', () => {
      const originalEnv = process.env.MONITORING_ENABLED;
      process.env.MONITORING_ENABLED = 'false';

      expect(isMonitoringEnabled()).toBe(false);

      process.env.MONITORING_ENABLED = originalEnv;
    });
  });
});