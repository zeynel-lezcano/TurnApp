/**
 * Tests for healthz endpoint
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loader } from '../../app/routes/healthz';

// Mock dependencies
vi.mock('../../app/lib/monitoring.server', () => ({
  performHealthCheck: vi.fn(),
  logRequest: vi.fn()
}));

vi.mock('../../app/lib/validation.server', () => ({
  HealthResponseSchema: {
    parse: vi.fn((data) => data)
  }
}));

import * as mockMonitoring from '../../app/lib/monitoring.server';

describe('/healthz endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return healthy status', async () => {
    const mockHealth = {
      status: 'healthy' as const,
      timestamp: '2024-01-01T00:00:00.000Z'
    };

    vi.mocked(mockMonitoring.performHealthCheck).mockResolvedValue(mockHealth);

    const request = new Request('https://example.com/healthz');
    const response = await loader({ request, params: {}, context: {} });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toEqual(mockHealth);
    
    expect(mockMonitoring.performHealthCheck).toHaveBeenCalledWith(false);
    expect(mockMonitoring.logRequest).toHaveBeenCalledWith(request);
  });

  it('should return unhealthy status with 503', async () => {
    const mockHealth = {
      status: 'unhealthy' as const,
      timestamp: '2024-01-01T00:00:00.000Z',
      error: 'Database connection failed'
    };

    vi.mocked(mockMonitoring.performHealthCheck).mockResolvedValue(mockHealth);

    const request = new Request('https://example.com/healthz');
    const response = await loader({ request, params: {}, context: {} });

    expect(response.status).toBe(503);
    
    const data = await response.json();
    expect(data).toEqual(mockHealth);
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(mockMonitoring.performHealthCheck).mockRejectedValue(new Error('Health check failed'));

    const request = new Request('https://example.com/healthz');
    const response = await loader({ request, params: {}, context: {} });

    expect(response.status).toBe(503);
    
    const data = await response.json();
    expect(data.status).toBe('unhealthy');
    expect(data.error).toBe('Health check failed');
    
    expect(console.error).toHaveBeenCalledWith('Health check endpoint error:', expect.any(Error));
  });

  it('should include cache headers', async () => {
    const mockHealth = {
      status: 'healthy' as const,
      timestamp: '2024-01-01T00:00:00.000Z'
    };

    vi.mocked(mockMonitoring.performHealthCheck).mockResolvedValue(mockHealth);

    const request = new Request('https://example.com/healthz');
    const response = await loader({ request, params: {}, context: {} });

    expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
  });
});