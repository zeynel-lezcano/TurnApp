import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { MetaFunction, HeadersFunction } from "@remix-run/cloudflare";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

// Initialize Sentry on app startup
import { initSentry } from "./lib/sentry.server";
if (typeof window === "undefined") {
  initSentry();
}

export const meta: MetaFunction = () => [
  { charset: "utf-8" },
  { title: "turn2app Admin" },
  { name: "viewport", content: "width=device-width,initial-scale=1" },
];

export const headers: HeadersFunction = () => ({
  "ngrok-skip-browser-warning": "true",
  "X-Frame-Options": "ALLOWALL",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider i18n={{}} theme="light">
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}