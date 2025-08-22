import { z } from "zod";

// Basic validation schemas
export const ShopDomainSchema = z.string()
  .regex(/^[a-z0-9-]+\.myshopify\.com$/, "Invalid shop domain format");

export const HexColorSchema = z.string()
  .regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format");

export const UrlSchema = z.string()
  .refine((url) => {
    if (url === "") return true; // Allow empty string
    try {
      const parsed = new URL(url);
      // Reject dangerous protocols
      return !['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'].includes(parsed.protocol);
    } catch {
      return false; // Invalid URL
    }
  }, "Invalid or unsafe URL")
  .optional()
  .or(z.literal(""));

// Branding settings schema
export const BrandingSettingsSchema = z.object({
  brandName: z.string()
    .min(1, "Brand name is required")
    .max(50, "Brand name too long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Brand name contains invalid characters"),
  primaryColor: HexColorSchema,
  logoUrl: UrlSchema,
  tagline: z.string()
    .max(100, "Tagline too long")
    .optional()
    .or(z.literal(""))
});

// Config response schema
export const ConfigResponseSchema = z.object({
  shop: ShopDomainSchema,
  branding: BrandingSettingsSchema,
  storefrontEndpoint: z.string().url("Invalid storefront endpoint"),
  appVersion: z.string().regex(/^\d+\.\d+\.\d+$/, "Invalid version format")
});

// Upload request schema
export const UploadRequestSchema = z.object({
  kind: z.enum(["logo", "banner"], { 
    errorMap: () => ({ message: "Asset kind must be 'logo' or 'banner'" })
  })
});

// Upload response schema
export const UploadResponseSchema = z.object({
  success: z.boolean(),
  asset: z.object({
    id: z.string().uuid(),
    kind: z.enum(["logo", "banner"]),
    url: z.string().url(),
    filename: z.string()
  }).optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.string()).optional()
});

// Settings update request schema
export const SettingsUpdateSchema = z.object({
  brandName: z.string()
    .min(1, "Brand name is required")
    .max(50, "Brand name too long")
    .optional(),
  primaryColor: HexColorSchema.optional(),
  logoUrl: UrlSchema.optional(),
  tagline: z.string()
    .max(100, "Tagline too long")
    .optional()
});

// Health check response schema
export const HealthResponseSchema = z.object({
  status: z.enum(["healthy", "unhealthy"]),
  timestamp: z.string(),
  database: z.object({
    connected: z.boolean(),
    shops: z.number().int().nonnegative(),
    latency: z.number().optional()
  }).optional(),
  crypto: z.object({
    working: z.boolean()
  }).optional(),
  version: z.string().optional(),
  error: z.string().optional()
});

// Request validation helpers
export const validateShopParam = (shop: string | null): string => {
  if (!shop) {
    throw new Error("Shop parameter is required");
  }
  
  const result = ShopDomainSchema.safeParse(shop);
  if (!result.success) {
    throw new Error(`Invalid shop domain: ${result.error.errors[0].message}`);
  }
  
  return result.data;
};

export const validateBrandingData = (data: unknown) => {
  try {
    return BrandingSettingsSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      throw new Error(`Validation failed: ${fieldErrors}`);
    }
    throw error;
  }
};

export const createErrorResponse = (message: string, code?: string, details?: Record<string, string>) => {
  return {
    error: message,
    code,
    details
  };
};

// Product API schemas
export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  images: z.array(z.object({
    url: z.string().url(),
    altText: z.string().nullable()
  })),
  price: z.object({
    amount: z.string(),
    currency: z.string().length(3) // ISO currency code
  }),
  variants: z.array(z.object({
    id: z.string(),
    title: z.string(),
    price: z.object({
      amount: z.string(),
      currencyCode: z.string().length(3)
    }),
    compareAtPrice: z.object({
      amount: z.string(),
      currencyCode: z.string().length(3)
    }).nullable(),
    available: z.boolean()
  }))
});

export const ProductsResponseSchema = z.object({
  products: z.array(ProductSchema),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean()
  }),
  shop: ShopDomainSchema,
  total: z.number().int().nonnegative()
});

// Admin API schemas
export const AdminProductVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string(),
  price: z.string(),
  compareAtPrice: z.string().nullable(),
  inventoryQuantity: z.number().int(),
  availableForSale: z.boolean()
});

export const AdminProductImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  altText: z.string().nullable(),
  width: z.number().int().positive(),
  height: z.number().int().positive()
});

export const AdminProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'DRAFT']),
  productType: z.string(),
  vendor: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  variants: z.object({
    edges: z.array(z.object({
      node: AdminProductVariantSchema
    }))
  }),
  images: z.object({
    edges: z.array(z.object({
      node: AdminProductImageSchema
    }))
  })
});

export const ShopInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string(),
  email: z.string().email(),
  myshopifyDomain: z.string().regex(/^[a-z0-9-]+\.myshopify\.com$/),
  plan: z.object({
    displayName: z.string(),
    partnerDevelopment: z.boolean()
  }),
  primaryLocale: z.string(),
  currencyCode: z.string().length(3), // ISO currency code
  weightUnit: z.enum(['POUNDS', 'OUNCES', 'KILOGRAMS', 'GRAMS']),
  timezone: z.string()
});

export const AdminProductsResponseSchema = z.object({
  products: z.array(AdminProductSchema),
  hasNextPage: z.boolean(),
  endCursor: z.string().optional(),
  shop: ShopDomainSchema,
  total: z.number().int().nonnegative()
});

// Shop validation response schema
export const ShopValidationResponseSchema = z.object({
  valid: z.boolean(),
  shop: ShopInfoSchema.optional(),
  error: z.string().optional()
});

// Type exports
export type BrandingSettings = z.infer<typeof BrandingSettingsSchema>;
export type ConfigResponse = z.infer<typeof ConfigResponseSchema>;
export type UploadRequest = z.infer<typeof UploadRequestSchema>;
export type UploadResponse = z.infer<typeof UploadResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SettingsUpdate = z.infer<typeof SettingsUpdateSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;
export type AdminProduct = z.infer<typeof AdminProductSchema>;
export type AdminProductsResponse = z.infer<typeof AdminProductsResponseSchema>;
export type ShopInfo = z.infer<typeof ShopInfoSchema>;
export type ShopValidationResponse = z.infer<typeof ShopValidationResponseSchema>;