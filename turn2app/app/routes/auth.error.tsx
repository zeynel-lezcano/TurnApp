import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  BlockStack,
  Banner,
} from "@shopify/polaris";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  return json({
    shop: url.searchParams.get("shop"),
    error: url.searchParams.get("error"),
    message: url.searchParams.get("message") || "Ein unbekannter Fehler ist aufgetreten"
  });
}

export default function AuthError() {
  const { shop, error, message } = useLoaderData<typeof loader>();

  const getErrorDetails = (errorCode: string | null) => {
    switch (errorCode) {
      case 'installation_failed':
        return {
          title: 'Installation fehlgeschlagen',
          description: 'Die App-Installation konnte nicht abgeschlossen werden.',
          action: 'Erneut installieren'
        };
      case 'token_expired':
        return {
          title: 'Sitzung abgelaufen',
          description: 'Ihre Verbindung zu Shopify ist abgelaufen.',
          action: 'Erneut anmelden'
        };
      case 'shop_uninstalled':
        return {
          title: 'App wurde deinstalliert',
          description: 'Die App wurde von Ihrem Shop entfernt.',
          action: 'App neu installieren'
        };
      default:
        return {
          title: 'Authentifizierungsfehler',
          description: 'Ein Problem mit der Anmeldung ist aufgetreten.',
          action: 'Erneut versuchen'
        };
    }
  };

  const errorDetails = getErrorDetails(error);
  const installUrl = shop ? `/auth/install?shop=${shop}` : '/auth/install';

  return (
    <Page title="TurnApp - Fehler">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="600">
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ 
                  fontSize: "48px", 
                  marginBottom: "20px" 
                }}>
                  ⚠️
                </div>
                
                <Text variant="headingXl" as="h1" alignment="center">
                  {errorDetails.title}
                </Text>
                
                <div style={{ margin: "20px 0" }}>
                  <Text variant="bodyLg" alignment="center" tone="subdued">
                    {errorDetails.description}
                  </Text>
                </div>
                
                {message && (
                  <Banner tone="critical" title="Details">
                    <Text variant="bodySm">{message}</Text>
                  </Banner>
                )}
              </div>

              <div style={{ textAlign: "center" }}>
                <BlockStack gap="300">
                  <Link to={installUrl}>
                    <Button variant="primary" size="large">
                      {errorDetails.action}
                    </Button>
                  </Link>
                  
                  <Link to="/">
                    <Button variant="secondary">
                      Zur Startseite
                    </Button>
                  </Link>
                </BlockStack>
              </div>

              {shop && (
                <div style={{ 
                  textAlign: "center", 
                  padding: "20px", 
                  backgroundColor: "#f8f9fa", 
                  borderRadius: "8px" 
                }}>
                  <Text variant="bodySm" tone="subdued">
                    Shop: {shop}
                  </Text>
                  <br />
                  <Text variant="bodySm" tone="subdued">
                    Falls das Problem weiterhin besteht, kontaktieren Sie unseren Support.
                  </Text>
                </div>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}