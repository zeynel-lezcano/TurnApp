import { z } from "zod";

export const BrandingSettingsSchema = z.object({
  brandName: z.string().min(1, "Brand name is required").max(50, "Brand name too long"),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format"),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  tagline: z.string().max(100, "Tagline too long").optional().or(z.literal(""))
});

export const ConfigResponseSchema = z.object({
  shop: z.string(),
  branding: BrandingSettingsSchema,
  storefrontEndpoint: z.string().url(),
  appVersion: z.string()
});

export type BrandingSettings = z.infer<typeof BrandingSettingsSchema>;
export type ConfigResponse = z.infer<typeof ConfigResponseSchema>;