import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

export const meta: MetaFunction = () => [
  { charset: "utf-8" },
  { title: "TurnApp Admin" },
  { name: "viewport", content: "width=device-width,initial-scale=1" },
];

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