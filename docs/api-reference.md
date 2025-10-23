API Reference - turn2app Shopify App

## Overview

turn2app provides RESTful API endpoints für mobile app integration und embedded admin functionality. Alle endpoints sind mandantenspezifisch und Shop-isoliert.

**Base URL**: `https://your-app-domain.com`
**API Version**: 1.0
**Authentication**: Session Token (embedded admin) oder Shop Parameter (mobile apps)

## Authentication

### Session Token (Embedded Admin)
```http
Authorization: Bearer <session_token>
```

### Shop Parameter (Mobile Apps)
```http
GET /api/endpoint?shop=myshop.myshopify.com
```

## Endpoints

### GET /api/config
Lädt Shop-spezifische Konfiguration für mobile apps.

**Authentication**: Session Token oder Shop Parameter
**Cache**: 5 Minuten TTL
**Rate Limit**: 100 requests/minute pro Shop

#### Request
```http
GET /api/config?shop=myshop.myshopify.com
```

#### Response (200 OK)
```json
{
  "shop": "myshop.myshopify.com",
  "branding": {
    "brandName": "Mein Shop",
    "primaryColor": "#007BFF",
    "logoUrl": "https://cdn.shopify.com/s/files/1/logo.png",
    "tagline": "Best products ever"
  },
  "storefrontEndpoint": "https://myshop.myshopify.com/api/2023-10/graphql.json",
  "appVersion": "1.0.0"
}
```

#### Error Responses
```json
// 400 Bad Request
{
  "error": "Missing shop parameter",
  "code": "MISSING_PARAMETER",
  "timestamp": "2025-08-22T10:30:00Z"
}

// 404 Not Found
{
  "error": "Shop not found or not installed",
  "code": "SHOP_NOT_FOUND",
  "timestamp": "2025-08-22T10:30:00Z"
}
```

---

### GET /api/products
Lädt Produktliste via Shopify Storefront API mit caching.

**Authentication**: Session Token oder Shop Parameter
**Cache**: 60 Sekunden TTL
**Rate Limit**: 50 requests/minute pro Shop

#### Request
```http
GET /api/products?shop=myshop.myshopify.com&first=10&after=cursor123
```

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `shop` | string | yes* | - | Shop domain (required für mobile apps) |
| `first` | integer | no | 10 | Number of products (1-50) |
| `after` | string | no | - | Pagination cursor |

*Required nur bei mobile app access ohne session token

#### Response (200 OK)
```json
{
  "products": [
    {
      "id": "gid://shopify/Product/123",
      "title": "Awesome T-Shirt",
      "description": "High quality cotton t-shirt",
      "handle": "awesome-t-shirt",
      "images": [
        {
          "url": "https://cdn.shopify.com/s/files/1/image1.jpg",
          "altText": "Front view"
        }
      ],
      "priceRange": {
        "minVariantPrice": {
          "amount": "29.99",
          "currencyCode": "EUR"
        },
        "maxVariantPrice": {
          "amount": "29.99",
          "currencyCode": "EUR"
        }
      },
      "availableForSale": true,
      "checkoutUrl": "https://myshop.myshopify.com/products/awesome-t-shirt"
    }
  ],
  "pageInfo": {
    "hasNextPage": true,
    "hasPreviousPage": false,
    "endCursor": "cursor456"
  },
  "totalCount": 150
}
```

#### Error Responses
```json
// 400 Bad Request - Invalid Parameters
{
  "error": "Invalid \"first\" parameter. Must be between 1 and 50.",
  "code": "INVALID_PARAMETER",
  "timestamp": "2025-08-22T10:30:00Z"
}

// 429 Too Many Requests
{
  "error": "Rate limit exceeded. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2025-08-22T10:30:00Z"
}
```

---

### POST /api/settings
Aktualisiert Shop Branding-Einstellungen.

**Authentication**: Session Token (Admin nur)
**Rate Limit**: 20 requests/minute pro Shop

#### Request
```http
POST /api/settings
Content-Type: multipart/form-data
Authorization: Bearer <session_token>

brandName=Mein Shop&primaryColor=%23007BFF&logoUrl=&tagline=Best products
```

#### Form Parameters
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| `brandName` | string | yes | 2-50 characters |
| `primaryColor` | string | yes | Valid hex color (#RRGGBB) |
| `logoUrl` | string | no | Valid URL or empty |
| `tagline` | string | no | Max 100 characters |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Branding settings updated successfully",
  "data": {
    "brandName": "Mein Shop",
    "primaryColor": "#007BFF",
    "logoUrl": "",
    "tagline": "Best products"
  }
}
```

#### Error Responses
```json
// 400 Bad Request - Validation Error
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "brandName": "Brand name must be at least 2 characters long",
    "primaryColor": "Must be a valid hex color"
  },
  "timestamp": "2025-08-22T10:30:00Z"
}

// 401 Unauthorized
{
  "error": "Invalid or missing session token",
  "code": "UNAUTHORIZED",
  "timestamp": "2025-08-22T10:30:00Z"
}
```

---

### POST /api/upload
Lädt Dateien (Logo, Banner) hoch zu S3 storage.

**Authentication**: Session Token (Admin nur)
**Rate Limit**: 10 uploads/minute pro Shop
**File Limits**: Max 2MB, JPEG/PNG/WebP/SVG

#### Request
```http
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <session_token>

file=<binary_file_data>&kind=logo
```

#### Form Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | file | yes | Image file (JPEG/PNG/WebP/SVG) |
| `kind` | string | yes | Asset type: "logo" or "banner" |

#### Response (200 OK)
```json
{
  "success": true,
  "url": "https://your-bucket.s3.region.amazonaws.com/assets/shop123/logo-abc123.png",
  "asset": {
    "id": "asset_456",
    "kind": "logo",
    "url": "https://your-bucket.s3.region.amazonaws.com/assets/shop123/logo-abc123.png",
    "filename": "logo.png",
    "size": 45678,
    "mimeType": "image/png"
  }
}
```

#### Error Responses
```json
// 400 Bad Request - Invalid File
{
  "error": "Invalid file type. Allowed: JPEG, PNG, WebP, SVG",
  "code": "INVALID_FILE_TYPE",
  "timestamp": "2025-08-22T10:30:00Z"
}

// 413 Payload Too Large
{
  "error": "File too large. Maximum size: 2MB",
  "code": "FILE_TOO_LARGE",
  "timestamp": "2025-08-22T10:30:00Z"
}
```

## Health & Monitoring

### GET /healthz
Basic health check endpoint.

#### Response (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2025-08-22T10:30:00Z"
}
```

### GET /readiness
Comprehensive readiness check (database, cache, dependencies).

#### Response (200 OK)
```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "cache": "ok",
    "shopify_api": "ok"
  },
  "timestamp": "2025-08-22T10:30:00Z"
}
```

#### Response (503 Service Unavailable)
```json
{
  "status": "not_ready",
  "checks": {
    "database": "ok",
    "cache": "error",
    "shopify_api": "ok"
  },
  "timestamp": "2025-08-22T10:30:00Z"
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {}, // Optional zusätzliche Informationen
  "timestamp": "2025-08-22T10:30:00Z"
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid/missing authentication |
| `FORBIDDEN` | 403 | Access denied für resource |
| `SHOP_NOT_FOUND` | 404 | Shop nicht gefunden/installiert |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

### Limits pro Shop
- **Config API**: 100 requests/minute
- **Products API**: 50 requests/minute  
- **Settings API**: 20 requests/minute
- **Upload API**: 10 uploads/minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1629876543
```

## Caching

### Cache Headers
```http
Cache-Control: public, max-age=300
ETag: "abc123def456"
Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT
```

### Cache TTL
- **Config API**: 5 Minuten
- **Products API**: 60 Sekunden
- **Static Assets**: 1 Tag

## Mobile App Integration

### Recommended Flow
1. **App Start**: Load config via `GET /api/config`
2. **Apply Branding**: Use config.branding för UI customization
3. **Load Products**: Fetch products via `GET /api/products` 
4. **Pagination**: Use pageInfo.endCursor för next page
5. **Checkout**: Open checkoutUrl in WebView

### Example Integration (React Native)
```javascript
// Load shop configuration
const loadConfig = async (shopDomain) => {
  const response = await fetch(`${API_BASE}/api/config?shop=${shopDomain}`);
  const config = await response.json();
  
  // Apply branding
  setTheme({
    primaryColor: config.branding.primaryColor,
    brandName: config.branding.brandName
  });
  
  return config;
};

// Load products with pagination
const loadProducts = async (shopDomain, cursor = null) => {
  const params = new URLSearchParams({
    shop: shopDomain,
    first: '20'
  });
  
  if (cursor) params.append('after', cursor);
  
  const response = await fetch(`${API_BASE}/api/products?${params}`);
  return await response.json();
};
```

## Webhook Endpoints

### POST /webhooks/app/uninstalled
Shopify webhook für app uninstallation.

**Headers**: 
- `X-Shopify-Topic: app/uninstalled`
- `X-Shopify-Hmac-Sha256: <signature>`

### POST /webhooks/products/update  
Shopify webhook für product updates (cache invalidation).

**Headers**:
- `X-Shopify-Topic: products/update`
- `X-Shopify-Hmac-Sha256: <signature>`

## SDK Examples

### JavaScript/TypeScript
```typescript
interface Turn2AppConfig {
  shop: string;
  branding: {
    brandName: string;
    primaryColor: string;
    logoUrl: string;
    tagline: string;
  };
  storefrontEndpoint: string;
  appVersion: string;
}

class Turn2AppSDK {
  constructor(private baseUrl: string) {}
  
  async getConfig(shopDomain: string): Promise<Turn2AppConfig> {
    const response = await fetch(`${this.baseUrl}/api/config?shop=${shopDomain}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  
  async getProducts(shopDomain: string, first = 10, after?: string) {
    const params = new URLSearchParams({ shop: shopDomain, first: first.toString() });
    if (after) params.append('after', after);
    
    const response = await fetch(`${this.baseUrl}/api/products?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
}

// Usage
const sdk = new Turn2AppSDK('https://your-app-domain.com');
const config = await sdk.getConfig('myshop.myshopify.com');
const products = await sdk.getProducts('myshop.myshopify.com', 20);
```