import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useFetcher } from "@remix-run/react";
import { flexibleAuth, logRequest } from "../lib/middleware.server";
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
  InlineStack,
  DropZone,
  Thumbnail,
  BlockStack,
  Icon
} from "@shopify/polaris";
import { useState, useCallback, useRef } from "react";
import { ImageIcon } from '@shopify/polaris-icons';

interface UploadResponse {
  success?: boolean;
  error?: string;
  asset?: {
    id: string;
    kind: string;
    url: string;
    filename: string;
  };
  message?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await flexibleAuth(request);
  logRequest(request, context);

  // Load branding settings from config API
  try {
    const configUrl = new URL("/api/config", request.url);
    configUrl.searchParams.set("shop", context.shop);
    
    const configResponse = await fetch(configUrl.toString());
    const configData = await configResponse.json();
    
    if (!configResponse.ok) {
      throw new Error(configData.error || "Failed to load config");
    }

    return json({
      shop: context.shop,
      brandingSettings: configData.branding
    });
  } catch (error) {
    console.error("Failed to load branding settings:", error);
    
    // Fallback to defaults
    const brandingSettings = {
      brandName: context.shop.split('.')[0],
      primaryColor: "#007C3B",
      logoUrl: "",
      tagline: "Your mobile shopping experience"
    };

    return json({
      shop: context.shop,
      brandingSettings
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const context = await flexibleAuth(request);
  logRequest(request, context);

  try {
    // Forward to settings API
    const settingsUrl = new URL("/api/settings", request.url);
    settingsUrl.searchParams.set("shop", context.shop);
    
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
  const uploadFetcher = useFetcher();
  
  const [brandName, setBrandName] = useState(brandingSettings.brandName);
  const [primaryColor, setPrimaryColor] = useState(brandingSettings.primaryColor);
  const [logoUrl, setLogoUrl] = useState(brandingSettings.logoUrl);
  const [tagline, setTagline] = useState(brandingSettings.tagline);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleBrandNameChange = useCallback((value: string) => setBrandName(value), []);
  const handleLogoUrlChange = useCallback((value: string) => setLogoUrl(value), []);
  const handleTaglineChange = useCallback((value: string) => setTagline(value), []);
  
  const handleDropZoneDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (file) {
      setUploadedFile(file);
      
      // Upload file immediately
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', 'logo');
      
      uploadFetcher.submit(formData, {
        method: 'POST',
        action: `/api/upload?shop=${shop}`,
        encType: 'multipart/form-data'
      });
    }
  }, [shop, uploadFetcher]);

  // Update logoUrl when upload completes
  const uploadData = uploadFetcher.data as UploadResponse;
  if (uploadData?.success && uploadData.asset?.url && uploadData.asset.url !== logoUrl) {
    setLogoUrl(uploadData.asset.url);
  }

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

                <div>
                  <Text variant="bodyMd" as="p" fontWeight="medium">Logo Upload</Text>
                  <div style={{ marginTop: '8px' }}>
                    <DropZone onDrop={handleDropZoneDrop} accept="image/*" type="image">
                      {uploadedFile ? (
                        <BlockStack gap="200">
                          <Thumbnail
                            source={URL.createObjectURL(uploadedFile)}
                            alt={uploadedFile.name}
                            size="large"
                          />
                          <Text variant="bodyMd" as="p" alignment="center">
                            {uploadedFile.name}
                          </Text>
                          {uploadFetcher.state === 'submitting' && (
                            <Text variant="bodyMd" as="p" alignment="center">
                              Uploading...
                            </Text>
                          )}
                          {(uploadFetcher.data as UploadResponse)?.success && (
                            <Text variant="bodyMd" as="p" alignment="center" tone="success">
                              Upload successful!
                            </Text>
                          )}
                        </BlockStack>
                      ) : logoUrl ? (
                        <BlockStack gap="200">
                          <Thumbnail
                            source={logoUrl}
                            alt="Current logo"
                            size="large"
                          />
                          <Text variant="bodyMd" as="p" alignment="center">
                            Current logo
                          </Text>
                        </BlockStack>
                      ) : (
                        <BlockStack gap="200">
                          <Icon source={ImageIcon} tone="subdued" />
                          <Text variant="bodyMd" as="p" alignment="center">
                            Drop logo here or click to upload
                          </Text>
                          <Text variant="bodyMd" as="p" alignment="center" tone="subdued">
                            Supports JPG, PNG, WebP, SVG (max 2MB)
                          </Text>
                        </BlockStack>
                      )}
                    </DropZone>
                  </div>
                  {(uploadFetcher.data as UploadResponse)?.error && (
                    <Banner tone="critical" onDismiss={() => {}}>
                      {(uploadFetcher.data as UploadResponse)?.error || 'Upload error'}
                    </Banner>
                  )}
                </div>

                <TextField
                  label="Logo URL (Alternative)"
                  value={logoUrl}
                  onChange={handleLogoUrlChange}
                  name="logoUrl"
                  helpText="Or provide a direct URL to your logo"
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