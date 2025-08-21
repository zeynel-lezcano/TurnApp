var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
};

// node_modules/@remix-run/dev/dist/config/defaults/entry.server.node.tsx
var entry_server_node_exports = {};
__export(entry_server_node_exports, {
  default: () => handleRequest
});
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { jsxDEV } from "react/jsx-dev-runtime";
var ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  return userAgent ? "isbot" in isbotModule && typeof isbotModule.isbot == "function" ? isbotModule.isbot(userAgent) : "default" in isbotModule && typeof isbotModule.default == "function" ? isbotModule.default(userAgent) : !1 : !1;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = !1, { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsxDEV(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        },
        void 0,
        !1,
        {
          fileName: "node_modules/@remix-run/dev/dist/config/defaults/entry.server.node.tsx",
          lineNumber: 66,
          columnNumber: 7
        },
        this
      ),
      {
        onAllReady() {
          shellRendered = !0;
          let body = new PassThrough(), stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500, shellRendered && console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = !1, { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsxDEV(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        },
        void 0,
        !1,
        {
          fileName: "node_modules/@remix-run/dev/dist/config/defaults/entry.server.node.tsx",
          lineNumber: 116,
          columnNumber: 7
        },
        this
      ),
      {
        onShellReady() {
          shellRendered = !0;
          let body = new PassThrough(), stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500, shellRendered && console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  default: () => App,
  meta: () => meta
});
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import { jsxDEV as jsxDEV2 } from "react/jsx-dev-runtime";
var meta = () => [
  { charset: "utf-8" },
  { title: "TurnApp Admin" },
  { name: "viewport", content: "width=device-width,initial-scale=1" }
];
function App() {
  return /* @__PURE__ */ jsxDEV2("html", { lang: "en", children: [
    /* @__PURE__ */ jsxDEV2("head", { children: [
      /* @__PURE__ */ jsxDEV2(Meta, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 23,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Links, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 24,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 22,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV2("body", { children: [
      /* @__PURE__ */ jsxDEV2(AppProvider, { i18n: {}, theme: "light", children: /* @__PURE__ */ jsxDEV2(Outlet, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 28,
        columnNumber: 11
      }, this) }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 27,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(ScrollRestoration, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 30,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Scripts, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 31,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(LiveReload, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 32,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 26,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 21,
    columnNumber: 5
  }, this);
}

// app/routes/admin.branding.tsx
var admin_branding_exports = {};
__export(admin_branding_exports, {
  action: () => action,
  default: () => AdminBranding,
  loader: () => loader
});
import { json } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
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
import { jsxDEV as jsxDEV3 } from "react/jsx-dev-runtime";
async function loader({ request }) {
  let shop = new URL(request.url).searchParams.get("shop");
  if (!shop)
    throw new Response("Shop parameter required", { status: 400 });
  let brandingSettings = {
    brandName: shop.split(".")[0],
    // Default to shop name
    primaryColor: "#007C3B",
    // Shopify green default
    logoUrl: "",
    tagline: "Your mobile shopping experience"
  };
  return json({
    shop,
    brandingSettings
  });
}
async function action({ request }) {
  let formData = await request.formData(), shop = new URL(request.url).searchParams.get("shop");
  if (!shop)
    throw new Response("Shop parameter required", { status: 400 });
  let brandName = formData.get("brandName"), primaryColor = formData.get("primaryColor"), logoUrl = formData.get("logoUrl"), tagline = formData.get("tagline");
  return console.log("Saving branding settings:", { shop, brandName, primaryColor, logoUrl, tagline }), json({
    success: !0,
    message: "Branding settings saved successfully!"
  });
}
function AdminBranding() {
  let { shop, brandingSettings } = useLoaderData(), actionData = useActionData(), [brandName, setBrandName] = useState(brandingSettings.brandName), [primaryColor, setPrimaryColor] = useState(brandingSettings.primaryColor), [logoUrl, setLogoUrl] = useState(brandingSettings.logoUrl), [tagline, setTagline] = useState(brandingSettings.tagline), handleBrandNameChange = useCallback((value) => setBrandName(value), []), handleLogoUrlChange = useCallback((value) => setLogoUrl(value), []), handleTaglineChange = useCallback((value) => setTagline(value), []);
  return /* @__PURE__ */ jsxDEV3(
    Page,
    {
      title: "Branding Configuration",
      subtitle: "Customize your mobile app appearance",
      backAction: {
        url: "/admin"
      },
      children: /* @__PURE__ */ jsxDEV3(Layout, { children: [
        /* @__PURE__ */ jsxDEV3(Layout.Section, { children: [
          actionData?.success && /* @__PURE__ */ jsxDEV3(Banner, { tone: "success", onDismiss: () => {
          }, children: actionData.message }, void 0, !1, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 86,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV3(Card, { children: /* @__PURE__ */ jsxDEV3(Form, { method: "post", children: /* @__PURE__ */ jsxDEV3(FormLayout, { children: [
            /* @__PURE__ */ jsxDEV3(Text, { variant: "headingSm", as: "h3", children: "Basic Information" }, void 0, !1, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 94,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV3(
              TextField,
              {
                label: "App Name",
                value: brandName,
                onChange: handleBrandNameChange,
                name: "brandName",
                helpText: "This will be the name of your mobile app",
                autoComplete: "off"
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin.branding.tsx",
                lineNumber: 96,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV3(
              TextField,
              {
                label: "Tagline",
                value: tagline,
                onChange: handleTaglineChange,
                name: "tagline",
                helpText: "A short description for your mobile app",
                autoComplete: "off"
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin.branding.tsx",
                lineNumber: 105,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV3(Divider, {}, void 0, !1, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 114,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV3(Text, { variant: "headingSm", as: "h3", children: "Visual Design" }, void 0, !1, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 116,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV3(
              TextField,
              {
                label: "Primary Color",
                value: primaryColor,
                onChange: setPrimaryColor,
                name: "primaryColor",
                helpText: "Hex color code for your app's primary color",
                autoComplete: "off",
                prefix: "#",
                placeholder: "007C3B"
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin.branding.tsx",
                lineNumber: 118,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV3(
              TextField,
              {
                label: "Logo URL",
                value: logoUrl,
                onChange: handleLogoUrlChange,
                name: "logoUrl",
                helpText: "URL to your app logo (optional)",
                autoComplete: "off"
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin.branding.tsx",
                lineNumber: 129,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV3(InlineStack, { align: "end", children: /* @__PURE__ */ jsxDEV3(Button, { variant: "primary", submit: !0, children: "Save Settings" }, void 0, !1, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 139,
              columnNumber: 19
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 138,
              columnNumber: 17
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 93,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 92,
            columnNumber: 13
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 91,
            columnNumber: 11
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 84,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV3(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsxDEV3(Card, { children: /* @__PURE__ */ jsxDEV3("div", { style: { padding: "20px" }, children: [
          /* @__PURE__ */ jsxDEV3(Text, { variant: "headingSm", as: "h3", children: "Preview" }, void 0, !1, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 151,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV3("div", { style: { marginTop: "16px" }, children: /* @__PURE__ */ jsxDEV3(
            "div",
            {
              style: {
                padding: "20px",
                backgroundColor: primaryColor,
                color: "white",
                borderRadius: "8px",
                textAlign: "center"
              },
              children: [
                /* @__PURE__ */ jsxDEV3(Text, { variant: "headingLg", as: "h2", children: brandName || "Your App Name" }, void 0, !1, {
                  fileName: "app/routes/admin.branding.tsx",
                  lineNumber: 162,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV3(Text, { variant: "bodyMd", as: "p", children: tagline || "Your tagline here" }, void 0, !1, {
                  fileName: "app/routes/admin.branding.tsx",
                  lineNumber: 165,
                  columnNumber: 19
                }, this)
              ]
            },
            void 0,
            !0,
            {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 153,
              columnNumber: 17
            },
            this
          ) }, void 0, !1, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 152,
            columnNumber: 15
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 150,
          columnNumber: 13
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 149,
          columnNumber: 11
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 148,
          columnNumber: 9
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 83,
        columnNumber: 7
      }, this)
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin.branding.tsx",
      lineNumber: 76,
      columnNumber: 5
    },
    this
  );
}

// app/routes/auth.callback.tsx
var auth_callback_exports = {};
__export(auth_callback_exports, {
  loader: () => loader2
});
import { redirect } from "@remix-run/node";

// app/lib/shopify-auth.server.ts
import { createHmac, timingSafeEqual } from "crypto";
function verifyShopifyHmac(query, secret) {
  try {
    let params = query instanceof URLSearchParams ? query : new URLSearchParams(query), hmac = params.get("hmac");
    if (!hmac)
      return !1;
    params.delete("hmac"), params.delete("signature");
    let sortedParams = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&"), expectedHmac = createHmac("sha256", secret).update(sortedParams).digest("hex");
    return hmac.length !== expectedHmac.length ? !1 : timingSafeEqual(
      Buffer.from(hmac, "hex"),
      Buffer.from(expectedHmac, "hex")
    );
  } catch (error) {
    return console.error("HMAC verification error:", error), !1;
  }
}
function createOAuthUrl(shop, apiKey, scopes, redirectUri) {
  let params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes,
    redirect_uri: redirectUri,
    state: createNonce()
    // CSRF protection
  });
  return `https://${shop}.myshopify.com/admin/oauth/authorize?${params.toString()}`;
}
async function exchangeCodeForToken(shop, code, apiKey, apiSecret) {
  try {
    let response = await fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code
      })
    });
    return response.ok ? await response.json() : (console.error("Token exchange failed:", response.status, response.statusText), null);
  } catch (error) {
    return console.error("Token exchange error:", error), null;
  }
}
function createNonce() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// app/lib/prisma.server.ts
import { PrismaClient } from "@prisma/client";
var prisma;
global.__db__ || (global.__db__ = new PrismaClient()), prisma = global.__db__, prisma.$connect();

// app/routes/auth.callback.tsx
async function loader2({ request }) {
  let url = new URL(request.url), queryParams = Object.fromEntries(url.searchParams.entries()), { shop, code, hmac, state } = queryParams;
  if (!shop || !code || !hmac)
    throw new Response("Missing required OAuth parameters", { status: 400 });
  let shopDomain = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shopDomain))
    throw new Response("Invalid shop domain", { status: 400 });
  let apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret)
    throw new Response("Missing Shopify API secret", { status: 500 });
  if (!verifyShopifyHmac(url.searchParams, apiSecret))
    throw console.error("HMAC verification failed for shop:", shopDomain), new Response("Invalid HMAC signature", { status: 403 });
  let apiKey = process.env.SHOPIFY_API_KEY;
  if (!apiKey)
    throw new Response("Missing Shopify API key", { status: 500 });
  let tokenData = await exchangeCodeForToken(
    shopDomain,
    code,
    apiKey,
    apiSecret
  );
  if (!tokenData)
    throw new Response("Failed to exchange OAuth code for token", { status: 400 });
  try {
    let shop2 = await prisma.shop.upsert({
      where: { shopDomain },
      update: {
        accessTokenEnc: tokenData.access_token,
        // TODO: Encrypt this
        uninstalledAt: null,
        // Clear uninstall timestamp if re-installing
        updatedAt: /* @__PURE__ */ new Date()
      },
      create: {
        shopDomain,
        accessTokenEnc: tokenData.access_token,
        // TODO: Encrypt this
        installedAt: /* @__PURE__ */ new Date(),
        settings: JSON.stringify({})
      }
    });
    return console.log("Shop installed successfully:", shopDomain), redirect(`https://${shopDomain}/admin/apps/${apiKey}`);
  } catch (error) {
    throw console.error("Database error during OAuth callback:", error), new Response("Internal server error", { status: 500 });
  }
}

// app/routes/auth.install.tsx
var auth_install_exports = {};
__export(auth_install_exports, {
  loader: () => loader3
});
import { redirect as redirect2 } from "@remix-run/node";
async function loader3({ request }) {
  let shop = new URL(request.url).searchParams.get("shop");
  if (!shop)
    throw new Response("Missing shop parameter", { status: 400 });
  let shopDomain = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shopDomain))
    throw new Response("Invalid shop domain", { status: 400 });
  let apiKey = process.env.SHOPIFY_API_KEY, scopes = process.env.SCOPES, redirectUri = `${process.env.APP_URL}/auth/callback`;
  if (!apiKey || !scopes)
    throw new Response("Missing Shopify configuration", { status: 500 });
  let authUrl = createOAuthUrl(shopDomain, apiKey, scopes, redirectUri);
  return redirect2(authUrl);
}

// app/routes/test.oauth.tsx
var test_oauth_exports = {};
__export(test_oauth_exports, {
  default: () => TestOAuth,
  loader: () => loader4
});
import { json as json2 } from "@remix-run/node";
import { useLoaderData as useLoaderData2, Link } from "@remix-run/react";
import { jsxDEV as jsxDEV4 } from "react/jsx-dev-runtime";
async function loader4() {
  let testShop = "zeytestshop", installUrl = `/auth/install?shop=${testShop}.myshopify.com`;
  return json2({
    testShop,
    installUrl,
    apiKey: process.env.SHOPIFY_API_KEY || "NOT_SET",
    appUrl: process.env.APP_URL || "NOT_SET"
  });
}
function TestOAuth() {
  let { testShop, installUrl, apiKey, appUrl } = useLoaderData2();
  return /* @__PURE__ */ jsxDEV4("div", { style: { fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "20px" }, children: [
    /* @__PURE__ */ jsxDEV4("h1", { children: "OAuth Test Page" }, void 0, !1, {
      fileName: "app/routes/test.oauth.tsx",
      lineNumber: 21,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV4("div", { style: { marginBottom: "20px" }, children: [
      /* @__PURE__ */ jsxDEV4("h3", { children: "Configuration:" }, void 0, !1, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 24,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4("p", { children: [
        "Test Shop: ",
        testShop,
        ".myshopify.com"
      ] }, void 0, !0, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 25,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4("p", { children: [
        "API Key: ",
        apiKey
      ] }, void 0, !0, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 26,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4("p", { children: [
        "App URL: ",
        appUrl
      ] }, void 0, !0, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 27,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/test.oauth.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV4("div", { style: { marginBottom: "20px" }, children: [
      /* @__PURE__ */ jsxDEV4("h3", { children: "Test OAuth Flow:" }, void 0, !1, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 31,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4(
        Link,
        {
          to: installUrl,
          style: {
            padding: "10px 20px",
            backgroundColor: "#007C3B",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px"
          },
          children: [
            "Install App to ",
            testShop,
            ".myshopify.com"
          ]
        },
        void 0,
        !0,
        {
          fileName: "app/routes/test.oauth.tsx",
          lineNumber: 32,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/test.oauth.tsx",
      lineNumber: 30,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV4("div", { style: { marginTop: "20px", fontSize: "14px", color: "#666" }, children: [
      /* @__PURE__ */ jsxDEV4("p", { children: "\u26A0\uFE0F Make sure to:" }, void 0, !1, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 47,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4("ul", { children: [
        /* @__PURE__ */ jsxDEV4("li", { children: "Set SHOPIFY_API_KEY and SHOPIFY_API_SECRET in .env" }, void 0, !1, {
          fileName: "app/routes/test.oauth.tsx",
          lineNumber: 49,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV4("li", { children: "Update APP_URL with your ngrok URL" }, void 0, !1, {
          fileName: "app/routes/test.oauth.tsx",
          lineNumber: 50,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV4("li", { children: "Add the callback URL to your Shopify Partner Dashboard" }, void 0, !1, {
          fileName: "app/routes/test.oauth.tsx",
          lineNumber: 51,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 48,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/test.oauth.tsx",
      lineNumber: 46,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/test.oauth.tsx",
    lineNumber: 20,
    columnNumber: 5
  }, this);
}

// app/routes/_index.tsx
var index_exports = {};
__export(index_exports, {
  default: () => Index,
  loader: () => loader5
});
import { json as json3 } from "@remix-run/node";
import { useLoaderData as useLoaderData3, Link as Link2 } from "@remix-run/react";
import { jsxDEV as jsxDEV5 } from "react/jsx-dev-runtime";
async function loader5() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    let shopCount = await prisma.shop.count(), recentShops = await prisma.shop.findMany({
      take: 5,
      orderBy: { installedAt: "desc" },
      select: {
        shopDomain: !0,
        installedAt: !0,
        uninstalledAt: !0
      }
    });
    return json3({
      message: "TurnApp - Shopify App Admin Dashboard",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      dbStatus: "connected",
      shopCount,
      recentShops
    });
  } catch {
    return json3({
      message: "TurnApp - Shopify App Admin Dashboard",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      dbStatus: "error",
      shopCount: 0,
      recentShops: []
    });
  }
}
function Index() {
  let { message, timestamp, dbStatus, shopCount, recentShops } = useLoaderData3();
  return /* @__PURE__ */ jsxDEV5("div", { style: { fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "20px" }, children: [
    /* @__PURE__ */ jsxDEV5("h1", { children: message }, void 0, !1, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 43,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV5("p", { children: [
      "Server Time: ",
      timestamp
    ] }, void 0, !0, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 44,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV5("p", { children: [
      "Database Status: ",
      dbStatus
    ] }, void 0, !0, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 45,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV5("p", { children: [
      "Registered Shops: ",
      shopCount
    ] }, void 0, !0, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 46,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV5("p", { children: "Status: OAuth Flow Implemented \u2705" }, void 0, !1, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 47,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV5("div", { style: { marginTop: "30px" }, children: [
      /* @__PURE__ */ jsxDEV5("h3", { children: "Development Tools:" }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 50,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV5(
        Link2,
        {
          to: "/test/oauth",
          style: {
            padding: "8px 16px",
            backgroundColor: "#007C3B",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            marginRight: "10px"
          },
          children: "Test OAuth Flow"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/_index.tsx",
          lineNumber: 51,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this),
    recentShops.length > 0 && /* @__PURE__ */ jsxDEV5("div", { style: { marginTop: "30px" }, children: [
      /* @__PURE__ */ jsxDEV5("h3", { children: "Recent Shop Installations:" }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 68,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV5("ul", { children: recentShops.map((shop) => /* @__PURE__ */ jsxDEV5("li", { children: [
        shop.shopDomain,
        " - Installed: ",
        new Date(shop.installedAt).toLocaleString(),
        shop.uninstalledAt && ` (Uninstalled: ${new Date(shop.uninstalledAt).toLocaleString()})`
      ] }, shop.shopDomain, !0, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 71,
        columnNumber: 15
      }, this)) }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 69,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 67,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 42,
    columnNumber: 5
  }, this);
}

// app/routes/admin.tsx
var admin_exports = {};
__export(admin_exports, {
  default: () => AdminLayout,
  loader: () => loader6
});
import { json as json4 } from "@remix-run/node";
import { useLoaderData as useLoaderData4, Outlet as Outlet2, useLocation, Link as Link3 } from "@remix-run/react";
import {
  Frame,
  TopBar,
  Navigation,
  Layout as Layout2,
  Page as Page2,
  Text as Text2,
  Card as Card2,
  Button as Button2
} from "@shopify/polaris";
import { useState as useState2, useCallback as useCallback2 } from "react";
import { jsxDEV as jsxDEV6 } from "react/jsx-dev-runtime";
async function loader6({ request }) {
  let url = new URL(request.url), shop = url.searchParams.get("shop"), host = url.searchParams.get("host");
  if (!shop)
    throw new Response("Shop parameter required", { status: 400 });
  return json4({
    shop,
    host,
    appBridgeConfig: {
      apiKey: process.env.SHOPIFY_API_KEY || "",
      shop,
      host: host || ""
    }
  });
}
function AdminLayout() {
  let { shop } = useLoaderData4(), location = useLocation(), [mobileNavigationActive, setMobileNavigationActive] = useState2(!1), toggleMobileNavigationActive = useCallback2(
    () => setMobileNavigationActive((mobileNavigationActive2) => !mobileNavigationActive2),
    []
  ), navigationMarkup = /* @__PURE__ */ jsxDEV6(Navigation, { location: location.pathname, children: /* @__PURE__ */ jsxDEV6(
    Navigation.Section,
    {
      items: [
        {
          url: "/admin",
          label: "Overview",
          icon: "HomeIcon",
          selected: location.pathname === "/admin"
        },
        {
          url: "/admin/branding",
          label: "Branding",
          icon: "ColorIcon",
          selected: location.pathname === "/admin/branding"
        }
      ]
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin.tsx",
      lineNumber: 50,
      columnNumber: 7
    },
    this
  ) }, void 0, !1, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 49,
    columnNumber: 5
  }, this), topBarMarkup = /* @__PURE__ */ jsxDEV6(
    TopBar,
    {
      showNavigationToggle: !0,
      onNavigationToggle: toggleMobileNavigationActive
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin.tsx",
      lineNumber: 70,
      columnNumber: 5
    },
    this
  ), currentPath = location.pathname;
  return /* @__PURE__ */ jsxDEV6(
    Frame,
    {
      topBar: topBarMarkup,
      navigation: navigationMarkup,
      showMobileNavigation: mobileNavigationActive,
      onNavigationDismiss: toggleMobileNavigationActive,
      children: currentPath === "/admin" || currentPath === "/admin/" ? /* @__PURE__ */ jsxDEV6(Page2, { title: "TurnApp Overview", children: /* @__PURE__ */ jsxDEV6(Layout2, { children: [
        /* @__PURE__ */ jsxDEV6(Layout2.Section, { children: /* @__PURE__ */ jsxDEV6(Card2, { children: /* @__PURE__ */ jsxDEV6("div", { style: { padding: "20px" }, children: [
          /* @__PURE__ */ jsxDEV6(Text2, { variant: "headingMd", as: "h2", children: "Welcome to TurnApp" }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 92,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV6(Text2, { variant: "bodyMd", as: "p", tone: "subdued", children: "Transform your Shopify store into a mobile shopping app" }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 93,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV6("div", { style: { marginTop: "20px" }, children: /* @__PURE__ */ jsxDEV6(Text2, { variant: "headingSm", as: "h3", children: [
            "Shop: ",
            shop
          ] }, void 0, !0, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 97,
            columnNumber: 21
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 96,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV6("div", { style: { marginTop: "20px" }, children: /* @__PURE__ */ jsxDEV6(Link3, { to: "/admin/branding", children: /* @__PURE__ */ jsxDEV6(Button2, { variant: "primary", children: "Configure Branding" }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 101,
            columnNumber: 23
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 100,
            columnNumber: 21
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 99,
            columnNumber: 19
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 91,
          columnNumber: 17
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 90,
          columnNumber: 15
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 89,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV6(Layout2.Section, { variant: "oneThird", children: /* @__PURE__ */ jsxDEV6(Card2, { children: /* @__PURE__ */ jsxDEV6("div", { style: { padding: "20px" }, children: [
          /* @__PURE__ */ jsxDEV6(Text2, { variant: "headingSm", as: "h3", children: "Quick Stats" }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 111,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV6("div", { style: { marginTop: "12px" }, children: [
            /* @__PURE__ */ jsxDEV6(Text2, { variant: "bodyMd", as: "p", children: "Status: Active" }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 113,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV6(Text2, { variant: "bodyMd", as: "p", children: "App Version: 1.0.0" }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 114,
              columnNumber: 21
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 112,
            columnNumber: 19
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 110,
          columnNumber: 17
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 109,
          columnNumber: 15
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 108,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 88,
        columnNumber: 11
      }, this) }, void 0, !1, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 87,
        columnNumber: 9
      }, this) : /* @__PURE__ */ jsxDEV6(Outlet2, {}, void 0, !1, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 122,
        columnNumber: 9
      }, this)
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin.tsx",
      lineNumber: 80,
      columnNumber: 5
    },
    this
  );
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-VWERPWTD.js", imports: ["/build/_shared/chunk-XC6BC2BP.js", "/build/_shared/chunk-D3JE7QQY.js", "/build/_shared/chunk-ALN5UVCC.js", "/build/_shared/chunk-UWV35TSL.js", "/build/_shared/chunk-56LDNGDG.js", "/build/_shared/chunk-PMI65YMG.js", "/build/_shared/chunk-2Q7FBYOG.js", "/build/_shared/chunk-PNG5AS42.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-2W5VLWBC.js", imports: ["/build/_shared/chunk-ANTKSAN7.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-AJE55LNB.js", imports: ["/build/_shared/chunk-G7CHZRZX.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/admin": { id: "routes/admin", parentId: "root", path: "admin", index: void 0, caseSensitive: void 0, module: "/build/routes/admin-YWHCOTUA.js", imports: ["/build/_shared/chunk-G7CHZRZX.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/admin.branding": { id: "routes/admin.branding", parentId: "routes/admin", path: "branding", index: void 0, caseSensitive: void 0, module: "/build/routes/admin.branding-MA6NY6DG.js", imports: ["/build/_shared/chunk-ANTKSAN7.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/auth.callback": { id: "routes/auth.callback", parentId: "root", path: "auth/callback", index: void 0, caseSensitive: void 0, module: "/build/routes/auth.callback-HTHTBQTT.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/auth.install": { id: "routes/auth.install", parentId: "root", path: "auth/install", index: void 0, caseSensitive: void 0, module: "/build/routes/auth.install-GWWDNMQD.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/test.oauth": { id: "routes/test.oauth", parentId: "root", path: "test/oauth", index: void 0, caseSensitive: void 0, module: "/build/routes/test.oauth-FN45O3XH.js", imports: ["/build/_shared/chunk-G7CHZRZX.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "10eb2adb", hmr: { runtime: "/build/_shared/chunk-ALN5UVCC.js", timestamp: 1755726634235 }, url: "/build/manifest-10EB2ADB.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "development", assetsBuildDirectory = "public/build", future = { v3_fetcherPersist: !1, v3_relativeSplatPath: !1, v3_throwAbortReason: !1, v3_routeConfig: !1, v3_singleFetch: !1, v3_lazyRouteDiscovery: !1, unstable_optimizeDeps: !1 }, publicPath = "/build/", entry = { module: entry_server_node_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/admin.branding": {
    id: "routes/admin.branding",
    parentId: "routes/admin",
    path: "branding",
    index: void 0,
    caseSensitive: void 0,
    module: admin_branding_exports
  },
  "routes/auth.callback": {
    id: "routes/auth.callback",
    parentId: "root",
    path: "auth/callback",
    index: void 0,
    caseSensitive: void 0,
    module: auth_callback_exports
  },
  "routes/auth.install": {
    id: "routes/auth.install",
    parentId: "root",
    path: "auth/install",
    index: void 0,
    caseSensitive: void 0,
    module: auth_install_exports
  },
  "routes/test.oauth": {
    id: "routes/test.oauth",
    parentId: "root",
    path: "test/oauth",
    index: void 0,
    caseSensitive: void 0,
    module: test_oauth_exports
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: index_exports
  },
  "routes/admin": {
    id: "routes/admin",
    parentId: "root",
    path: "admin",
    index: void 0,
    caseSensitive: void 0,
    module: admin_exports
  }
};
export {
  assets_manifest_default as assets,
  assetsBuildDirectory,
  entry,
  future,
  mode,
  publicPath,
  routes
};
//# sourceMappingURL=index.js.map
