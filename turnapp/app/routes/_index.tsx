import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { prisma } from "~/lib/prisma.server";

export async function loader() {
  // Test DB connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    const shopCount = await prisma.shop.count();
    const recentShops = await prisma.shop.findMany({
      take: 5,
      orderBy: { installedAt: 'desc' },
      select: {
        shopDomain: true,
        installedAt: true,
        uninstalledAt: true,
      },
    });
    
    return json({
      message: "TurnApp - Shopify App Admin Dashboard",
      timestamp: new Date().toISOString(),
      dbStatus: "connected",
      shopCount,
      recentShops,
    });
  } catch (error) {
    return json({
      message: "TurnApp - Shopify App Admin Dashboard",
      timestamp: new Date().toISOString(),
      dbStatus: "error",
      shopCount: 0,
      recentShops: [],
    });
  }
}

export default function Index() {
  const { message, timestamp, dbStatus, shopCount, recentShops } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "20px" }}>
      <h1>{message}</h1>
      <p>Server Time: {timestamp}</p>
      <p>Database Status: {dbStatus}</p>
      <p>Registered Shops: {shopCount}</p>
      <p>Status: OAuth Flow Implemented ✅</p>
      
      <div style={{ marginTop: "30px" }}>
        <h3>Development Tools:</h3>
        <Link 
          to="/test/oauth"
          style={{ 
            padding: "8px 16px", 
            backgroundColor: "#007C3B", 
            color: "white", 
            textDecoration: "none",
            borderRadius: "4px",
            marginRight: "10px"
          }}
        >
          Test OAuth Flow
        </Link>
      </div>

      {recentShops.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Recent Shop Installations:</h3>
          <ul>
            {recentShops.map((shop) => (
              <li key={shop.shopDomain}>
                {shop.shopDomain} - 
                Installed: {new Date(shop.installedAt).toLocaleString()}
                {shop.uninstalledAt && ` (Uninstalled: ${new Date(shop.uninstalledAt).toLocaleString()})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}