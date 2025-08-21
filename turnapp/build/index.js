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

// app/routes/webhooks.app_uninstalled.tsx
var webhooks_app_uninstalled_exports = {};
__export(webhooks_app_uninstalled_exports, {
  action: () => action
});
import { json } from "@remix-run/node";

// app/lib/webhooks.server.ts
import { createHmac } from "node:crypto";
function verifyWebhookHmac(body, hmacHeader, secret) {
  let bodyString = typeof body == "string" ? body : body.toString("utf8"), calculatedHmac = createHmac("sha256", secret).update(bodyString, "utf8").digest("base64"), providedHmac = hmacHeader.replace("sha256=", "");
  return timingSafeEqual(
    Buffer.from(calculatedHmac, "base64"),
    Buffer.from(providedHmac, "base64")
  );
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length)
    return !1;
  let result = 0;
  for (let i = 0; i < a.length; i++)
    result |= a[i] ^ b[i];
  return result === 0;
}
async function registerWebhooks(shop, accessToken, baseUrl) {
  let webhooks = [
    {
      topic: "app/uninstalled",
      address: `${baseUrl}/webhooks/app_uninstalled`,
      format: "json"
    },
    {
      topic: "products/update",
      address: `${baseUrl}/webhooks/products_update`,
      format: "json"
    }
  ];
  for (let webhook of webhooks)
    try {
      let response = await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken
        },
        body: JSON.stringify({ webhook })
      });
      if (response.ok) {
        let result = await response.json();
        console.log(`Webhook registered: ${webhook.topic}`, result.webhook?.id);
      } else {
        let error = await response.text();
        console.error(`Failed to register webhook ${webhook.topic}:`, error);
      }
    } catch (error) {
      console.error(`Error registering webhook ${webhook.topic}:`, error);
    }
}

// app/lib/prisma.server.ts
import { PrismaClient } from "@prisma/client";
var prisma;
global.__db__ || (global.__db__ = new PrismaClient()), prisma = global.__db__, prisma.$connect();

// app/routes/webhooks.app_uninstalled.tsx
async function action({ request }) {
  if (request.method !== "POST")
    return json({ error: "Method not allowed" }, { status: 405 });
  let hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256"), shopDomain = request.headers.get("X-Shopify-Shop-Domain");
  if (!hmacHeader || !shopDomain)
    return console.error("Missing required webhook headers"), json({ error: "Missing headers" }, { status: 400 });
  let body = await request.text(), apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret)
    return console.error("Missing Shopify API secret"), json({ error: "Server configuration error" }, { status: 500 });
  if (!verifyWebhookHmac(body, hmacHeader, apiSecret))
    return console.error("Webhook HMAC verification failed for shop:", shopDomain), json({ error: "Invalid signature" }, { status: 403 });
  try {
    let payload = JSON.parse(body);
    console.log("App uninstalled webhook received:", {
      shop: shopDomain,
      domain: payload.domain,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    let updatedShop = await prisma.shop.update({
      where: { shopDomain },
      data: {
        uninstalledAt: /* @__PURE__ */ new Date()
        // Keep the record for potential re-installation
        // accessTokenEnc will be overwritten on re-install
      }
    });
    return console.log("Shop uninstalled successfully:", {
      shopDomain,
      installedAt: updatedShop.installedAt,
      uninstalledAt: updatedShop.uninstalledAt
    }), json({ status: "ok" }, { status: 200 });
  } catch (error) {
    return console.error("Error processing app uninstall webhook:", error), error instanceof SyntaxError ? json({ status: "ok" }, { status: 200 }) : json({ error: "Internal error" }, { status: 500 });
  }
}

// app/routes/webhooks.products_update.tsx
var webhooks_products_update_exports = {};
__export(webhooks_products_update_exports, {
  action: () => action2
});
import { json as json2 } from "@remix-run/node";
async function action2({ request }) {
  if (request.method !== "POST")
    return json2({ error: "Method not allowed" }, { status: 405 });
  let hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256"), shopDomain = request.headers.get("X-Shopify-Shop-Domain");
  if (!hmacHeader || !shopDomain)
    return console.error("Missing required webhook headers"), json2({ error: "Missing headers" }, { status: 400 });
  let body = await request.text(), apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret)
    return console.error("Missing Shopify API secret"), json2({ error: "Server configuration error" }, { status: 500 });
  if (!verifyWebhookHmac(body, hmacHeader, apiSecret))
    return console.error("Webhook HMAC verification failed for shop:", shopDomain), json2({ error: "Invalid signature" }, { status: 403 });
  try {
    let payload = JSON.parse(body);
    return console.log("Product updated webhook received:", {
      shop: shopDomain,
      productId: payload.id,
      productTitle: payload.title,
      updatedAt: payload.updated_at,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }), console.log("Product cache invalidated for shop:", shopDomain), json2({ status: "ok" }, { status: 200 });
  } catch (error) {
    return console.error("Error processing products update webhook:", error), error instanceof SyntaxError ? json2({ status: "ok" }, { status: 200 }) : json2({ error: "Internal error" }, { status: 500 });
  }
}

// app/routes/admin.branding.tsx
var admin_branding_exports = {};
__export(admin_branding_exports, {
  action: () => action3,
  default: () => AdminBranding,
  loader: () => loader
});
import { json as json3 } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useFetcher } from "@remix-run/react";

// app/lib/session.server.ts
import { createHmac as createHmac2 } from "node:crypto";
function decodeJWT(token) {
  try {
    let parts = token.split(".");
    if (parts.length !== 3)
      throw new Error("Invalid JWT format");
    let payload = parts[1], decoded = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(decoded);
  } catch (error) {
    return console.error("JWT decode failed:", error), null;
  }
}
function verifyJWTSignature(token, secret) {
  try {
    let parts = token.split(".");
    if (parts.length !== 3)
      return !1;
    let [header, payload, signature] = parts, data = `${header}.${payload}`, expectedSignature = createHmac2("sha256", secret).update(data).digest("base64url");
    return signature === expectedSignature;
  } catch (error) {
    return console.error("JWT signature verification failed:", error), !1;
  }
}
function verifySessionToken(token) {
  try {
    let apiSecret = process.env.SHOPIFY_API_SECRET;
    if (!apiSecret)
      return console.error("Missing SHOPIFY_API_SECRET"), null;
    if (!verifyJWTSignature(token, apiSecret))
      return console.error("Session token signature verification failed"), null;
    let decoded = decodeJWT(token);
    return decoded ? !decoded.iss || !decoded.dest || !decoded.aud ? (console.error("Invalid session token: missing required fields"), null) : decoded.iss !== decoded.dest ? (console.error("Session token: iss and dest don't match"), null) : decoded.exp && decoded.exp < Math.floor(Date.now() / 1e3) ? (console.error("Session token expired"), null) : decoded : null;
  } catch (error) {
    return console.error("Session token verification failed:", error), null;
  }
}
function createSessionMiddleware() {
  return async (request) => {
    let sessionTokenHeader = request.headers.get("X-Shopify-Session-Token");
    if (!sessionTokenHeader)
      return null;
    let session = verifySessionToken(sessionTokenHeader);
    return session ? {
      shop: session.iss,
      session
    } : null;
  };
}
async function getOptionalSession(request) {
  return await createSessionMiddleware()(request);
}

// app/routes/admin.branding.tsx
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
import { useState, useCallback } from "react";
import { ImageIcon } from "@shopify/polaris-icons";
import { jsxDEV as jsxDEV3 } from "react/jsx-dev-runtime";
async function loader({ request }) {
  let sessionContext = await getOptionalSession(request), shop;
  if (sessionContext)
    shop = sessionContext.shop;
  else {
    let shopParam = new URL(request.url).searchParams.get("shop");
    if (!shopParam)
      throw new Response("Unauthorized - Missing session token or shop parameter", { status: 401 });
    shop = shopParam;
  }
  try {
    let configUrl = new URL("/api/config", request.url);
    configUrl.searchParams.set("shop", shop);
    let configResponse = await fetch(configUrl.toString()), configData = await configResponse.json();
    if (!configResponse.ok)
      throw new Error(configData.error || "Failed to load config");
    return json3({
      shop,
      brandingSettings: configData.branding
    });
  } catch (error) {
    console.error("Failed to load branding settings:", error);
    let brandingSettings = {
      brandName: shop.split(".")[0],
      primaryColor: "#007C3B",
      logoUrl: "",
      tagline: "Your mobile shopping experience"
    };
    return json3({
      shop,
      brandingSettings
    });
  }
}
async function action3({ request }) {
  let sessionContext = await getOptionalSession(request), shop;
  if (sessionContext)
    shop = sessionContext.shop;
  else {
    let shopParam = new URL(request.url).searchParams.get("shop");
    if (!shopParam)
      throw new Response("Unauthorized - Missing session token or shop parameter", { status: 401 });
    shop = shopParam;
  }
  try {
    let settingsUrl = new URL("/api/settings", request.url);
    settingsUrl.searchParams.set("shop", shop);
    let formData = await request.formData(), settingsResponse = await fetch(settingsUrl.toString(), {
      method: "POST",
      body: formData
    }), settingsData = await settingsResponse.json();
    if (!settingsResponse.ok)
      throw new Error(settingsData.error || "Failed to save settings");
    return json3(settingsData);
  } catch (error) {
    return console.error("Failed to save branding settings:", error), json3({
      error: error instanceof Error ? error.message : "Failed to save settings"
    }, { status: 500 });
  }
}
function AdminBranding() {
  let { shop, brandingSettings } = useLoaderData(), actionData = useActionData(), uploadFetcher = useFetcher(), [brandName, setBrandName] = useState(brandingSettings.brandName), [primaryColor, setPrimaryColor] = useState(brandingSettings.primaryColor), [logoUrl, setLogoUrl] = useState(brandingSettings.logoUrl), [tagline, setTagline] = useState(brandingSettings.tagline), [uploadedFile, setUploadedFile] = useState(null), handleBrandNameChange = useCallback((value) => setBrandName(value), []), handleLogoUrlChange = useCallback((value) => setLogoUrl(value), []), handleTaglineChange = useCallback((value) => setTagline(value), []), handleDropZoneDrop = useCallback((files) => {
    let file = files[0];
    if (file) {
      setUploadedFile(file);
      let formData = new FormData();
      formData.append("file", file), formData.append("kind", "logo"), uploadFetcher.submit(formData, {
        method: "POST",
        action: `/api/upload?shop=${shop}`,
        encType: "multipart/form-data"
      });
    }
  }, [shop, uploadFetcher]), uploadData = uploadFetcher.data;
  return uploadData?.success && uploadData.asset?.url && uploadData.asset.url !== logoUrl && setLogoUrl(uploadData.asset.url), /* @__PURE__ */ jsxDEV3(
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
            lineNumber: 179,
            columnNumber: 13
          }, this),
          actionData?.error && /* @__PURE__ */ jsxDEV3(Banner, { tone: "critical", onDismiss: () => {
          }, children: actionData.error }, void 0, !1, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 184,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV3(Card, { children: /* @__PURE__ */ jsxDEV3(Form, { method: "post", children: /* @__PURE__ */ jsxDEV3(FormLayout, { children: [
            /* @__PURE__ */ jsxDEV3(Text, { variant: "headingSm", as: "h3", children: "Basic Information" }, void 0, !1, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 192,
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
                lineNumber: 194,
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
                lineNumber: 203,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV3(Divider, {}, void 0, !1, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 212,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV3(Text, { variant: "headingSm", as: "h3", children: "Visual Design" }, void 0, !1, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 214,
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
                lineNumber: 216,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV3("div", { children: [
              /* @__PURE__ */ jsxDEV3(Text, { variant: "bodyMd", as: "p", fontWeight: "medium", children: "Logo Upload" }, void 0, !1, {
                fileName: "app/routes/admin.branding.tsx",
                lineNumber: 228,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV3("div", { style: { marginTop: "8px" }, children: /* @__PURE__ */ jsxDEV3(DropZone, { onDrop: handleDropZoneDrop, accept: "image/*", type: "image", children: uploadedFile ? /* @__PURE__ */ jsxDEV3(BlockStack, { gap: "200", children: [
                /* @__PURE__ */ jsxDEV3(
                  Thumbnail,
                  {
                    source: URL.createObjectURL(uploadedFile),
                    alt: uploadedFile.name,
                    size: "large"
                  },
                  void 0,
                  !1,
                  {
                    fileName: "app/routes/admin.branding.tsx",
                    lineNumber: 233,
                    columnNumber: 27
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV3(Text, { variant: "bodyMd", as: "p", alignment: "center", children: uploadedFile.name }, void 0, !1, {
                  fileName: "app/routes/admin.branding.tsx",
                  lineNumber: 238,
                  columnNumber: 27
                }, this),
                uploadFetcher.state === "submitting" && /* @__PURE__ */ jsxDEV3(Text, { variant: "bodyMd", as: "p", alignment: "center", children: "Uploading..." }, void 0, !1, {
                  fileName: "app/routes/admin.branding.tsx",
                  lineNumber: 242,
                  columnNumber: 29
                }, this),
                uploadFetcher.data?.success && /* @__PURE__ */ jsxDEV3(Text, { variant: "bodyMd", as: "p", alignment: "center", tone: "success", children: "Upload successful!" }, void 0, !1, {
                  fileName: "app/routes/admin.branding.tsx",
                  lineNumber: 247,
                  columnNumber: 29
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/admin.branding.tsx",
                lineNumber: 232,
                columnNumber: 25
              }, this) : logoUrl ? /* @__PURE__ */ jsxDEV3(BlockStack, { gap: "200", children: [
                /* @__PURE__ */ jsxDEV3(
                  Thumbnail,
                  {
                    source: logoUrl,
                    alt: "Current logo",
                    size: "large"
                  },
                  void 0,
                  !1,
                  {
                    fileName: "app/routes/admin.branding.tsx",
                    lineNumber: 254,
                    columnNumber: 27
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV3(Text, { variant: "bodyMd", as: "p", alignment: "center", children: "Current logo" }, void 0, !1, {
                  fileName: "app/routes/admin.branding.tsx",
                  lineNumber: 259,
                  columnNumber: 27
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/admin.branding.tsx",
                lineNumber: 253,
                columnNumber: 25
              }, this) : /* @__PURE__ */ jsxDEV3(BlockStack, { gap: "200", children: [
                /* @__PURE__ */ jsxDEV3(Icon, { source: ImageIcon, tone: "subdued" }, void 0, !1, {
                  fileName: "app/routes/admin.branding.tsx",
                  lineNumber: 265,
                  columnNumber: 27
                }, this),
                /* @__PURE__ */ jsxDEV3(Text, { variant: "bodyMd", as: "p", alignment: "center", children: "Drop logo here or click to upload" }, void 0, !1, {
                  fileName: "app/routes/admin.branding.tsx",
                  lineNumber: 266,
                  columnNumber: 27
                }, this),
                /* @__PURE__ */ jsxDEV3(Text, { variant: "bodyMd", as: "p", alignment: "center", tone: "subdued", children: "Supports JPG, PNG, WebP, SVG (max 2MB)" }, void 0, !1, {
                  fileName: "app/routes/admin.branding.tsx",
                  lineNumber: 269,
                  columnNumber: 27
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/admin.branding.tsx",
                lineNumber: 264,
                columnNumber: 25
              }, this) }, void 0, !1, {
                fileName: "app/routes/admin.branding.tsx",
                lineNumber: 230,
                columnNumber: 21
              }, this) }, void 0, !1, {
                fileName: "app/routes/admin.branding.tsx",
                lineNumber: 229,
                columnNumber: 19
              }, this),
              uploadFetcher.data?.error && /* @__PURE__ */ jsxDEV3(Banner, { tone: "critical", onDismiss: () => {
              }, children: uploadFetcher.data?.error || "Upload error" }, void 0, !1, {
                fileName: "app/routes/admin.branding.tsx",
                lineNumber: 277,
                columnNumber: 21
              }, this)
            ] }, void 0, !0, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 227,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV3(
              TextField,
              {
                label: "Logo URL (Alternative)",
                value: logoUrl,
                onChange: handleLogoUrlChange,
                name: "logoUrl",
                helpText: "Or provide a direct URL to your logo",
                autoComplete: "off"
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin.branding.tsx",
                lineNumber: 283,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV3(InlineStack, { align: "end", children: /* @__PURE__ */ jsxDEV3(Button, { variant: "primary", submit: !0, children: "Save Settings" }, void 0, !1, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 293,
              columnNumber: 19
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 292,
              columnNumber: 17
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 191,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 190,
            columnNumber: 13
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 189,
            columnNumber: 11
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 177,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV3(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsxDEV3(Card, { children: /* @__PURE__ */ jsxDEV3("div", { style: { padding: "20px" }, children: [
          /* @__PURE__ */ jsxDEV3(Text, { variant: "headingSm", as: "h3", children: "Preview" }, void 0, !1, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 305,
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
                  lineNumber: 316,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV3(Text, { variant: "bodyMd", as: "p", children: tagline || "Your tagline here" }, void 0, !1, {
                  fileName: "app/routes/admin.branding.tsx",
                  lineNumber: 319,
                  columnNumber: 19
                }, this)
              ]
            },
            void 0,
            !0,
            {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 307,
              columnNumber: 17
            },
            this
          ) }, void 0, !1, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 306,
            columnNumber: 15
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 304,
          columnNumber: 13
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 303,
          columnNumber: 11
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 302,
          columnNumber: 9
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 176,
        columnNumber: 7
      }, this)
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin.branding.tsx",
      lineNumber: 169,
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
import { createHmac as createHmac3, timingSafeEqual as timingSafeEqual2 } from "crypto";
function verifyShopifyHmac(query, secret) {
  try {
    let params = query instanceof URLSearchParams ? query : new URLSearchParams(query), hmac = params.get("hmac");
    if (!hmac)
      return !1;
    params.delete("hmac"), params.delete("signature");
    let sortedParams = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&"), expectedHmac = createHmac3("sha256", secret).update(sortedParams).digest("hex");
    return hmac.length !== expectedHmac.length ? !1 : timingSafeEqual2(
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

// app/lib/crypto.server.ts
import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync, createHmac as createHmac4 } from "node:crypto";
var ALGORITHM = "aes-256-cbc", IV_LENGTH = 16, KEY_LENGTH = 32, HMAC_LENGTH = 32;
function getEncryptionKey() {
  let envKey = process.env.ENCRYPTION_KEY;
  if (envKey) {
    if (envKey.length === 64)
      return Buffer.from(envKey, "hex");
    {
      let salt2 = Buffer.from("turnapp-static-salt-v1", "utf8");
      return pbkdf2Sync(envKey, salt2, 1e5, KEY_LENGTH, "sha256");
    }
  }
  let fallbackSeed = "development-turnapp-dev-key-v1", salt = Buffer.from("dev-salt-turnapp", "utf8");
  return pbkdf2Sync(fallbackSeed, salt, 1e4, KEY_LENGTH, "sha256");
}
function encryptToken(plaintext) {
  if (!plaintext || plaintext.length === 0)
    throw new Error("Cannot encrypt empty token");
  try {
    let key = getEncryptionKey(), iv = randomBytes(IV_LENGTH), cipher = createCipheriv(ALGORITHM, key, iv), encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    let hmac = createHmac4("sha256", key);
    hmac.update(iv), hmac.update(Buffer.from(encrypted, "hex"));
    let authTag = hmac.digest();
    return iv.toString("hex") + encrypted + authTag.toString("hex");
  } catch (error) {
    throw console.error("Encryption failed:", error), new Error("Failed to encrypt token");
  }
}
function decryptToken(ciphertext) {
  try {
    if (ciphertext.length < IV_LENGTH * 2 + HMAC_LENGTH * 2)
      throw new Error("Invalid ciphertext format");
    let ivHex = ciphertext.substring(0, IV_LENGTH * 2), hmacHex = ciphertext.substring(ciphertext.length - HMAC_LENGTH * 2), encryptedHex = ciphertext.substring(IV_LENGTH * 2, ciphertext.length - HMAC_LENGTH * 2), iv = Buffer.from(ivHex, "hex"), providedHmac = Buffer.from(hmacHex, "hex"), encrypted = Buffer.from(encryptedHex, "hex"), key = getEncryptionKey(), hmac = createHmac4("sha256", key);
    if (hmac.update(iv), hmac.update(encrypted), !hmac.digest().equals(providedHmac))
      throw new Error("Token integrity check failed");
    let decipher = createDecipheriv(ALGORITHM, key, iv), decrypted = decipher.update(encryptedHex, "hex", "utf8");
    return decrypted += decipher.final("utf8"), decrypted;
  } catch (error) {
    throw console.error("Decryption failed:", error), new Error("Failed to decrypt token");
  }
}
function testCrypto() {
  try {
    let testData = "test-access-token-12345", encrypted = encryptToken(testData), decrypted = decryptToken(encrypted);
    return testData === decrypted;
  } catch (error) {
    return console.error("Crypto test failed:", error), !1;
  }
}

// app/lib/shop.server.ts
async function getShopWithToken(shopDomain) {
  try {
    let shop = await prisma.shop.findUnique({
      where: { shopDomain }
    });
    if (!shop || shop.uninstalledAt)
      return null;
    let accessToken = decryptToken(shop.accessTokenEnc);
    return {
      shopDomain: shop.shopDomain,
      accessToken,
      installedAt: shop.installedAt,
      uninstalledAt: shop.uninstalledAt,
      settings: shop.settings ? JSON.parse(shop.settings) : {}
    };
  } catch (error) {
    return console.error("Failed to get shop with token:", error), null;
  }
}
async function getShopSettings(shopDomain) {
  try {
    let shop = await prisma.shop.findUnique({
      where: { shopDomain },
      select: { settings: !0, uninstalledAt: !0 }
    });
    return !shop || shop.uninstalledAt ? null : shop.settings ? JSON.parse(shop.settings) : {};
  } catch (error) {
    return console.error("Failed to get shop settings:", error), null;
  }
}

// app/routes/auth.callback.tsx
async function loader2({ request }) {
  let url = new URL(request.url), queryParams = Object.fromEntries(url.searchParams.entries()), { shop, code, hmac, state } = queryParams;
  if (!shop || !code || !hmac)
    throw new Response("Missing required OAuth parameters", { status: 400 });
  let shopDomain = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.myshopify\.com$/.test(shopDomain))
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
    let encryptedToken = encryptToken(tokenData.access_token);
    await prisma.shop.upsert({
      where: { shopDomain },
      update: {
        accessTokenEnc: encryptedToken,
        uninstalledAt: null,
        // Clear uninstall timestamp if re-installing
        updatedAt: /* @__PURE__ */ new Date()
      },
      create: {
        shopDomain,
        accessTokenEnc: encryptedToken,
        installedAt: /* @__PURE__ */ new Date(),
        settings: JSON.stringify({})
      }
    }), console.log("Shop installed successfully:", shopDomain);
    let baseUrl = new URL(request.url).origin, shopWithToken = await getShopWithToken(shopDomain);
    return shopWithToken && await registerWebhooks(shopDomain, shopWithToken.accessToken, baseUrl), redirect(`https://${shopDomain}/admin/apps/${apiKey}`);
  } catch (error) {
    throw console.error("Database error during OAuth callback:", error), new Response("Internal server error", { status: 500 });
  }
}

// app/routes/api.settings.tsx
var api_settings_exports = {};
__export(api_settings_exports, {
  action: () => action4
});
import { json as json4 } from "@remix-run/node";

// app/lib/validation.server.ts
import { z } from "zod";
var BrandingSettingsSchema = z.object({
  brandName: z.string().min(1, "Brand name is required").max(50, "Brand name too long"),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format"),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  tagline: z.string().max(100, "Tagline too long").optional().or(z.literal(""))
}), ConfigResponseSchema = z.object({
  shop: z.string(),
  branding: BrandingSettingsSchema,
  storefrontEndpoint: z.string().url(),
  appVersion: z.string()
});

// app/routes/api.settings.tsx
async function action4({ request }) {
  if (request.method !== "POST")
    return json4({ error: "Method not allowed" }, { status: 405 });
  let shop = new URL(request.url).searchParams.get("shop");
  if (!shop)
    return json4({ error: "Shop parameter required" }, { status: 400 });
  try {
    let formData = await request.formData(), brandingData = {
      brandName: formData.get("brandName"),
      primaryColor: formData.get("primaryColor"),
      logoUrl: formData.get("logoUrl") || "",
      tagline: formData.get("tagline") || ""
    }, validatedBranding = BrandingSettingsSchema.parse(brandingData), shopRecord = await prisma.shop.findUnique({
      where: { shopDomain: shop }
    });
    if (!shopRecord)
      return json4({ error: "Shop not found" }, { status: 404 });
    let updatedSettings = {
      ...shopRecord.settings || {},
      ...validatedBranding,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return await prisma.shop.update({
      where: { shopDomain: shop },
      data: { settings: updatedSettings }
    }), console.log(`Updated branding settings for shop: ${shop}`, validatedBranding), json4({
      success: !0,
      message: "Branding settings saved successfully!",
      branding: validatedBranding
    });
  } catch (error) {
    return console.error("Settings API error:", error), error instanceof Error && error.name === "ZodError" ? json4({
      error: "Validation failed",
      details: error.message
    }, { status: 400 }) : json4({ error: "Internal server error" }, { status: 500 });
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

// app/routes/api.config.tsx
var api_config_exports = {};
__export(api_config_exports, {
  loader: () => loader4
});
import { json as json5 } from "@remix-run/node";
async function loader4({ request }) {
  let sessionContext = await getOptionalSession(request), shop;
  if (sessionContext)
    shop = sessionContext.shop;
  else {
    let shopParam = new URL(request.url).searchParams.get("shop");
    if (!shopParam)
      return json5({ error: "Shop parameter or session token required" }, { status: 400 });
    shop = shopParam;
  }
  try {
    let settings = await getShopSettings(shop);
    if (!settings)
      return json5({ error: "Shop not found or not active" }, { status: 404 });
    let branding = {
      brandName: settings.brandName || shop.split(".")[0],
      primaryColor: settings.primaryColor || "#007C3B",
      logoUrl: settings.logoUrl || "",
      tagline: settings.tagline || "Your mobile shopping experience"
    }, configResponse = {
      shop,
      branding,
      storefrontEndpoint: `https://${shop}/api/2024-01/graphql.json`,
      appVersion: "1.0.0"
    }, validatedConfig = ConfigResponseSchema.parse(configResponse);
    return json5(validatedConfig, {
      headers: {
        "Cache-Control": "public, max-age=300",
        // 5 minutes cache
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return console.error("Config API error:", error), json5({ error: "Internal server error" }, { status: 500 });
  }
}

// app/routes/api.upload.tsx
var api_upload_exports = {};
__export(api_upload_exports, {
  action: () => action5
});
import { json as json6, unstable_parseMultipartFormData, unstable_createFileUploadHandler } from "@remix-run/node";
import path from "node:path";
import { randomBytes as randomBytes2 } from "node:crypto";
var ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml"
], MAX_FILE_SIZE = 2 * 1024 * 1024;
async function action5({ request }) {
  if (request.method !== "POST")
    return json6({ error: "Method not allowed" }, { status: 405 });
  try {
    let sessionContext = await getOptionalSession(request), shop;
    if (sessionContext)
      shop = sessionContext.shop;
    else {
      let shopParam = new URL(request.url).searchParams.get("shop");
      if (!shopParam)
        return json6({ error: "Unauthorized" }, { status: 401 });
      shop = shopParam;
    }
    let shopRecord = await prisma.shop.findUnique({
      where: { shopDomain: shop }
    });
    if (!shopRecord)
      return json6({ error: "Shop not found" }, { status: 404 });
    let uploadHandler = unstable_createFileUploadHandler({
      directory: path.join(process.cwd(), "public", "uploads"),
      file: ({ filename, contentType }) => {
        if (!ALLOWED_MIME_TYPES.includes(contentType))
          throw new Error(`Invalid file type: ${contentType}`);
        let ext = path.extname(filename || ""), randomId = randomBytes2(8).toString("hex");
        return `${Date.now()}-${randomId}${ext}`;
      },
      maxPartSize: MAX_FILE_SIZE
    }), formData = await unstable_parseMultipartFormData(request, uploadHandler), file = formData.get("file"), kind = formData.get("kind") || "logo";
    if (!file)
      return json6({ error: "No file provided" }, { status: 400 });
    if (!["logo", "banner"].includes(kind))
      return json6({
        error: 'Invalid asset kind. Must be "logo" or "banner"'
      }, { status: 400 });
    if (file.size > MAX_FILE_SIZE)
      return json6({
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 });
    let fileUrl = `/uploads/${file.name}`, existingAsset = await prisma.asset.findFirst({
      where: {
        shopId: shopRecord.id,
        kind
      }
    });
    existingAsset && await prisma.asset.delete({
      where: { id: existingAsset.id }
    });
    let asset = await prisma.asset.create({
      data: {
        shopId: shopRecord.id,
        kind,
        url: fileUrl
      }
    });
    return json6({
      success: !0,
      asset: {
        id: asset.id,
        kind: asset.kind,
        url: asset.url,
        filename: file.name
      },
      message: `${kind} uploaded successfully`
    });
  } catch (error) {
    return console.error("Upload API error:", error), json6({
      error: error instanceof Error ? error.message : "Upload failed"
    }, { status: 500 });
  }
}

// app/routes/test.oauth.tsx
var test_oauth_exports = {};
__export(test_oauth_exports, {
  default: () => TestOAuth,
  loader: () => loader5
});
import { json as json7 } from "@remix-run/node";
import { useLoaderData as useLoaderData2, Link } from "@remix-run/react";
import { jsxDEV as jsxDEV4 } from "react/jsx-dev-runtime";
async function loader5() {
  let testShop = "zeytestshop", installUrl = `/auth/install?shop=${testShop}.myshopify.com`;
  return json7({
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

// app/routes/healthz.tsx
var healthz_exports = {};
__export(healthz_exports, {
  loader: () => loader6
});
import { json as json8 } from "@remix-run/node";
async function loader6({ request }) {
  try {
    let shopCount = await prisma.shop.count(), cryptoOk = testCrypto(), health = {
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database: {
        connected: !0,
        shops: shopCount
      },
      crypto: {
        working: cryptoOk
      },
      version: process.env.npm_package_version || "unknown"
    };
    return json8(health, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  } catch (error) {
    return console.error("Health check failed:", error), json8({
      status: "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    }, {
      status: 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  }
}

// app/routes/_index.tsx
var index_exports = {};
__export(index_exports, {
  default: () => Index,
  loader: () => loader7
});
import { json as json9 } from "@remix-run/node";
import { useLoaderData as useLoaderData3, Link as Link2 } from "@remix-run/react";
import { jsxDEV as jsxDEV5 } from "react/jsx-dev-runtime";
async function loader7() {
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
    return json9({
      message: "TurnApp - Shopify App Admin Dashboard",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      dbStatus: "connected",
      shopCount,
      recentShops
    });
  } catch {
    return json9({
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
  loader: () => loader8
});
import { json as json10 } from "@remix-run/node";
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
async function loader8({ request }) {
  let url = new URL(request.url), sessionContext = await getOptionalSession(request);
  if (sessionContext)
    return json10({
      shop: sessionContext.shop,
      host: url.searchParams.get("host"),
      appBridgeConfig: {
        apiKey: process.env.SHOPIFY_API_KEY || "",
        shop: sessionContext.shop,
        host: url.searchParams.get("host") || ""
      }
    });
  let shop = url.searchParams.get("shop"), host = url.searchParams.get("host");
  if (!shop)
    throw new Response("Unauthorized - Missing session token or shop parameter", { status: 401 });
  return json10({
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
      lineNumber: 68,
      columnNumber: 7
    },
    this
  ) }, void 0, !1, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 67,
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
      lineNumber: 88,
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
            lineNumber: 110,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV6(Text2, { variant: "bodyMd", as: "p", tone: "subdued", children: "Transform your Shopify store into a mobile shopping app" }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 111,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV6("div", { style: { marginTop: "20px" }, children: /* @__PURE__ */ jsxDEV6(Text2, { variant: "headingSm", as: "h3", children: [
            "Shop: ",
            shop
          ] }, void 0, !0, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 115,
            columnNumber: 21
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 114,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV6("div", { style: { marginTop: "20px" }, children: /* @__PURE__ */ jsxDEV6(Link3, { to: "/admin/branding", children: /* @__PURE__ */ jsxDEV6(Button2, { variant: "primary", children: "Configure Branding" }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 119,
            columnNumber: 23
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 118,
            columnNumber: 21
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 117,
            columnNumber: 19
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 109,
          columnNumber: 17
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 108,
          columnNumber: 15
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 107,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV6(Layout2.Section, { variant: "oneThird", children: /* @__PURE__ */ jsxDEV6(Card2, { children: /* @__PURE__ */ jsxDEV6("div", { style: { padding: "20px" }, children: [
          /* @__PURE__ */ jsxDEV6(Text2, { variant: "headingSm", as: "h3", children: "Quick Stats" }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 129,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV6("div", { style: { marginTop: "12px" }, children: [
            /* @__PURE__ */ jsxDEV6(Text2, { variant: "bodyMd", as: "p", children: "Status: Active" }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 131,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV6(Text2, { variant: "bodyMd", as: "p", children: "App Version: 1.0.0" }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 132,
              columnNumber: 21
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 130,
            columnNumber: 19
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 128,
          columnNumber: 17
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 127,
          columnNumber: 15
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 126,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 106,
        columnNumber: 11
      }, this) }, void 0, !1, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 105,
        columnNumber: 9
      }, this) : /* @__PURE__ */ jsxDEV6(Outlet2, {}, void 0, !1, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 140,
        columnNumber: 9
      }, this)
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin.tsx",
      lineNumber: 98,
      columnNumber: 5
    },
    this
  );
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-IMMRVYYP.js", imports: ["/build/_shared/chunk-XC6BC2BP.js", "/build/_shared/chunk-LW6LB2HF.js", "/build/_shared/chunk-ALN5UVCC.js", "/build/_shared/chunk-UWV35TSL.js", "/build/_shared/chunk-56LDNGDG.js", "/build/_shared/chunk-PMI65YMG.js", "/build/_shared/chunk-2Q7FBYOG.js", "/build/_shared/chunk-PNG5AS42.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-VQC54PAV.js", imports: ["/build/_shared/chunk-RRH55SMP.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-5T3DDPHO.js", imports: ["/build/_shared/chunk-G7CHZRZX.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/admin": { id: "routes/admin", parentId: "root", path: "admin", index: void 0, caseSensitive: void 0, module: "/build/routes/admin-ZZMVBB2B.js", imports: ["/build/_shared/chunk-EV32D4DT.js", "/build/_shared/chunk-G7CHZRZX.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/admin.branding": { id: "routes/admin.branding", parentId: "routes/admin", path: "branding", index: void 0, caseSensitive: void 0, module: "/build/routes/admin.branding-EN2SGFBL.js", imports: ["/build/_shared/chunk-RRH55SMP.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.config": { id: "routes/api.config", parentId: "root", path: "api/config", index: void 0, caseSensitive: void 0, module: "/build/routes/api.config-F6QT7IN6.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.settings": { id: "routes/api.settings", parentId: "root", path: "api/settings", index: void 0, caseSensitive: void 0, module: "/build/routes/api.settings-C6JUPEZG.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.upload": { id: "routes/api.upload", parentId: "root", path: "api/upload", index: void 0, caseSensitive: void 0, module: "/build/routes/api.upload-NKI3ERUQ.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/auth.callback": { id: "routes/auth.callback", parentId: "root", path: "auth/callback", index: void 0, caseSensitive: void 0, module: "/build/routes/auth.callback-HTHTBQTT.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/auth.install": { id: "routes/auth.install", parentId: "root", path: "auth/install", index: void 0, caseSensitive: void 0, module: "/build/routes/auth.install-GWWDNMQD.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/healthz": { id: "routes/healthz", parentId: "root", path: "healthz", index: void 0, caseSensitive: void 0, module: "/build/routes/healthz-47L4ZWTK.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/test.oauth": { id: "routes/test.oauth", parentId: "root", path: "test/oauth", index: void 0, caseSensitive: void 0, module: "/build/routes/test.oauth-2MXZLR7I.js", imports: ["/build/_shared/chunk-G7CHZRZX.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/webhooks.app_uninstalled": { id: "routes/webhooks.app_uninstalled", parentId: "root", path: "webhooks/app_uninstalled", index: void 0, caseSensitive: void 0, module: "/build/routes/webhooks.app_uninstalled-QBHIURQQ.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/webhooks.products_update": { id: "routes/webhooks.products_update", parentId: "root", path: "webhooks/products_update", index: void 0, caseSensitive: void 0, module: "/build/routes/webhooks.products_update-JGCI7S77.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "ff943b25", hmr: { runtime: "/build/_shared/chunk-ALN5UVCC.js", timestamp: 1755765288647 }, url: "/build/manifest-FF943B25.js" };

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
  "routes/webhooks.app_uninstalled": {
    id: "routes/webhooks.app_uninstalled",
    parentId: "root",
    path: "webhooks/app_uninstalled",
    index: void 0,
    caseSensitive: void 0,
    module: webhooks_app_uninstalled_exports
  },
  "routes/webhooks.products_update": {
    id: "routes/webhooks.products_update",
    parentId: "root",
    path: "webhooks/products_update",
    index: void 0,
    caseSensitive: void 0,
    module: webhooks_products_update_exports
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
  "routes/api.settings": {
    id: "routes/api.settings",
    parentId: "root",
    path: "api/settings",
    index: void 0,
    caseSensitive: void 0,
    module: api_settings_exports
  },
  "routes/auth.install": {
    id: "routes/auth.install",
    parentId: "root",
    path: "auth/install",
    index: void 0,
    caseSensitive: void 0,
    module: auth_install_exports
  },
  "routes/api.config": {
    id: "routes/api.config",
    parentId: "root",
    path: "api/config",
    index: void 0,
    caseSensitive: void 0,
    module: api_config_exports
  },
  "routes/api.upload": {
    id: "routes/api.upload",
    parentId: "root",
    path: "api/upload",
    index: void 0,
    caseSensitive: void 0,
    module: api_upload_exports
  },
  "routes/test.oauth": {
    id: "routes/test.oauth",
    parentId: "root",
    path: "test/oauth",
    index: void 0,
    caseSensitive: void 0,
    module: test_oauth_exports
  },
  "routes/healthz": {
    id: "routes/healthz",
    parentId: "root",
    path: "healthz",
    index: void 0,
    caseSensitive: void 0,
    module: healthz_exports
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
