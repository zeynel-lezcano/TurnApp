import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { ConfigResponseSchema } from "~/lib/validation.server";
import { getShopSettings } from "~/lib/shop.server";
import { getOptionalSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Try session token first (for embedded admin)
  const sessionContext = await getOptionalSession(request);
  
  let shop: string;
  if (sessionContext) {
    shop = sessionContext.shop;
  } else {
    // Fallback to query parameter (for development/testing and mobile)
    const shopParam = new URL(request.url).searchParams.get("shop");
    if (!shopParam) {
      return json({ error: "Shop parameter or session token required" }, { status: 400 });
    }
    shop = shopParam;
  }

  try {
    // Get shop settings (without decrypting token)
    const settings = await getShopSettings(shop);

    if (!settings) {
      return json({ error: "Shop not found or not active" }, { status: 404 });
    }

    // Parse settings or use defaults
    const branding = {
      brandName: settings.brandName || shop.split('.')[0],
      primaryColor: settings.primaryColor || "#007C3B",
      logoUrl: settings.logoUrl || "",
      tagline: settings.tagline || "Your mobile shopping experience"
    };

    const configResponse = {
      shop,
      branding,
      storefrontEndpoint: `https://${shop}/api/2024-01/graphql.json`,
      appVersion: "1.0.0"
    };

    // Validate response schema
    const validatedConfig = ConfigResponseSchema.parse(configResponse);

    return json(validatedConfig, {
      headers: {
        "Cache-Control": "public, max-age=300", // 5 minutes cache
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Config API error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}