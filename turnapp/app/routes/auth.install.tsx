import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { createOAuthUrl } from "~/lib/shopify-auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');

  if (!shop) {
    throw new Response('Missing shop parameter', { status: 400 });
  }

  // Validate shop domain format
  const shopDomain = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shopDomain)) {
    throw new Response('Invalid shop domain', { status: 400 });
  }

  const apiKey = process.env.SHOPIFY_API_KEY;
  const scopes = process.env.SCOPES;
  const redirectUri = `${process.env.APP_URL}/auth/callback`;

  if (!apiKey || !scopes) {
    throw new Response('Missing Shopify configuration', { status: 500 });
  }

  const authUrl = createOAuthUrl(shopDomain, apiKey, scopes, redirectUri);
  
  return redirect(authUrl);
}