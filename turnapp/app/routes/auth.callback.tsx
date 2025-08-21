import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { 
  verifyShopifyHmac, 
  exchangeCodeForToken 
} from "~/lib/shopify-auth.server";
import { prisma } from "~/lib/prisma.server";
import { registerWebhooks } from "~/lib/webhooks.server";
import { encryptToken } from "~/lib/crypto.server";
import { getShopWithToken } from "~/lib/shop.server";

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
    
    // Store shop and encrypted token in database
    await prisma.shop.upsert({
      where: { shopDomain },
      update: {
        accessTokenEnc: encryptedToken,
        uninstalledAt: null, // Clear uninstall timestamp if re-installing
        updatedAt: new Date(),
      },
      create: {
        shopDomain,
        accessTokenEnc: encryptedToken,
        installedAt: new Date(),
        settings: JSON.stringify({}),
      },
    });

    console.log('Shop installed successfully:', shopDomain);

    // Register webhooks after successful installation
    const baseUrl = new URL(request.url).origin;
    const shopWithToken = await getShopWithToken(shopDomain);
    if (shopWithToken) {
      await registerWebhooks(shopDomain, shopWithToken.accessToken, baseUrl);
    }
    
    // Redirect to admin dashboard
    return redirect(`https://${shopDomain}/admin/apps/${apiKey}`);
    
  } catch (error) {
    console.error('Database error during OAuth callback:', error);
    throw new Response('Internal server error', { status: 500 });
  }
}