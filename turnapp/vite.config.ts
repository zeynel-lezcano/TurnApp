import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
    }),
  ],
  test: {
    environment: "node",
    globals: true,
  },
  optimizeDeps: {
    include: ["crypto"],
  },
});