import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { getOptionalSession } from "~/lib/session.server";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  Text,
  Divider,
  InlineStack
} from "@shopify/polaris";
import { useState, useCallback } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  // Try session token first (for embedded admin)
  const sessionContext = await getOptionalSession(request);
  
  let shop: string;
  if (sessionContext) {
    shop = sessionContext.shop;
  } else {
    // Fallback to query parameter (for development/testing)
    const shopParam = new URL(request.url).searchParams.get("shop");
    if (!shopParam) {
      throw new Response("Unauthorized - Missing session token or shop parameter", { status: 401 });
    }
    shop = shopParam;
  }

  // Load branding settings from config API
  try {
    const configUrl = new URL("/api/config", request.url);
    configUrl.searchParams.set("shop", shop);
    
    const configResponse = await fetch(configUrl.toString());
    const configData = await configResponse.json();
    
    if (!configResponse.ok) {
      throw new Error(configData.error || "Failed to load config");
    }

    return json({
      shop,
      brandingSettings: configData.branding
    });
  } catch (error) {
    console.error("Failed to load branding settings:", error);
    
    // Fallback to defaults
    const brandingSettings = {
      brandName: shop.split('.')[0],
      primaryColor: "#007C3B",
      logoUrl: "",
      tagline: "Your mobile shopping experience"
    };

    return json({
      shop,
      brandingSettings
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  // Try session token first (for embedded admin)
  const sessionContext = await getOptionalSession(request);
  
  let shop: string;
  if (sessionContext) {
    shop = sessionContext.shop;
  } else {
    // Fallback to query parameter (for development/testing)
    const shopParam = new URL(request.url).searchParams.get("shop");
    if (!shopParam) {
      throw new Response("Unauthorized - Missing session token or shop parameter", { status: 401 });
    }
    shop = shopParam;
  }

  try {
    // Forward to settings API
    const settingsUrl = new URL("/api/settings", request.url);
    settingsUrl.searchParams.set("shop", shop);
    
    const formData = await request.formData();
    
    const settingsResponse = await fetch(settingsUrl.toString(), {
      method: "POST",
      body: formData
    });
    
    const settingsData = await settingsResponse.json();
    
    if (!settingsResponse.ok) {
      throw new Error(settingsData.error || "Failed to save settings");
    }

    return json(settingsData);
    
  } catch (error) {
    console.error("Failed to save branding settings:", error);
    return json({
      error: error instanceof Error ? error.message : "Failed to save settings"
    }, { status: 500 });
  }
}

export default function AdminBranding() {
  const { shop, brandingSettings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  const [brandName, setBrandName] = useState(brandingSettings.brandName);
  const [primaryColor, setPrimaryColor] = useState(brandingSettings.primaryColor);
  const [logoUrl, setLogoUrl] = useState(brandingSettings.logoUrl);
  const [tagline, setTagline] = useState(brandingSettings.tagline);

  const handleBrandNameChange = useCallback((value: string) => setBrandName(value), []);
  const handleLogoUrlChange = useCallback((value: string) => setLogoUrl(value), []);
  const handleTaglineChange = useCallback((value: string) => setTagline(value), []);

  return (
    <Page 
      title="Branding Configuration"
      subtitle="Customize your mobile app appearance"
      backAction={{
        url: '/admin'
      }}
    >
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <Banner tone="success" onDismiss={() => {}}>
              {actionData.message}
            </Banner>
          )}
          {actionData?.error && (
            <Banner tone="critical" onDismiss={() => {}}>
              {actionData.error}
            </Banner>
          )}
          
          <Card>
            <Form method="post">
              <FormLayout>
                <Text variant="headingSm" as="h3">Basic Information</Text>
                
                <TextField
                  label="App Name"
                  value={brandName}
                  onChange={handleBrandNameChange}
                  name="brandName"
                  helpText="This will be the name of your mobile app"
                  autoComplete="off"
                />

                <TextField
                  label="Tagline"
                  value={tagline}
                  onChange={handleTaglineChange}
                  name="tagline"
                  helpText="A short description for your mobile app"
                  autoComplete="off"
                />

                <Divider />

                <Text variant="headingSm" as="h3">Visual Design</Text>

                <TextField
                  label="Primary Color"
                  value={primaryColor}
                  onChange={setPrimaryColor}
                  name="primaryColor"
                  helpText="Hex color code for your app's primary color"
                  autoComplete="off"
                  prefix="#"
                  placeholder="007C3B"
                />

                <TextField
                  label="Logo URL"
                  value={logoUrl}
                  onChange={handleLogoUrlChange}
                  name="logoUrl"
                  helpText="URL to your app logo (optional)"
                  autoComplete="off"
                />

                <InlineStack align="end">
                  <Button variant="primary" submit>
                    Save Settings
                  </Button>
                </InlineStack>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingSm" as="h3">Preview</Text>
              <div style={{ marginTop: '16px' }}>
                <div 
                  style={{
                    padding: '20px',
                    backgroundColor: primaryColor,
                    color: 'white',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}
                >
                  <Text variant="headingLg" as="h2">
                    {brandName || 'Your App Name'}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    {tagline || 'Your tagline here'}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}