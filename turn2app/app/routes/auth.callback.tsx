import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { 
  verifyShopifyHmac, 
  exchangeCodeForToken,
  fetchShopData 
} from "../lib/shopify-auth.server";
import { prisma } from "../lib/prisma.server";
import { registerWebhooks } from "../lib/webhooks.server";
import { encryptToken } from "../lib/crypto.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());
  
  const { shop, code, hmac, state } = queryParams;

  // Validate required parameters
  if (!shop || !code || !hmac) {
    throw new Response('Missing required OAuth parameters', { status: 400 });
  }

  // Validate shop domain
  const shopDomain = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.myshopify\.com$/.test(shopDomain)) {
    throw new Response('Invalid shop domain', { status: 400 });
  }

  // Verify HMAC signature
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret) {
    throw new Response('Missing Shopify API secret', { status: 500 });
  }

  if (!verifyShopifyHmac(url.searchParams, apiSecret)) {
    console.error('HMAC verification failed for shop:', shopDomain);
    throw new Response('Invalid HMAC signature', { status: 403 });
  }

  // Exchange code for access token
  const apiKey = process.env.SHOPIFY_API_KEY;
  if (!apiKey) {
    throw new Response('Missing Shopify API key', { status: 500 });
  }

  const tokenData = await exchangeCodeForToken(
    shopDomain,
    code,
    apiKey,
    apiSecret
  );

  if (!tokenData) {
    throw new Response('Failed to exchange OAuth code for token', { status: 400 });
  }

  try {
    // Encrypt access token before storing
    const encryptedToken = encryptToken(tokenData.access_token);
    
    // Fetch shop data from Shopify API
    let shopifyData: any = null;
    try {
      shopifyData = await fetchShopData(shopDomain, tokenData.access_token);
    } catch (error) {
      console.warn('Failed to fetch shop data from Shopify API:', error);
      // Continue with installation even if we can't fetch shop data
    }
    
    // Check if shop already exists
    const existingShop = await prisma.shop.findUnique({
      where: { shopDomain }
    });
    
    if (existingShop) {
      // Update existing shop - Re-installation oder Token-Refresh
      await prisma.shop.update({
        where: { shopDomain },
        data: {
          accessTokenEnc: encryptedToken,
          shopifyShopId: shopifyData?.id || existingShop.shopifyShopId,
          shopName: shopifyData?.name || existingShop.shopName,
          shopEmail: shopifyData?.email || existingShop.shopEmail,
          planName: shopifyData?.plan?.displayName || existingShop.planName,
          currencyCode: shopifyData?.currencyCode || existingShop.currencyCode,
          timezone: shopifyData?.timezone || existingShop.timezone,
          uninstalledAt: null, // Clear uninstall timestamp
          lastActiveAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ Shop re-installed successfully: ${shopDomain}`);
      
      // Existing shop - check if onboarding completed
      if (existingShop.onboardingCompleted) {
        // Direct to dashboard
        return redirect(`/?shop=${shopDomain}&embedded=1`);
      } else {
        // Continue onboarding
        return redirect(`/onboarding/welcome?shop=${shopDomain}`);
      }
      
    } else {
      // Create new shop record
      await prisma.shop.create({
        data: {
          shopDomain,
          accessTokenEnc: encryptedToken,
          shopifyShopId: shopifyData?.id || null,
          shopName: shopifyData?.name || null,
          shopEmail: shopifyData?.email || null,
          planName: shopifyData?.plan?.displayName || null,
          currencyCode: shopifyData?.currencyCode || 'EUR',
          timezone: shopifyData?.timezone || 'Europe/Berlin',
          onboardingCompleted: false,
          onboardingStep: 'new',
          installedAt: new Date(),
          lastActiveAt: new Date(),
          settings: JSON.stringify({}),
          appSettings: JSON.stringify({})
        }
      });
      
      console.log(`✅ New shop installed successfully: ${shopDomain}`);
      
      // New shop - start onboarding
      return redirect(`/onboarding/welcome?shop=${shopDomain}`);
    }
    
  } catch (error) {
    console.error('❌ Database error during OAuth callback:', error);
    
    // Try to provide helpful error page instead of generic 500
    const errorParams = new URLSearchParams({
      shop: shopDomain,
      error: 'installation_failed',
      message: 'Fehler beim Speichern der App-Installation'
    });
    
    return redirect(`/auth/error?${errorParams.toString()}`);
  }
}