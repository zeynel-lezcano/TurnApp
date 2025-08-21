import { describe, it, expect } from 'vitest';
import {
  BrandingSettingsSchema,
  ConfigResponseSchema,
  UploadRequestSchema,
  UploadResponseSchema,
  ErrorResponseSchema,
  HealthResponseSchema,
  validateShopParam,
  validateBrandingData,
  createErrorResponse
} from '../app/lib/validation.server.js';

describe('Validation Schemas', () => {
  describe('BrandingSettingsSchema', () => {
    it('should validate correct branding data', () => {
      const validData = {
        brandName: 'Test Shop',
        primaryColor: '#FF5733',
        logoUrl: 'https://example.com/logo.png',
        tagline: 'Your trusted shopping partner'
      };

      const result = BrandingSettingsSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid brand name', () => {
      const invalidData = {
        brandName: '', // Empty
        primaryColor: '#FF5733',
        logoUrl: '',
        tagline: ''
      };

      expect(() => BrandingSettingsSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid color format', () => {
      const invalidData = {
        brandName: 'Test Shop',
        primaryColor: 'FF5733', // Missing #
        logoUrl: '',
        tagline: ''
      };

      expect(() => BrandingSettingsSchema.parse(invalidData)).toThrow();
    });

    it('should reject brand name with invalid characters', () => {
      const invalidData = {
        brandName: 'Test<>Shop!',
        primaryColor: '#FF5733',
        logoUrl: '',
        tagline: ''
      };

      expect(() => BrandingSettingsSchema.parse(invalidData)).toThrow();
    });

    it('should accept empty optional fields', () => {
      const validData = {
        brandName: 'Test Shop',
        primaryColor: '#FF5733',
        logoUrl: '',
        tagline: ''
      };

      const result = BrandingSettingsSchema.parse(validData);
      expect(result).toEqual(validData);
    });
  });

  describe('ConfigResponseSchema', () => {
    it('should validate correct config response', () => {
      const validResponse = {
        shop: 'test-shop.myshopify.com',
        branding: {
          brandName: 'Test Shop',
          primaryColor: '#FF5733',
          logoUrl: 'https://example.com/logo.png',
          tagline: 'Test tagline'
        },
        storefrontEndpoint: 'https://test-shop.myshopify.com/api/2024-01/graphql.json',
        appVersion: '1.0.0'
      };

      const result = ConfigResponseSchema.parse(validResponse);
      expect(result).toEqual(validResponse);
    });

    it('should reject invalid shop domain', () => {
      const invalidResponse = {
        shop: 'invalid-domain.com',
        branding: {
          brandName: 'Test Shop',
          primaryColor: '#FF5733',
          logoUrl: '',
          tagline: ''
        },
        storefrontEndpoint: 'https://example.com/api',
        appVersion: '1.0.0'
      };

      expect(() => ConfigResponseSchema.parse(invalidResponse)).toThrow();
    });

    it('should reject invalid version format', () => {
      const invalidResponse = {
        shop: 'test-shop.myshopify.com',
        branding: {
          brandName: 'Test Shop',
          primaryColor: '#FF5733',
          logoUrl: '',
          tagline: ''
        },
        storefrontEndpoint: 'https://example.com/api',
        appVersion: 'v1.0' // Invalid format
      };

      expect(() => ConfigResponseSchema.parse(invalidResponse)).toThrow();
    });
  });

  describe('UploadRequestSchema', () => {
    it('should validate correct upload request', () => {
      const validRequest = { kind: 'logo' };
      const result = UploadRequestSchema.parse(validRequest);
      expect(result).toEqual(validRequest);
    });

    it('should validate banner kind', () => {
      const validRequest = { kind: 'banner' };
      const result = UploadRequestSchema.parse(validRequest);
      expect(result).toEqual(validRequest);
    });

    it('should reject invalid kind', () => {
      const invalidRequest = { kind: 'icon' };
      expect(() => UploadRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('UploadResponseSchema', () => {
    it('should validate successful upload response', () => {
      const validResponse = {
        success: true,
        asset: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          kind: 'logo' as const,
          url: 'https://example.com/uploads/logo.png',
          filename: 'logo.png'
        },
        message: 'Upload successful'
      };

      const result = UploadResponseSchema.parse(validResponse);
      expect(result).toEqual(validResponse);
    });

    it('should validate error upload response', () => {
      const validResponse = {
        success: false,
        error: 'Upload failed'
      };

      const result = UploadResponseSchema.parse(validResponse);
      expect(result).toEqual(validResponse);
    });
  });

  describe('HealthResponseSchema', () => {
    it('should validate healthy response', () => {
      const healthyResponse = {
        status: 'healthy' as const,
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          shops: 5
        },
        crypto: {
          working: true
        },
        version: '1.0.0'
      };

      const result = HealthResponseSchema.parse(healthyResponse);
      expect(result).toEqual(healthyResponse);
    });

    it('should validate unhealthy response', () => {
      const unhealthyResponse = {
        status: 'unhealthy' as const,
        timestamp: new Date().toISOString(),
        error: 'Database connection failed'
      };

      const result = HealthResponseSchema.parse(unhealthyResponse);
      expect(result).toEqual(unhealthyResponse);
    });

    it('should reject invalid timestamp format', () => {
      const invalidResponse = {
        status: 'healthy' as const,
        timestamp: 'invalid-date'
      };

      expect(() => HealthResponseSchema.parse(invalidResponse)).toThrow();
    });
  });

  describe('ErrorResponseSchema', () => {
    it('should validate basic error response', () => {
      const errorResponse = {
        error: 'Something went wrong'
      };

      const result = ErrorResponseSchema.parse(errorResponse);
      expect(result).toEqual(errorResponse);
    });

    it('should validate error response with code', () => {
      const errorResponse = {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR'
      };

      const result = ErrorResponseSchema.parse(errorResponse);
      expect(result).toEqual(errorResponse);
    });

    it('should validate error response with details', () => {
      const errorResponse = {
        error: 'Multiple validation errors',
        code: 'VALIDATION_ERROR',
        details: {
          brandName: 'Brand name is required',
          primaryColor: 'Invalid color format'
        }
      };

      const result = ErrorResponseSchema.parse(errorResponse);
      expect(result).toEqual(errorResponse);
    });
  });
});

describe('Validation Helper Functions', () => {
  describe('validateShopParam', () => {
    it('should validate correct shop domain', () => {
      const result = validateShopParam('test-shop.myshopify.com');
      expect(result).toBe('test-shop.myshopify.com');
    });

    it('should reject null shop parameter', () => {
      expect(() => validateShopParam(null)).toThrow('Shop parameter is required');
    });

    it('should reject invalid shop domain format', () => {
      expect(() => validateShopParam('invalid-domain.com')).toThrow();
    });

    it('should validate shop with numbers and hyphens', () => {
      const result = validateShopParam('test-shop-123.myshopify.com');
      expect(result).toBe('test-shop-123.myshopify.com');
    });
  });

  describe('validateBrandingData', () => {
    it('should validate correct branding data', () => {
      const data = {
        brandName: 'Test Shop',
        primaryColor: '#FF5733',
        logoUrl: 'https://example.com/logo.png',
        tagline: 'Test tagline'
      };

      const result = validateBrandingData(data);
      expect(result).toEqual(data);
    });

    it('should throw readable error for validation failures', () => {
      const invalidData = {
        brandName: '',
        primaryColor: 'invalid-color'
      };

      expect(() => validateBrandingData(invalidData)).toThrow('Validation failed:');
    });
  });

  describe('createErrorResponse', () => {
    it('should create basic error response', () => {
      const result = createErrorResponse('Something went wrong');
      expect(result).toEqual({
        error: 'Something went wrong',
        code: undefined,
        details: undefined
      });
    });

    it('should create error response with code', () => {
      const result = createErrorResponse('Validation failed', 'VALIDATION_ERROR');
      expect(result).toEqual({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: undefined
      });
    });

    it('should create error response with details', () => {
      const details = { field: 'error message' };
      const result = createErrorResponse('Multiple errors', 'VALIDATION_ERROR', details);
      expect(result).toEqual({
        error: 'Multiple errors',
        code: 'VALIDATION_ERROR',
        details
      });
    });
  });
});

describe('Edge Cases and Security', () => {
  it('should handle extremely long brand names', () => {
    const longName = 'A'.repeat(100);
    const data = {
      brandName: longName,
      primaryColor: '#FF5733',
      logoUrl: '',
      tagline: ''
    };

    expect(() => BrandingSettingsSchema.parse(data)).toThrow();
  });

  it('should handle extremely long taglines', () => {
    const longTagline = 'A'.repeat(200);
    const data = {
      brandName: 'Test Shop',
      primaryColor: '#FF5733',
      logoUrl: '',
      tagline: longTagline
    };

    expect(() => BrandingSettingsSchema.parse(data)).toThrow();
  });

  it('should reject potentially malicious URLs', () => {
    const maliciousData = {
      brandName: 'Test Shop',
      primaryColor: '#FF5733',
      logoUrl: 'javascript:alert("xss")', // This should fail URL validation
      tagline: ''
    };

    expect(() => BrandingSettingsSchema.parse(maliciousData)).toThrow();
  });

  it('should handle allowed special characters in brand names', () => {
    // Based on regex /^[a-zA-Z0-9\s\-_]+$/, only alphanumeric, spaces, hyphens, underscores are allowed
    const validSpecialChars = {
      brandName: 'Test-Shop_123 Store',
      primaryColor: '#FF5733',
      logoUrl: '',
      tagline: ''
    };

    const result = BrandingSettingsSchema.parse(validSpecialChars);
    expect(result.brandName).toBe('Test-Shop_123 Store');
  });

  it('should reject disallowed special characters in brand names', () => {
    const invalidSpecialChars = {
      brandName: 'Test Shop & Co!',
      primaryColor: '#FF5733',
      logoUrl: '',
      tagline: ''
    };

    expect(() => BrandingSettingsSchema.parse(invalidSpecialChars)).toThrow();
  });

  it('should validate case-insensitive hex colors', () => {
    const lowerCaseColor = {
      brandName: 'Test Shop',
      primaryColor: '#ff5733',
      logoUrl: '',
      tagline: ''
    };

    const result = BrandingSettingsSchema.parse(lowerCaseColor);
    expect(result.primaryColor).toBe('#ff5733');
  });
});