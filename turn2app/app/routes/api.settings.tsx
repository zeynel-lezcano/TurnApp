import { json, type ActionFunctionArgs } from "@remix-run/node";
import { prisma } from "../lib/prisma.server";
import { 
  validateBrandingData, 
  createErrorResponse, 
  ErrorResponseSchema 
} from "../lib/validation.server";
import { flexibleAuth, logRequest } from "../lib/middleware.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json(createErrorResponse("Method not allowed", "METHOD_NOT_ALLOWED"), { status: 405 });
  }

  try {
    // Use hardened middleware for authentication
    const context = await flexibleAuth(request);
    logRequest(request, context);

    const formData = await request.formData();
    
    // Extract form data
    const brandingData = {
      brandName: formData.get("brandName") as string,
      primaryColor: formData.get("primaryColor") as string,
      logoUrl: formData.get("logoUrl") as string || "",
      tagline: formData.get("tagline") as string || ""
    };

    // Validate with enhanced Zod validation
    const validatedBranding = validateBrandingData(brandingData);

    // Shop record already validated by middleware
    const shopRecord = context.shopRecord;

    // Merge with existing settings
    const currentSettings = (shopRecord.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      ...validatedBranding,
      updatedAt: new Date().toISOString()
    };

    // Update shop settings
    await prisma.shop.update({
      where: { shopDomain: context.shop },
      data: { settings: updatedSettings }
    });

    console.log(`Updated branding settings for shop: ${context.shop}`, validatedBranding);

    return json({
      success: true,
      message: "Branding settings saved successfully!",
      branding: validatedBranding
    });

  } catch (error) {
    console.error("Settings API error:", error);
    
    if (error instanceof Response) {
      throw error; // Re-throw middleware responses
    }

    if (error instanceof Error && error.message.includes("Validation failed")) {
      return json(createErrorResponse(
        error.message,
        "VALIDATION_ERROR"
      ), { status: 400 });
    }

    return json(createErrorResponse(
      "Failed to update settings",
      "INTERNAL_ERROR"
    ), { status: 500 });
  }
}