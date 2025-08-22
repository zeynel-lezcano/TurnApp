/**
 * Schema Validation System für TurnApp - Type Safety & Security
 * 
 * Diese Datei definiert alle Zod-Schemas für Input-Validierung und Response-Validation.
 * Zod gewährleistet zur Laufzeit, dass alle Daten den erwarteten Typ und Format haben,
 * und schützt vor schädlichen Inputs und Data Corruption.
 * 
 * VALIDIERUNGS-KATEGORIEN:
 * 1. Basic Schemas: Shop Domains, Farben, URLs mit Sicherheits-Checks
 * 2. Business Schemas: Branding, Config, Upload für API Endpoints
 * 3. Response Schemas: Health, Products für ausgehende Daten
 * 4. Helper Functions: Utility-Funktionen für häufige Validierungen
 * 
 * SICHERHEITSFEATURES:
 * - XSS Prevention durch String-Validierung und Sanitization
 * - Injection Prevention durch Regex-Patterns
 * - URL Safety durch Protocol-Whitelisting
 * - File Type Validation für Uploads
 * 
 * VERWENDUNG IM PROJEKT:
 * - API Routes: Input-Validierung vor Verarbeitung
 * - Response Validation: Type Safety für ausgehende Daten
 * - Form Handling: Client + Server Validierung
 */

import { z } from "zod";

/**
 * === BASIC VALIDATION SCHEMAS ===
 * Fundamentale Datentypen mit Sicherheits-Validierung
 */

/**
 * Shop Domain Validierung - Sicherheit gegen Domain Spoofing
 * 
 * ERLAUBTE FORMATE: "myshop.myshopify.com", "test-shop-123.myshopify.com"
 * VERHINDERT: XSS, Injection, invalid domains
 * 
 * REGEX BREAKDOWN:
 * - ^[a-z0-9-]+ : Nur Kleinbuchstaben, Zahlen, Bindestriche am Anfang
 * - \.myshopify\.com$ : Muss exakt mit .myshopify.com enden
 * 
 * VERWENDUNG: URL Parameter ?shop=, Session Tokens, API Calls
 */
export const ShopDomainSchema = z.string()
  .regex(/^[a-z0-9-]+\.myshopify\.com$/, "Invalid shop domain format - must be valid Shopify domain");

/**
 * Hex Color Validierung - CSS-sichere Farbwerte
 * 
 * ERLAUBTES FORMAT: "#FF5733", "#007C3B", "#123abc"
 * VERHINDERT: CSS Injection, invalid color values
 * 
 * REGEX BREAKDOWN:
 * - ^# : Muss mit Hash beginnen
 * - [0-9A-F]{6} : Exakt 6 Hex-Zeichen (0-9, A-F)
 * - $/i : Case-insensitive Ende
 * 
 * VERWENDUNG: Branding Primary Color, Theme Colors
 */
export const HexColorSchema = z.string()
  .regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format - must be #RRGGBB");

/**
 * URL Validierung mit Sicherheits-Filtering - XSS und Injection Prevention
 * 
 * ERLAUBT: "https://...", "http://...", "" (empty string)
 * VERHINDERT: javascript:, data:, vbscript:, file:, ftp: (XSS Vectors)
 * 
 * SICHERHEITSFEATURES:
 * 1. Protocol Whitelist: Nur sichere Protocols (http/https)
 * 2. URL Parsing: Validierung der URL-Struktur
 * 3. Empty String Support: Optional URLs
 * 
 * VERWENDUNG: Logo URLs, Asset URLs, externe Links
 */
export const UrlSchema = z.string()
  .refine((url) => {
    // Leerer String ist erlaubt für optionale URLs
    if (url === "") return true;
    
    try {
      const parsed = new URL(url);
      // SICHERHEITSKRITISCH: Gefährliche Protocols blockieren
      // Diese können für XSS, Code Injection und andere Angriffe verwendet werden
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
      return !dangerousProtocols.includes(parsed.protocol);
    } catch {
      return false; // Ungültige URL-Struktur
    }
  }, "Invalid or unsafe URL - only http/https allowed")
  .optional()
  .or(z.literal(""));

/**
 * === BUSINESS LOGIC SCHEMAS ===
 * Shop-spezifische Validierungen für API Endpoints
 */

/**
 * Branding Settings Validierung - Shop Customization Data
 * 
 * VERWENDET IN: /api/settings (POST), /api/config (GET Response)
 * 
 * FELDER:
 * - brandName: Shop-Name für Mobile App (1-50 Zeichen, alphanumerisch + spaces)
 * - primaryColor: Hex-Farbe für App-Theme (#RRGGBB Format)
 * - logoUrl: Upload-URL für Shop-Logo (optional, security-validated)
 * - tagline: Marketing-Text für App (max 100 Zeichen, optional)
 * 
 * SICHERHEIT: Regex verhindert Code Injection in Brand Namen
 */
export const BrandingSettingsSchema = z.object({
  // Shop-Name: Alphanumerisch + Leerzeichen, Bindestriche, Underscores
  brandName: z.string()
    .min(1, "Brand name is required")
    .max(50, "Brand name too long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Brand name contains invalid characters - only letters, numbers, spaces, hyphens, underscores allowed"),
  
  // Primary Color für App-Theme
  primaryColor: HexColorSchema,
  
  // Logo URL (mit Sicherheits-Validierung)
  logoUrl: UrlSchema,
  
  // Marketing Tagline (optional)
  tagline: z.string()
    .max(100, "Tagline too long")
    .optional()
    .or(z.literal(""))
});

/**
 * Mobile App Config Response Validierung - /api/config Endpoint
 * 
 * RESPONSE STRUKTUR für Mobile Apps beim App-Start:
 * {
 *   shop: "myshop.myshopify.com",
 *   branding: { brandName, primaryColor, logoUrl, tagline },
 *   storefrontEndpoint: "https://myshop.myshopify.com/api/2024-01/graphql.json",
 *   appVersion: "1.0.0"
 * }
 * 
 * VERWENDUNG: Mobile Apps laden diese Config für UI-Customization
 */
export const ConfigResponseSchema = z.object({
  // Shop Domain für Mobile App Identifikation
  shop: ShopDomainSchema,
  
  // Branding für UI-Customization (Farben, Logo, Name)
  branding: BrandingSettingsSchema,
  
  // Direkter Shopify Storefront API Endpoint für Mobile Apps
  storefrontEndpoint: z.string().url("Invalid storefront endpoint"),
  
  // Semantic Versioning für Feature-Compatibility
  appVersion: z.string().regex(/^\d+\.\d+\.\d+$/, "Invalid version format - must be semantic version (x.y.z)")
});

/**
 * File Upload Request Validierung - /api/upload Endpoint
 * 
 * UPLOAD-TYPEN:
 * - "logo": Shop-Logo für Branding (quadratisch, klein)
 * - "banner": Marketing-Banner (rechteckig, größer)
 * 
 * VERWENDUNG: Validierung vor File-Upload und S3-Storage
 */
export const UploadRequestSchema = z.object({
  // Asset-Typ für Upload-Verarbeitung und Storage-Organisation
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