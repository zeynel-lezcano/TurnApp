import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { verifyWebhookHmac } from "../lib/webhooks.server";
import { invalidateProductCache } from "../lib/cache.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256");
  const shopDomain = request.headers.get("X-Shopify-Shop-Domain");
  
  if (!hmacHeader || !shopDomain) {
    console.error("Missing required webhook headers");
    return json({ error: "Missing headers" }, { status: 400 });
  }

  // Get raw body for HMAC verification
  const body = await request.text();
  
  // Verify HMAC signature
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret) {
    console.error("Missing Shopify API secret");
    return json({ error: "Server configuration error" }, { status: 500 });
  }

  if (!verifyWebhookHmac(body, hmacHeader, apiSecret)) {
    console.error("Webhook HMAC verification failed for shop:", shopDomain);
    return json({ error: "Invalid signature" }, { status: 403 });
  }

  try {
    // Parse webhook payload
    const payload = JSON.parse(body);
    console.log("Product updated webhook received:", { 
      shop: shopDomain,
      productId: payload.id,
      productTitle: payload.title,
      updatedAt: payload.updated_at,
      timestamp: new Date().toISOString()
    });

    // Invalidate product cache for this shop
    await invalidateProductCache(shopDomain);
    
    console.log("Product cache invalidated for shop:", shopDomain);

    // Respond quickly to Shopify
    return json({ status: "ok" }, { status: 200 });

  } catch (error) {
    console.error("Error processing products update webhook:", error);
    
    // Still return 200 to prevent retries for malformed payloads
    if (error instanceof SyntaxError) {
      return json({ status: "ok" }, { status: 200 });
    }
    
    // For future cache errors, return 500 so Shopify retries
    return json({ error: "Internal error" }, { status: 500 });
  }
}