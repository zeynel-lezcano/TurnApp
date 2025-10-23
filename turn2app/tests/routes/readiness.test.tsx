/**
 * Tests for readiness endpoint
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loader } from '../../app/routes/readiness';

// Mock dependencies
vi.mock('../../app/lib/monitoring.server', () => ({
  checkReadiness: vi.fn(),
  logRequest: vi.fn()
}));

vi.mock('../../app/lib/validation.server', () => ({
  HealthResponseSchema: {
    parse: vi.fn((data) => data)
  }
}));

import * as mockMonitoring from '../../app/lib/monitoring.server';

describe('/readiness endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return ready status when all systems healthy', async () => {
    const mockReadiness = {
      status: 'healthy' as const,
      timestamp: '2024-01-01T00:00:00.000Z',
      database: { connected: true, shops: 5, latency: 10 },
      crypto: { working: true }
    };

    vi.mocked(mockMonitoring.checkReadiness).mockResolvedValue(mockReadiness);

    const request = new Request('https://example.com/readiness');
    const response = await loader({ request, params: {}, context: {} });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toEqual(mockReadiness);
    
    expect(mockMonitoring.checkReadiness).toHaveBeenCalled();
    expect(mockMonitoring.logRequest).toHaveBeenCalledWith(request);
  });

  it('should return not ready status with 503', async () => {
    const mockReadiness = {
      status: 'unhealthy' as const,
      timestamp: '2024-01-01T00:00:00.000Z',
      database: { connected: false, shops: 0 },
      crypto: { working: true },
      error: 'Application not ready'
    };

    vi.mocked(mockMonitoring.checkReadiness).mockResolvedValue(mockReadiness);

    const request = new Request('https://example.com/readiness');
    const response = await loader({ request, params: {}, context: {} });

    expect(response.status).toBe(503);
    
    const data = await response.json();
    expect(data).toEqual(mockReadiness);
  });

  it('should handle readiness check errors', async () => {
    vi.mocked(mockMonitoring.checkReadiness).mockRejectedValue(new Error('Readiness check failed'));

    const request = new Request('https://example.com/readiness');
    const response = await loader({ request, params: {}, context: {} });

    expect(response.status).toBe(503);
    
    const data = await response.json();
    expect(data.status).toBe('unhealthy');
    expect(data.error).toBe('Readiness check failed');
    
    expect(console.error).toHaveBeenCalledWith('Readiness check endpoint error:', expect.any(Error));
  });

  it('should log request duration and status', async () => {
    const mockReadiness = {
      status: 'healthy' as const,
      timestamp: '2024-01-01T00:00:00.000Z',
      database: { connected: true, shops: 2, latency: 5 },
      crypto: { working: true }
    };

    vi.mocked(mockMonitoring.checkReadiness).mockResolvedValue(mockReadiness);

    const request = new Request('https://example.com/readiness');
    await loader({ request, params: {}, context: {} });

    // Verify logRequest was called twice: once at start, once with duration/status
    expect(mockMonitoring.logRequest).toHaveBeenCalledTimes(2);
    expect(mockMonitoring.logRequest).toHaveBeenLastCalledWith(
      request,
      undefined,
      expect.objectContaining({
        duration: expect.any(Number),
        statusCode: 200
      })
    );
  });

  it('should include proper cache headers', async () => {
    const mockReadiness = {
      status: 'healthy' as const,
      timestamp: '2024-01-01T00:00:00.000Z',
      database: { connected: true, shops: 1, latency: 15 },
      crypto: { working: true }
    };

    vi.mocked(mockMonitoring.checkReadiness).mockResolvedValue(mockReadiness);

    const request = new Request('https://example.com/readiness');
    const response = await loader({ request, params: {}, context: {} });

    expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
  });
});