import { json, type ActionFunctionArgs } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";
import { BrandingSettingsSchema } from "~/lib/validation.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  if (!shop) {
    return json({ error: "Shop parameter required" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    
    // Extract form data
    const brandingData = {
      brandName: formData.get("brandName") as string,
      primaryColor: formData.get("primaryColor") as string,
      logoUrl: formData.get("logoUrl") as string || "",
      tagline: formData.get("tagline") as string || ""
    };

    // Validate with Zod
    const validatedBranding = BrandingSettingsSchema.parse(brandingData);

    // Find shop in database
    const shopRecord = await prisma.shop.findUnique({
      where: { shopDomain: shop }
    });

    if (!shopRecord) {
      return json({ error: "Shop not found" }, { status: 404 });
    }

    // Merge with existing settings
    const currentSettings = (shopRecord.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      ...validatedBranding,
      updatedAt: new Date().toISOString()
    };

    // Update shop settings
    await prisma.shop.update({
      where: { shopDomain: shop },
      data: { settings: updatedSettings }
    });

    console.log(`Updated branding settings for shop: ${shop}`, validatedBranding);

    return json({
      success: true,
      message: "Branding settings saved successfully!",
      branding: validatedBranding
    });

  } catch (error) {
    console.error("Settings API error:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return json({ 
        error: "Validation failed", 
        details: error.message 
      }, { status: 400 });
    }

    return json({ error: "Internal server error" }, { status: 500 });
  }
}