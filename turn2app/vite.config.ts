import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { cloudflareDevProxyVitePlugin as remixCloudflareDevProxy } from "@remix-run/dev";

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy(),
    remix({
      ignoredRouteFiles: ["**/.*"],
      future: {
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_singleFetch: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
  server: {
    host: "0.0.0.0", 
    port: 4000,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "1af327b1d169.ngrok-free.app",
      ".ngrok-free.app",
      ".ngrok.io"
    ],
    headers: {
      "ngrok-skip-browser-warning": "true"
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
  optimizeDeps: {
    include: ["crypto"],
  },
});