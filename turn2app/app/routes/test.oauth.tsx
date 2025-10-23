import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";

export async function loader() {
  const testShop = "zeytestshop"; // Updated for current development shop
  const installUrl = `/auth/install?shop=${testShop}.myshopify.com`;
  
  return json({
    testShop,
    installUrl,
    apiKey: process.env.SHOPIFY_API_KEY || 'NOT_SET',
    appUrl: process.env.APP_URL || 'NOT_SET',
  });
}

export default function TestOAuth() {
  const { testShop, installUrl, apiKey, appUrl } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "20px" }}>
      <h1>OAuth Test Page</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <h3>Configuration:</h3>
        <p>Test Shop: {testShop}.myshopify.com</p>
        <p>API Key: {apiKey}</p>
        <p>App URL: {appUrl}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Test OAuth Flow:</h3>
        <Link 
          to={installUrl}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#007C3B", 
            color: "white", 
            textDecoration: "none",
            borderRadius: "4px" 
          }}
        >
          Install App to {testShop}.myshopify.com
        </Link>
      </div>

      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        <p>⚠️ Make sure to:</p>
        <ul>
          <li>Set SHOPIFY_API_KEY and SHOPIFY_API_SECRET in .env</li>
          <li>Update APP_URL with your ngrok URL</li>
          <li>Add the callback URL to your Shopify Partner Dashboard</li>
        </ul>
      </div>
    </div>
  );
}