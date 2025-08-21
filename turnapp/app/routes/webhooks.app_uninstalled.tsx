import { json, type ActionFunctionArgs } from "@remix-run/node";
import { verifyWebhookHmac } from "~/lib/webhooks.server";
import { prisma } from "~/lib/prisma.server";

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
    console.log("App uninstalled webhook received:", { 
      shop: shopDomain,
      domain: payload.domain,
      timestamp: new Date().toISOString()
    });

    // Soft delete shop record (set uninstalledAt timestamp)
    const updatedShop = await prisma.shop.update({
      where: { shopDomain },
      data: { 
        uninstalledAt: new Date(),
        // Keep the record for potential re-installation
        // accessTokenEnc will be overwritten on re-install
      }
    });

    console.log("Shop uninstalled successfully:", { 
      shopDomain,
      installedAt: updatedShop.installedAt,
      uninstalledAt: updatedShop.uninstalledAt
    });

    // Respond quickly to Shopify
    return json({ status: "ok" }, { status: 200 });

  } catch (error) {
    console.error("Error processing app uninstall webhook:", error);
    
    // Still return 200 to prevent retries for malformed payloads
    if (error instanceof SyntaxError) {
      return json({ status: "ok" }, { status: 200 });
    }
    
    // For database errors, return 500 so Shopify retries
    return json({ error: "Internal error" }, { status: 500 });
  }
}