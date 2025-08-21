import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { ConfigResponseSchema } from "~/lib/validation.server";
import { getShopSettings } from "~/lib/shop.server";
import { flexibleAuth, logRequest } from "~/lib/middleware.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Use hardened middleware for authentication
  const context = await flexibleAuth(request);
  logRequest(request, context);

  try {
    // Get shop settings (without decrypting token)
    const settings = await getShopSettings(context.shop);

    if (!settings) {
      return json({ error: "Shop not found or not active" }, { status: 404 });
    }

    // Parse settings or use defaults
    const branding = {
      brandName: settings.brandName || context.shop.split('.')[0],
      primaryColor: settings.primaryColor || "#007C3B",
      logoUrl: settings.logoUrl || "",
      tagline: settings.tagline || "Your mobile shopping experience"
    };

    const configResponse = {
      shop: context.shop,
      branding,
      storefrontEndpoint: `https://${context.shop}/api/2024-01/graphql.json`,
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