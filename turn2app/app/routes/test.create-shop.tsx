import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { Page, Layout, Card, Text, Button, TextField, Banner } from "@shopify/polaris";
import { useState } from "react";
import { prisma } from "../lib/prisma.server";
import { encryptToken } from "../lib/crypto.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const shopDomain = formData.get("shopDomain") as string;
  
  if (!shopDomain || !shopDomain.includes('.myshopify.com')) {
    return json({ 
      error: "Invalid shop domain. Must be format: shop.myshopify.com",
      success: false 
    });
  }
  
  try {
    // Create test shop with dummy access token
    const dummyToken = `shpat_${Math.random().toString(36).substring(2, 34)}`;
    const encryptedToken = encryptToken(dummyToken);
    
    await prisma.shop.create({
      data: {
        shopDomain,
        accessTokenEnc: encryptedToken,
        shopifyShopId: `gid://shopify/Shop/${Math.floor(Math.random() * 1000000)}`,
        shopName: shopDomain.split('.')[0].charAt(0).toUpperCase() + shopDomain.split('.')[0].slice(1),
        shopEmail: `admin@${shopDomain}`,
        planName: 'Basic Shopify',
        currencyCode: 'EUR',
        timezone: 'Europe/Berlin',
        onboardingCompleted: false,
        onboardingStep: 'new',
        installedAt: new Date(),
        lastActiveAt: new Date(),
        settings: JSON.stringify({}),
        appSettings: JSON.stringify({})
      }
    });
    
    return redirect(`/onboarding/welcome?shop=${shopDomain}`);
    
  } catch (error) {
    console.error("Failed to create test shop:", error);
    return json({ 
      error: "Failed to create test shop. Maybe it already exists?",
      success: false 
    });
  }
}

export default function TestCreateShop() {
  const data = useLoaderData<typeof loader>();
  const [shopDomain, setShopDomain] = useState("zeytestshop.myshopify.com");

  return (
    <Page title="Test Shop Creation">
      <Layout>
        <Layout.Section>
          <Card>
            <Banner title="Development Tool" tone="warning">
              <Text variant="bodySm">
                This tool creates a test shop entry in the database for development purposes.
              </Text>
            </Banner>
            
            <div style={{ marginTop: "20px" }}>
              <Form method="post">
                <TextField
                  label="Shop Domain"
                  value={shopDomain}
                  onChange={setShopDomain}
                  name="shopDomain"
                  placeholder="testshop.myshopify.com"
                  helpText="Must end with .myshopify.com"
                />
                
                <div style={{ marginTop: "20px" }}>
                  <Button submit variant="primary">
                    Create Test Shop & Start Onboarding
                  </Button>
                </div>
              </Form>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}