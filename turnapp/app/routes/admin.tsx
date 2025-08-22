/**
 * Admin UI Layout - Shopify Embedded App Interface
 * 
 * Diese Komponente implementiert das Haupt-Layout für die embedded Shopify Admin App.
 * Sie verwendet Shopify Polaris für konsistentes UI-Design und stellt die Navigation
 * und Struktur für alle Admin-Features bereit.
 * 
 * EMBEDDED APP INTEGRATION:
 * - Läuft als iframe im Shopify Admin
 * - Verwendet Shopify Polaris Design System
 * - App Bridge für native Shopify Integration (vorbereitet)
 * 
 * FEATURES:
 * - Responsive Navigation mit Mobile-Support
 * - Outlet-Pattern für Nested Routes
 * - Shop-Context Display
 * - Quick Stats Dashboard
 * 
 * NAVIGATION STRUKTUR:
 * - /admin: Overview Dashboard (diese Komponente)
 * - /admin/branding: Branding Configuration (Nested Route)
 * 
 * AUTHENTIFIZIERUNG:
 * - flexibleAuth() unterstützt Session Token und Shop Parameter
 * - Session Token vom Shopify Admin (X-Shopify-Session-Token)
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Outlet, useLocation, Link } from "@remix-run/react";
import { flexibleAuth, logRequest } from "~/lib/middleware.server";
import { 
  Frame,      // Shopify Polaris Haupt-Layout Komponente
  TopBar,     // Header mit Navigation Toggle
  Navigation, // Sidebar Navigation Menu
  Layout,     // Grid Layout System
  Page,       // Page Container mit Titel
  Text,       // Typography Komponente
  Card,       // Content Container Cards
  Button      // Polaris Button Komponente
} from "@shopify/polaris";
import { useState, useCallback } from "react";
// App Bridge Integration (vorbereitet für erweiterte Shopify Features)
// import AppBridge from "@shopify/app-bridge-react";
// const { Provider } = AppBridge;

/**
 * Admin Layout Loader - Lädt Shop-Context und App Bridge Konfiguration
 * 
 * DATENLADUNG:
 * 1. flexibleAuth(): Session Token oder Shop Parameter Authentifizierung
 * 2. Shop-Context für UI-Display extrahieren
 * 3. Shopify App Bridge Config vorbereiten (host, apiKey)
 * 
 * APP BRIDGE INTEGRATION:
 * - host: Shopify Admin Host Parameter für iframe Integration
 * - apiKey: Unsere App's Shopify API Key für App Bridge
 * - shop: Shop Domain für App Bridge Context
 * 
 * VERWENDUNG:
 * - Shop Domain wird in UI angezeigt
 * - App Bridge Config ermöglicht native Shopify Features (Navigation, etc.)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Authentifizierung: Session Token (embedded admin) oder Shop Parameter
  const context = await flexibleAuth(request);
  logRequest(request, context);
  
  return json({
    shop: context.shop,  // Shop Domain für UI Display
    host: url.searchParams.get("host"),  // Shopify Admin Host für App Bridge
    appBridgeConfig: {
      apiKey: process.env.SHOPIFY_API_KEY || "",  // Unsere App ID
      shop: context.shop,                           // Shop Context
      host: url.searchParams.get("host") || "",    // Admin Host
    }
  });
}

/**
 * Admin Layout React Component - Responsive Shopify Admin Interface
 * 
 * STATE MANAGEMENT:
 * - shop: Shop Domain vom Loader für Display
 * - location: Current Route für Navigation Highlighting  
 * - mobileNavigationActive: Mobile Navigation Sidebar State
 * 
 * RESPONSIVE DESIGN:
 * - Desktop: Sidebar Navigation immer sichtbar
 * - Mobile: Collapsible Navigation mit Toggle Button
 */
export default function AdminLayout() {
  const { shop } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  // Mobile Navigation Toggle - React useCallback für Performance
  const toggleMobileNavigationActive = useCallback(
    () => setMobileNavigationActive((mobileNavigationActive) => !mobileNavigationActive),
    [] // Keine Dependencies - stable function reference
  );

  // NAVIGATION MENU KONFIGURATION
  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            url: '/admin',
            label: 'Overview',              // Dashboard/Hauptseite
            icon: 'HomeIcon' as any,       // Polaris Home Icon
            selected: location.pathname === '/admin'  // Active State
          },
          {
            url: '/admin/branding',
            label: 'Branding',             // Shop Customization
            icon: 'ColorIcon' as any,      // Polaris Color Icon
            selected: location.pathname === '/admin/branding'  // Active State
          }
          // Zukünftige Navigation Items können hier hinzugefügt werden:
          // - Settings, Analytics, Mobile Preview, etc.
        ]}
      />
    </Navigation>
  );

  // TOP BAR mit Mobile Navigation Toggle
  const topBarMarkup = (
    <TopBar
      showNavigationToggle        // Hamburger Menu für Mobile
      onNavigationToggle={toggleMobileNavigationActive}  // Toggle Handler
    />
  );

  // ROUTE DETECTION für Conditional Rendering
  const currentPath = location.pathname;
  const isOverview = currentPath === '/admin' || currentPath === '/admin/';

  return (
    // POLARIS FRAME - Haupt-Layout Container
    <Frame
      topBar={topBarMarkup}                              // Header mit Navigation Toggle
      navigation={navigationMarkup}                      // Sidebar Navigation
      showMobileNavigation={mobileNavigationActive}      // Mobile Navigation State
      onNavigationDismiss={toggleMobileNavigationActive} // Close Mobile Navigation
    >
      {/* CONDITIONAL RENDERING: Overview Dashboard vs Nested Routes */}
      {isOverview ? (
        // OVERVIEW DASHBOARD - Haupt-Dashboard der App
        <Page title="TurnApp Overview">
          <Layout>  {/* Polaris Grid Layout */}
            <Layout.Section>  {/* Haupt-Content Section */}
              <Card>
                <div style={{ padding: '20px' }}>
                  {/* App Willkommens-Bereich */}
                  <Text variant="headingMd" as="h2">Welcome to TurnApp</Text>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    Transform your Shopify store into a mobile shopping app
                  </Text>
                  
                  {/* Shop Information Display */}
                  <div style={{ marginTop: '20px' }}>
                    <Text variant="headingSm" as="h3">Shop: {shop}</Text>
                  </div>
                  
                  {/* Primary Action: Branding Setup */}
                  <div style={{ marginTop: '20px' }}>
                    <Link to="/admin/branding">
                      <Button variant="primary">Configure Branding</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </Layout.Section>
            
            {/* SIDEBAR: Quick Stats und Informationen */}
            <Layout.Section variant="oneThird">  {/* 1/3 Breite Sidebar */}
              <Card>
                <div style={{ padding: '20px' }}>
                  <Text variant="headingSm" as="h3">Quick Stats</Text>
                  <div style={{ marginTop: '12px' }}>
                    {/* App Status Informationen */}
                    <Text variant="bodyMd" as="p">Status: Active</Text>
                    <Text variant="bodyMd" as="p">App Version: 1.0.0</Text>
                    {/* Zukünftige Stats: Install Date, Mobile Downloads, etc. */}
                  </div>
                </div>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      ) : (
        // NESTED ROUTES - Andere Admin Seiten (z.B. /admin/branding)
        <Outlet />  {/* Remix Outlet für Nested Route Rendering */}
      )}
    </Frame>
  );
}