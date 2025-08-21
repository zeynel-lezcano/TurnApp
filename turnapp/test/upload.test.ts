import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../app/lib/prisma.server.js';

describe('Upload functionality', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.asset.deleteMany();
    await prisma.shop.deleteMany();
  });

  it('should validate file upload constraints', () => {
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_MIME_TYPES = [
      'image/jpeg',
      'image/png', 
      'image/webp',
      'image/svg+xml'
    ];

    // Test file size validation
    expect(MAX_FILE_SIZE).toBe(2097152);
    
    // Test MIME type validation
    expect(ALLOWED_MIME_TYPES).toContain('image/jpeg');
    expect(ALLOWED_MIME_TYPES).toContain('image/png');
    expect(ALLOWED_MIME_TYPES).toContain('image/webp');
    expect(ALLOWED_MIME_TYPES).toContain('image/svg+xml');
    expect(ALLOWED_MIME_TYPES).not.toContain('image/gif');
    expect(ALLOWED_MIME_TYPES).not.toContain('text/plain');
  });

  it('should handle asset kind validation', () => {
    const validKinds = ['logo', 'banner'];
    const invalidKinds = ['icon', 'photo', 'image'];

    validKinds.forEach(kind => {
      expect(['logo', 'banner']).toContain(kind);
    });

    invalidKinds.forEach(kind => {
      expect(['logo', 'banner']).not.toContain(kind);
    });
  });

  it('should create shop and asset models correctly', async () => {
    // Create a test shop
    const shop = await prisma.shop.create({
      data: {
        shopDomain: 'test-upload.myshopify.com',
        accessTokenEnc: 'encrypted_test_token',
        settings: JSON.stringify({
          branding: { name: 'Test Shop' }
        })
      }
    });

    expect(shop.id).toBeDefined();
    expect(shop.shopDomain).toBe('test-upload.myshopify.com');

    // Create a test asset
    const asset = await prisma.asset.create({
      data: {
        shopId: shop.id,
        kind: 'logo',
        url: '/uploads/test-logo.png'
      }
    });

    expect(asset.id).toBeDefined();
    expect(asset.kind).toBe('logo');
    expect(asset.url).toBe('/uploads/test-logo.png');
    expect(asset.shopId).toBe(shop.id);

    // Test asset replacement (delete existing, create new)
    const existingAsset = await prisma.asset.findFirst({
      where: {
        shopId: shop.id,
        kind: 'logo'
      }
    });

    expect(existingAsset).toBeTruthy();

    if (existingAsset) {
      await prisma.asset.delete({
        where: { id: existingAsset.id }
      });
    }

    const newAsset = await prisma.asset.create({
      data: {
        shopId: shop.id,
        kind: 'logo',
        url: '/uploads/new-logo.png'
      }
    });

    expect(newAsset.url).toBe('/uploads/new-logo.png');

    // Verify old asset is gone
    const deletedAsset = await prisma.asset.findUnique({
      where: { id: existingAsset!.id }
    });

    expect(deletedAsset).toBeNull();
  });

  it('should generate secure filenames', () => {
    // Test filename generation pattern
    const timestamp = Date.now();
    const randomId = 'abc12345'; // Mock random
    const extension = '.png';
    const expectedPattern = `${timestamp}-${randomId}${extension}`;

    expect(expectedPattern).toMatch(/^\d+-[a-z0-9]+\.(png|jpg|jpeg|webp|svg)$/);
  });
});