import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verifies HMAC signature from Shopify
 * Used for OAuth callbacks and webhook validation
 */
export function verifyShopifyHmac(
  query: URLSearchParams | Record<string, string>,
  secret: string
): boolean {
  try {
    const params = query instanceof URLSearchParams ? query : new URLSearchParams(query);
    const hmac = params.get('hmac');
    
    if (!hmac) {
      return false;
    }

    // Remove hmac and signature from query params
    params.delete('hmac');
    params.delete('signature');

    // Sort parameters and create query string
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // Calculate expected HMAC
    const expectedHmac = createHmac('sha256', secret)
      .update(sortedParams)
      .digest('hex');

    // Validate HMAC length before comparison
    if (hmac.length !== expectedHmac.length) {
      return false;
    }

    // Timing-safe comparison
    return timingSafeEqual(
      Buffer.from(hmac, 'hex'),
      Buffer.from(expectedHmac, 'hex')
    );
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

/**
 * Verifies webhook HMAC from X-Shopify-Hmac-Sha256 header
 */
export function verifyWebhookHmac(
  body: string,
  hmacHeader: string,
  secret: string
): boolean {
  try {
    const expectedHmac = createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64');

    // Validate HMAC length before comparison
    if (hmacHeader.length !== expectedHmac.length) {
      return false;
    }

    return timingSafeEqual(
      Buffer.from(hmacHeader, 'base64'),
      Buffer.from(expectedHmac, 'base64')
    );
  } catch (error) {
    console.error('Webhook HMAC verification error:', error);
    return false;
  }
}

/**
 * Creates OAuth authorization URL
 */
export function createOAuthUrl(
  shop: string,
  apiKey: string,
  scopes: string,
  redirectUri: string
): string {
  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes,
    redirect_uri: redirectUri,
    state: createNonce(), // CSRF protection
  });

  // Handle both "myshop" and "myshop.myshopify.com" formats
  const shopDomain = shop.endsWith('.myshopify.com') ? shop : `${shop}.myshopify.com`;
  
  return `https://${shopDomain}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Exchanges OAuth code for access token
 */
export async function exchangeCodeForToken(
  shop: string,
  code: string,
  apiKey: string,
  apiSecret: string
): Promise<{ access_token: string; scope: string } | null> {
  try {
    // Handle both "myshop" and "myshop.myshopify.com" formats
    const shopDomain = shop.endsWith('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    
    const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      }),
    });

    if (!response.ok) {
      console.error('Token exchange failed:', response.status, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Token exchange error:', error);
    return null;
  }
}

/**
 * Fetches shop data from Shopify Admin API
 */
export async function fetchShopData(
  shop: string,
  accessToken: string
): Promise<{
  id: string;
  name: string;
  email: string;
  plan_name: string;
  currency: string;
  timezone: string;
} | null> {
  try {
    const shopDomain = shop.endsWith('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Shop data fetch failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const shopData = data.shop;
    
    return {
      id: `gid://shopify/Shop/${shopData.id}`,
      name: shopData.name,
      email: shopData.email,
      plan_name: shopData.plan_name,
      currency: shopData.currency,
      timezone: shopData.iana_timezone,
    };
  } catch (error) {
    console.error('Shop data fetch error:', error);
    return null;
  }
}

/**
 * Creates a random nonce for CSRF protection
 */
function createNonce(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}