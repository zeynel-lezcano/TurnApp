import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Outlet, useLocation, Link } from "@remix-run/react";
import { getOptionalSession } from "~/lib/session.server";
import { 
  Frame, 
  TopBar, 
  Navigation, 
  Layout,
  Page,
  Text,
  Card,
  Button
} from "@shopify/polaris";
import { useState, useCallback } from "react";
// import AppBridge from "@shopify/app-bridge-react";
// const { Provider } = AppBridge;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Try session token first (for embedded admin)
  const sessionContext = await getOptionalSession(request);
  
  if (sessionContext) {
    // Embedded admin with session token
    return json({
      shop: sessionContext.shop,
      host: url.searchParams.get("host"),
      appBridgeConfig: {
        apiKey: process.env.SHOPIFY_API_KEY || "",
        shop: sessionContext.shop,
        host: url.searchParams.get("host") || "",
      }
    });
  }
  
  // Fallback to query parameter (for development/testing)
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");
  
  if (!shop) {
    throw new Response("Unauthorized - Missing session token or shop parameter", { status: 401 });
  }

  return json({
    shop,
    host,
    appBridgeConfig: {
      apiKey: process.env.SHOPIFY_API_KEY || "",
      shop,
      host: host || "",
    }
  });
}

export default function AdminLayout() {
  const { shop } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  const toggleMobileNavigationActive = useCallback(
    () => setMobileNavigationActive((mobileNavigationActive) => !mobileNavigationActive),
    []
  );

  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            url: '/admin',
            label: 'Overview',
            icon: 'HomeIcon' as any,
            selected: location.pathname === '/admin'
          },
          {
            url: '/admin/branding',
            label: 'Branding',
            icon: 'ColorIcon' as any,
            selected: location.pathname === '/admin/branding'
          }
        ]}
      />
    </Navigation>
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      onNavigationToggle={toggleMobileNavigationActive}
    />
  );

  const currentPath = location.pathname;
  const isOverview = currentPath === '/admin' || currentPath === '/admin/';

  return (
    <Frame
      topBar={topBarMarkup}
      navigation={navigationMarkup}
      showMobileNavigation={mobileNavigationActive}
      onNavigationDismiss={toggleMobileNavigationActive}
    >
      {isOverview ? (
        <Page title="TurnApp Overview">
          <Layout>
            <Layout.Section>
              <Card>
                <div style={{ padding: '20px' }}>
                  <Text variant="headingMd" as="h2">Welcome to TurnApp</Text>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    Transform your Shopify store into a mobile shopping app
                  </Text>
                  <div style={{ marginTop: '20px' }}>
                    <Text variant="headingSm" as="h3">Shop: {shop}</Text>
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <Link to="/admin/branding">
                      <Button variant="primary">Configure Branding</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </Layout.Section>
            
            <Layout.Section variant="oneThird">
              <Card>
                <div style={{ padding: '20px' }}>
                  <Text variant="headingSm" as="h3">Quick Stats</Text>
                  <div style={{ marginTop: '12px' }}>
                    <Text variant="bodyMd" as="p">Status: Active</Text>
                    <Text variant="bodyMd" as="p">App Version: 1.0.0</Text>
                  </div>
                </div>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      ) : (
        <Outlet />
      )}
    </Frame>
  );
}