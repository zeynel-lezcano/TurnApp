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
import { jsx } from "react/jsx-runtime";
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
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
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
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
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
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var meta = () => [
  { charset: "utf-8" },
  { title: "TurnApp Admin" },
  { name: "viewport", content: "width=device-width,initial-scale=1" }
];
function App() {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx2(Meta, {}),
      /* @__PURE__ */ jsx2(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx2(AppProvider, { i18n: {}, theme: "light", children: /* @__PURE__ */ jsx2(Outlet, {}) }),
      /* @__PURE__ */ jsx2(ScrollRestoration, {}),
      /* @__PURE__ */ jsx2(Scripts, {}),
      /* @__PURE__ */ jsx2(LiveReload, {})
    ] })
  ] });
}

// app/routes/webhooks.app_uninstalled.tsx
var webhooks_app_uninstalled_exports = {};
__export(webhooks_app_uninstalled_exports, {
  action: () => action
});
import { json } from "@remix-run/node";

// app/lib/webhooks.server.ts
import { createHmac as createHmac2 } from "node:crypto";

// app/lib/tunnel.server.ts
function isTunnelActive() {
  return process.env.TUNNEL_ACTIVE === "true" && !1;
}
function getWebhookBaseUrl() {
  return isTunnelActive() && process.env.WEBHOOK_BASE_URL ? process.env.WEBHOOK_BASE_URL : process.env.APP_URL || "http://localhost:3000";
}
function buildWebhookUrl(webhookPath) {
  let baseUrl = getWebhookBaseUrl(), cleanPath = webhookPath.startsWith("/") ? webhookPath : `/${webhookPath}`;
  return `${baseUrl}${cleanPath}`;
}

// app/lib/admin-api.server.ts
import { GraphQLClient } from "graphql-request";

// app/lib/prisma.server.ts
import { PrismaClient } from "@prisma/client";
var prisma;
prisma = new PrismaClient();

// app/lib/crypto.server.ts
import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync, createHmac } from "node:crypto";
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
  let fallbackSeed = "production-turnapp-dev-key-v1", salt = Buffer.from("dev-salt-turnapp", "utf8");
  return pbkdf2Sync(fallbackSeed, salt, 1e4, KEY_LENGTH, "sha256");
}
function encryptToken(plaintext) {
  if (!plaintext || plaintext.length === 0)
    throw new Error("Cannot encrypt empty token");
  try {
    let key = getEncryptionKey(), iv = randomBytes(IV_LENGTH), cipher = createCipheriv(ALGORITHM, key, iv), encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    let hmac = createHmac("sha256", key);
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
    let ivHex = ciphertext.substring(0, IV_LENGTH * 2), hmacHex = ciphertext.substring(ciphertext.length - HMAC_LENGTH * 2), encryptedHex = ciphertext.substring(IV_LENGTH * 2, ciphertext.length - HMAC_LENGTH * 2), iv = Buffer.from(ivHex, "hex"), providedHmac = Buffer.from(hmacHex, "hex"), encrypted = Buffer.from(encryptedHex, "hex"), key = getEncryptionKey(), hmac = createHmac("sha256", key);
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

// app/lib/admin-api.server.ts
var ADMIN_API_VERSION = "2024-01", SHOP_QUERY = `
  query getShop {
    shop {
      id
      name
      domain
      email
      myshopifyDomain
      plan {
        displayName
        partnerDevelopment
      }
      primaryLocale
      currencyCode
      weightUnit
      timezone
    }
  }
`, PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          status
          productType
          vendor
          tags
          createdAt
          updatedAt
          variants(first: 10) {
            edges {
              node {
                id
                title
                sku
                price
                compareAtPrice
                inventoryQuantity
                availableForSale
              }
            }
          }
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
    }
  }
`, PRODUCT_BY_ID_QUERY = `
  query getProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      status
      productType
      vendor
      tags
      createdAt
      updatedAt
      variants(first: 10) {
        edges {
          node {
            id
            title
            sku
            price
            compareAtPrice
            inventoryQuantity
            availableForSale
          }
        }
      }
      images(first: 5) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;
function createAdminClient(shopDomain, accessToken) {
  let endpoint = `https://${shopDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
  return new GraphQLClient(endpoint, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    // Enable rate limit handling
    errorPolicy: "all"
  });
}
async function getShopInfo(shopDomain) {
  try {
    let shopData = await getShopWithToken(shopDomain);
    if (!shopData)
      return console.error("Shop not found or inactive:", shopDomain), null;
    let response = await createAdminClient(shopDomain, shopData.accessToken).request(SHOP_QUERY);
    return response.shop ? response.shop : (console.error("No shop data returned from Admin API"), null);
  } catch (error) {
    return console.error("Failed to get shop info:", error), error instanceof Error && error.message.includes("401") && console.error("Admin API authentication failed for shop:", shopDomain), null;
  }
}
async function validateShopAccess(shopDomain) {
  try {
    let shopInfo = await getShopInfo(shopDomain);
    return shopInfo ? shopInfo.myshopifyDomain !== shopDomain ? (console.error("Shop domain mismatch:", {
      expected: shopDomain,
      actual: shopInfo.myshopifyDomain
    }), !1) : (console.log("Shop validation successful:", {
      name: shopInfo.name,
      domain: shopInfo.domain,
      plan: shopInfo.plan.displayName
    }), !0) : !1;
  } catch (error) {
    return console.error("Shop validation failed:", error), !1;
  }
}
async function getAdminProducts(shopDomain, first = 50, after) {
  try {
    let shopData = await getShopWithToken(shopDomain);
    if (!shopData)
      throw new Error("Shop not found or inactive");
    let client = createAdminClient(shopDomain, shopData.accessToken), variables = { first, ...after && { after } }, response = await client.request(PRODUCTS_QUERY, variables);
    return {
      products: response.products.edges.map((edge) => edge.node),
      hasNextPage: response.products.pageInfo.hasNextPage,
      endCursor: response.products.pageInfo.endCursor
    };
  } catch (error) {
    if (console.error("Failed to get admin products:", error), error instanceof Error) {
      if (error.message.includes("401"))
        throw new Error("Admin API authentication failed");
      if (error.message.includes("402"))
        throw new Error("Shop subscription required");
      if (error.message.includes("429"))
        throw new Error("Admin API rate limit exceeded");
    }
    return null;
  }
}
async function getAdminProduct(shopDomain, productId) {
  try {
    let shopData = await getShopWithToken(shopDomain);
    if (!shopData)
      throw new Error("Shop not found or inactive");
    return (await createAdminClient(shopDomain, shopData.accessToken).request(
      PRODUCT_BY_ID_QUERY,
      { id: productId }
    )).product;
  } catch (error) {
    return console.error("Failed to get admin product:", error), null;
  }
}
function extractRateLimitInfo(error) {
  try {
    return error?.response?.extensions?.cost ? {
      requestedQueryCost: error.response.extensions.cost.requestedQueryCost,
      actualQueryCost: error.response.extensions.cost.actualQueryCost,
      throttleStatus: error.response.extensions.cost.throttleStatus
    } : null;
  } catch {
    return null;
  }
}
async function withRateLimit(operation, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++)
    try {
      return await operation();
    } catch (error) {
      if (lastError = error, !error || !error.toString().includes("429"))
        throw error;
      if (attempt === maxRetries)
        throw new Error(`Max retries reached: ${lastError.message}`);
      let rateLimitInfo = extractRateLimitInfo(error), baseDelay = Math.pow(2, attempt) * 1e3, jitter = Math.random() * 1e3, delay = baseDelay + jitter;
      console.log(`Rate limit hit, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries + 1})`), rateLimitInfo && console.log("Rate limit info:", {
        available: rateLimitInfo.throttleStatus.currentlyAvailable,
        maximum: rateLimitInfo.throttleStatus.maximumAvailable,
        restoreRate: rateLimitInfo.throttleStatus.restoreRate
      }), await new Promise((resolve) => setTimeout(resolve, delay));
    }
  throw lastError;
}

// app/lib/webhooks.server.ts
function verifyWebhookHmac(body, hmacHeader, secret) {
  let bodyString = typeof body == "string" ? body : body.toString("utf8"), calculatedHmac = createHmac2("sha256", secret).update(bodyString, "utf8").digest("base64"), providedHmac = hmacHeader.replace("sha256=", "");
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
  if (!await validateShopAccess(shop)) {
    console.error("Shop validation failed, skipping webhook registration:", shop);
    return;
  }
  let getWebhookAddress = (path2) => baseUrl ? `${baseUrl}${path2}` : buildWebhookUrl(path2), webhooks = [
    {
      topic: "app/uninstalled",
      address: getWebhookAddress("/webhooks/app_uninstalled"),
      format: "json"
    },
    {
      topic: "products/update",
      address: getWebhookAddress("/webhooks/products_update"),
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

// app/routes/api.admin.products.tsx
var api_admin_products_exports = {};
__export(api_admin_products_exports, {
  loader: () => loader
});
import { json as json3 } from "@remix-run/node";

// app/lib/session.server.ts
import { createHmac as createHmac3 } from "node:crypto";
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
    let [header, payload, signature] = parts, data = `${header}.${payload}`, expectedSignature = createHmac3("sha256", secret).update(data).digest("base64url");
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
async function requireValidSession(request) {
  let context = await createSessionMiddleware()(request);
  if (!context)
    throw new Response("Unauthorized - Invalid or missing session token", {
      status: 401,
      headers: {
        "Content-Type": "application/json"
      }
    });
  return context;
}
async function getOptionalSession(request) {
  return await createSessionMiddleware()(request);
}

// app/lib/monitoring.server.ts
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
async function checkDatabaseHealth() {
  try {
    let startTime = Date.now(), shopCount = await prisma.shop.count(), latency = Date.now() - startTime;
    return {
      connected: !0,
      shops: shopCount,
      latency
    };
  } catch (error) {
    return console.error("Database health check failed:", error), {
      connected: !1,
      shops: 0
    };
  }
}
async function checkCryptoHealth() {
  try {
    return {
      working: await testCrypto()
    };
  } catch (error) {
    return console.error("Crypto health check failed:", error), {
      working: !1
    };
  }
}
async function performHealthCheck(includeDetails = !1) {
  try {
    let timestamp = (/* @__PURE__ */ new Date()).toISOString();
    if (!includeDetails)
      return {
        status: "healthy",
        timestamp
      };
    let [databaseHealth, cryptoHealth] = await Promise.allSettled([
      checkDatabaseHealth(),
      checkCryptoHealth()
    ]), dbHealth = databaseHealth.status === "fulfilled" ? databaseHealth.value : { connected: !1, shops: 0 }, cryptoHealthResult = cryptoHealth.status === "fulfilled" ? cryptoHealth.value : { working: !1 }, isHealthy = dbHealth.connected && cryptoHealthResult.working, health = {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp,
      database: dbHealth,
      crypto: cryptoHealthResult,
      version: process.env.npm_package_version || "1.0.0"
    };
    if (!isHealthy) {
      let issues = [];
      dbHealth.connected || issues.push("database connection failed"), cryptoHealthResult.working || issues.push("crypto system failed"), health.error = `Health check failed: ${issues.join(", ")}`;
    }
    return health;
  } catch (error) {
    return console.error("Health check failed:", error), {
      status: "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      error: error instanceof Error ? error.message : "Unknown health check error"
    };
  }
}
async function checkReadiness() {
  try {
    let [databaseHealth, cryptoHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkCryptoHealth()
    ]), isReady = databaseHealth.connected && cryptoHealth.working;
    return {
      status: isReady ? "healthy" : "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database: databaseHealth,
      crypto: cryptoHealth,
      error: isReady ? void 0 : "Application not ready"
    };
  } catch (error) {
    return console.error("Readiness check failed:", error), {
      status: "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      error: error instanceof Error ? error.message : "Readiness check failed"
    };
  }
}
function logRequest(request, context, options) {
  try {
    let requestId = request.headers.get("x-request-id") || generateRequestId(), url = new URL(request.url), logEntry = {
      requestId,
      method: request.method,
      url: url.pathname + url.search,
      userAgent: request.headers.get("user-agent") || void 0,
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || void 0,
      shopDomain: context?.shop,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      duration: options?.duration,
      statusCode: options?.statusCode,
      error: options?.error
    };
    console.log(JSON.stringify(logEntry, null, 0));
  } catch (error) {
    console.error("Failed to log request:", error);
  }
}
function logRequestWithContext(request, context, options) {
  logRequest(request, context, options);
}

// app/lib/middleware.server.ts
async function requireSession(request) {
  try {
    let sessionContext = await requireValidSession(request), shopRecord = await prisma.shop.findUnique({
      where: { shopDomain: sessionContext.shop }
    });
    if (!shopRecord)
      throw console.error(`Shop not found in database: ${sessionContext.shop}`), new Response(
        JSON.stringify({
          error: "Shop not registered",
          code: "SHOP_NOT_FOUND"
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    if (shopRecord.uninstalledAt)
      throw console.error(`Shop uninstalled: ${sessionContext.shop}`), new Response(
        JSON.stringify({
          error: "Shop access revoked",
          code: "SHOP_UNINSTALLED"
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    return {
      shop: sessionContext.shop,
      session: sessionContext.session,
      shopRecord
    };
  } catch (error) {
    throw error instanceof Response ? error : (console.error("Session middleware error:", error), new Response(
      JSON.stringify({
        error: "Authentication failed",
        code: "AUTH_ERROR"
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    ));
  }
}
async function flexibleAuth(request) {
  try {
    let sessionContext = await getOptionalSession(request);
    if (sessionContext) {
      let shopRecord2 = await prisma.shop.findUnique({
        where: { shopDomain: sessionContext.shop }
      });
      if (!shopRecord2 || shopRecord2.uninstalledAt)
        throw new Response(
          JSON.stringify({
            error: "Shop not found or uninstalled",
            code: "SHOP_INVALID"
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" }
          }
        );
      return {
        shop: sessionContext.shop,
        session: sessionContext.session,
        shopRecord: shopRecord2
      };
    }
    let shopParam = new URL(request.url).searchParams.get("shop");
    if (!shopParam)
      throw new Response(
        JSON.stringify({
          error: "Authentication required - provide session token or shop parameter",
          code: "AUTH_REQUIRED"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    if (!shopParam.endsWith(".myshopify.com"))
      throw new Response(
        JSON.stringify({
          error: "Invalid shop domain format",
          code: "INVALID_SHOP"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    let shopRecord = await prisma.shop.findUnique({
      where: { shopDomain: shopParam }
    });
    if (!shopRecord || shopRecord.uninstalledAt)
      throw new Response(
        JSON.stringify({
          error: "Shop not found or uninstalled",
          code: "SHOP_NOT_FOUND"
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    return {
      shop: shopParam,
      session: null,
      // No session for shop parameter access
      shopRecord
    };
  } catch (error) {
    throw error instanceof Response ? error : (console.error("Flexible auth middleware error:", error), new Response(
      JSON.stringify({
        error: "Authentication failed",
        code: "AUTH_ERROR"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    ));
  }
}
function logRequest2(request, context) {
  logRequestWithContext(request, context);
}

// app/lib/validation.server.ts
import { z } from "zod";
var ShopDomainSchema = z.string().regex(/^[a-z0-9-]+\.myshopify\.com$/, "Invalid shop domain format"), HexColorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format"), UrlSchema = z.string().refine((url) => {
  if (url === "")
    return !0;
  try {
    let parsed = new URL(url);
    return !["javascript:", "data:", "vbscript:", "file:", "ftp:"].includes(parsed.protocol);
  } catch {
    return !1;
  }
}, "Invalid or unsafe URL").optional().or(z.literal("")), BrandingSettingsSchema = z.object({
  brandName: z.string().min(1, "Brand name is required").max(50, "Brand name too long").regex(/^[a-zA-Z0-9\s\-_]+$/, "Brand name contains invalid characters"),
  primaryColor: HexColorSchema,
  logoUrl: UrlSchema,
  tagline: z.string().max(100, "Tagline too long").optional().or(z.literal(""))
}), ConfigResponseSchema = z.object({
  shop: ShopDomainSchema,
  branding: BrandingSettingsSchema,
  storefrontEndpoint: z.string().url("Invalid storefront endpoint"),
  appVersion: z.string().regex(/^\d+\.\d+\.\d+$/, "Invalid version format")
}), UploadRequestSchema = z.object({
  kind: z.enum(["logo", "banner"], {
    errorMap: () => ({ message: "Asset kind must be 'logo' or 'banner'" })
  })
}), UploadResponseSchema = z.object({
  success: z.boolean(),
  asset: z.object({
    id: z.string().uuid(),
    kind: z.enum(["logo", "banner"]),
    url: z.string().url(),
    filename: z.string()
  }).optional(),
  message: z.string().optional(),
  error: z.string().optional()
}), ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.string()).optional()
}), SettingsUpdateSchema = z.object({
  brandName: z.string().min(1, "Brand name is required").max(50, "Brand name too long").optional(),
  primaryColor: HexColorSchema.optional(),
  logoUrl: UrlSchema.optional(),
  tagline: z.string().max(100, "Tagline too long").optional()
}), HealthResponseSchema = z.object({
  status: z.enum(["healthy", "unhealthy"]),
  timestamp: z.string(),
  database: z.object({
    connected: z.boolean(),
    shops: z.number().int().nonnegative(),
    latency: z.number().optional()
  }).optional(),
  crypto: z.object({
    working: z.boolean()
  }).optional(),
  version: z.string().optional(),
  error: z.string().optional()
});
var validateBrandingData = (data) => {
  try {
    return BrandingSettingsSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      let fieldErrors = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      ).join(", ");
      throw new Error(`Validation failed: ${fieldErrors}`);
    }
    throw error;
  }
}, createErrorResponse = (message, code, details) => ({
  error: message,
  code,
  details
}), ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  images: z.array(z.object({
    url: z.string().url(),
    altText: z.string().nullable()
  })),
  price: z.object({
    amount: z.string(),
    currency: z.string().length(3)
    // ISO currency code
  }),
  variants: z.array(z.object({
    id: z.string(),
    title: z.string(),
    price: z.object({
      amount: z.string(),
      currencyCode: z.string().length(3)
    }),
    compareAtPrice: z.object({
      amount: z.string(),
      currencyCode: z.string().length(3)
    }).nullable(),
    available: z.boolean()
  }))
}), ProductsResponseSchema = z.object({
  products: z.array(ProductSchema),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean()
  }),
  shop: ShopDomainSchema,
  total: z.number().int().nonnegative()
}), AdminProductVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string(),
  price: z.string(),
  compareAtPrice: z.string().nullable(),
  inventoryQuantity: z.number().int(),
  availableForSale: z.boolean()
}), AdminProductImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  altText: z.string().nullable(),
  width: z.number().int().positive(),
  height: z.number().int().positive()
}), AdminProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  status: z.enum(["ACTIVE", "ARCHIVED", "DRAFT"]),
  productType: z.string(),
  vendor: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  variants: z.object({
    edges: z.array(z.object({
      node: AdminProductVariantSchema
    }))
  }),
  images: z.object({
    edges: z.array(z.object({
      node: AdminProductImageSchema
    }))
  })
}), ShopInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string(),
  email: z.string().email(),
  myshopifyDomain: z.string().regex(/^[a-z0-9-]+\.myshopify\.com$/),
  plan: z.object({
    displayName: z.string(),
    partnerDevelopment: z.boolean()
  }),
  primaryLocale: z.string(),
  currencyCode: z.string().length(3),
  // ISO currency code
  weightUnit: z.enum(["POUNDS", "OUNCES", "KILOGRAMS", "GRAMS"]),
  timezone: z.string()
}), AdminProductsResponseSchema = z.object({
  products: z.array(AdminProductSchema),
  hasNextPage: z.boolean(),
  endCursor: z.string().optional(),
  shop: ShopDomainSchema,
  total: z.number().int().nonnegative()
}), ShopValidationResponseSchema = z.object({
  valid: z.boolean(),
  shop: ShopInfoSchema.optional(),
  error: z.string().optional()
});

// app/routes/api.admin.products.tsx
async function loader({ request }) {
  try {
    let context = await requireSession(request), url = new URL(request.url), first = Math.min(parseInt(url.searchParams.get("first") || "20"), 50), after = url.searchParams.get("after") || void 0, productId = url.searchParams.get("id");
    if (first < 1)
      return json3(createErrorResponse(
        'Invalid "first" parameter. Must be between 1 and 50.',
        "INVALID_PARAMETER"
      ), { status: 400 });
    if (productId) {
      let product = await withRateLimit(async () => await getAdminProduct(context.shop, productId));
      return product ? json3(product, {
        headers: {
          "Cache-Control": "private, max-age=300",
          // 5 minutes cache
          "Content-Type": "application/json"
        }
      }) : json3(createErrorResponse(
        "Product not found",
        "PRODUCT_NOT_FOUND"
      ), { status: 404 });
    } else {
      let result = await withRateLimit(async () => await getAdminProducts(context.shop, first, after));
      if (!result)
        return json3(createErrorResponse(
          "Failed to fetch products",
          "PRODUCTS_FETCH_ERROR"
        ), { status: 500 });
      let response = {
        products: result.products,
        hasNextPage: result.hasNextPage,
        endCursor: result.endCursor,
        shop: context.shop,
        total: result.products.length
      }, validatedResponse = AdminProductsResponseSchema.parse(response);
      return json3(validatedResponse, {
        headers: {
          "Cache-Control": "private, max-age=300",
          // 5 minutes cache
          "Content-Type": "application/json"
        }
      });
    }
  } catch (error) {
    if (console.error("Admin products API error:", error), error instanceof Response)
      throw error;
    if (error instanceof Error) {
      if (error.message.includes("Admin API authentication failed"))
        return json3(createErrorResponse(
          "Shop authentication failed",
          "ADMIN_AUTH_ERROR"
        ), { status: 401 });
      if (error.message.includes("Shop subscription required"))
        return json3(createErrorResponse(
          "Shop subscription required for Admin API access",
          "SUBSCRIPTION_ERROR"
        ), { status: 402 });
      if (error.message.includes("Admin API rate limit exceeded"))
        return json3(createErrorResponse(
          "Admin API rate limit exceeded",
          "ADMIN_RATE_LIMIT"
        ), { status: 429 });
      if (error.message.includes("Max retries reached"))
        return json3(createErrorResponse(
          "Admin API temporarily unavailable",
          "SERVICE_UNAVAILABLE"
        ), { status: 503 });
    }
    return json3(createErrorResponse(
      "Failed to fetch products",
      "INTERNAL_ERROR"
    ), { status: 500 });
  }
}

// app/routes/admin.branding.tsx
var admin_branding_exports = {};
__export(admin_branding_exports, {
  action: () => action3,
  default: () => AdminBranding,
  loader: () => loader2
});
import { json as json4 } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useFetcher } from "@remix-run/react";
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
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
async function loader2({ request }) {
  let context = await flexibleAuth(request);
  logRequest2(request, context);
  try {
    let configUrl = new URL("/api/config", request.url);
    configUrl.searchParams.set("shop", context.shop);
    let configResponse = await fetch(configUrl.toString()), configData = await configResponse.json();
    if (!configResponse.ok)
      throw new Error(configData.error || "Failed to load config");
    return json4({
      shop: context.shop,
      brandingSettings: configData.branding
    });
  } catch (error) {
    console.error("Failed to load branding settings:", error);
    let brandingSettings = {
      brandName: context.shop.split(".")[0],
      primaryColor: "#007C3B",
      logoUrl: "",
      tagline: "Your mobile shopping experience"
    };
    return json4({
      shop: context.shop,
      brandingSettings
    });
  }
}
async function action3({ request }) {
  let context = await flexibleAuth(request);
  logRequest2(request, context);
  try {
    let settingsUrl = new URL("/api/settings", request.url);
    settingsUrl.searchParams.set("shop", context.shop);
    let formData = await request.formData(), settingsResponse = await fetch(settingsUrl.toString(), {
      method: "POST",
      body: formData
    }), settingsData = await settingsResponse.json();
    if (!settingsResponse.ok)
      throw new Error(settingsData.error || "Failed to save settings");
    return json4(settingsData);
  } catch (error) {
    return console.error("Failed to save branding settings:", error), json4({
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
  return uploadData?.success && uploadData.asset?.url && uploadData.asset.url !== logoUrl && setLogoUrl(uploadData.asset.url), /* @__PURE__ */ jsx3(
    Page,
    {
      title: "Branding Configuration",
      subtitle: "Customize your mobile app appearance",
      backAction: {
        url: "/admin"
      },
      children: /* @__PURE__ */ jsxs2(Layout, { children: [
        /* @__PURE__ */ jsxs2(Layout.Section, { children: [
          actionData?.success && /* @__PURE__ */ jsx3(Banner, { tone: "success", onDismiss: () => {
          }, children: actionData.message }),
          actionData?.error && /* @__PURE__ */ jsx3(Banner, { tone: "critical", onDismiss: () => {
          }, children: actionData.error }),
          /* @__PURE__ */ jsx3(Card, { children: /* @__PURE__ */ jsx3(Form, { method: "post", children: /* @__PURE__ */ jsxs2(FormLayout, { children: [
            /* @__PURE__ */ jsx3(Text, { variant: "headingSm", as: "h3", children: "Basic Information" }),
            /* @__PURE__ */ jsx3(
              TextField,
              {
                label: "App Name",
                value: brandName,
                onChange: handleBrandNameChange,
                name: "brandName",
                helpText: "This will be the name of your mobile app",
                autoComplete: "off"
              }
            ),
            /* @__PURE__ */ jsx3(
              TextField,
              {
                label: "Tagline",
                value: tagline,
                onChange: handleTaglineChange,
                name: "tagline",
                helpText: "A short description for your mobile app",
                autoComplete: "off"
              }
            ),
            /* @__PURE__ */ jsx3(Divider, {}),
            /* @__PURE__ */ jsx3(Text, { variant: "headingSm", as: "h3", children: "Visual Design" }),
            /* @__PURE__ */ jsx3(
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
              }
            ),
            /* @__PURE__ */ jsxs2("div", { children: [
              /* @__PURE__ */ jsx3(Text, { variant: "bodyMd", as: "p", fontWeight: "medium", children: "Logo Upload" }),
              /* @__PURE__ */ jsx3("div", { style: { marginTop: "8px" }, children: /* @__PURE__ */ jsx3(DropZone, { onDrop: handleDropZoneDrop, accept: "image/*", type: "image", children: uploadedFile ? /* @__PURE__ */ jsxs2(BlockStack, { gap: "200", children: [
                /* @__PURE__ */ jsx3(
                  Thumbnail,
                  {
                    source: URL.createObjectURL(uploadedFile),
                    alt: uploadedFile.name,
                    size: "large"
                  }
                ),
                /* @__PURE__ */ jsx3(Text, { variant: "bodyMd", as: "p", alignment: "center", children: uploadedFile.name }),
                uploadFetcher.state === "submitting" && /* @__PURE__ */ jsx3(Text, { variant: "bodyMd", as: "p", alignment: "center", children: "Uploading..." }),
                uploadFetcher.data?.success && /* @__PURE__ */ jsx3(Text, { variant: "bodyMd", as: "p", alignment: "center", tone: "success", children: "Upload successful!" })
              ] }) : logoUrl ? /* @__PURE__ */ jsxs2(BlockStack, { gap: "200", children: [
                /* @__PURE__ */ jsx3(
                  Thumbnail,
                  {
                    source: logoUrl,
                    alt: "Current logo",
                    size: "large"
                  }
                ),
                /* @__PURE__ */ jsx3(Text, { variant: "bodyMd", as: "p", alignment: "center", children: "Current logo" })
              ] }) : /* @__PURE__ */ jsxs2(BlockStack, { gap: "200", children: [
                /* @__PURE__ */ jsx3(Icon, { source: ImageIcon, tone: "subdued" }),
                /* @__PURE__ */ jsx3(Text, { variant: "bodyMd", as: "p", alignment: "center", children: "Drop logo here or click to upload" }),
                /* @__PURE__ */ jsx3(Text, { variant: "bodyMd", as: "p", alignment: "center", tone: "subdued", children: "Supports JPG, PNG, WebP, SVG (max 2MB)" })
              ] }) }) }),
              uploadFetcher.data?.error && /* @__PURE__ */ jsx3(Banner, { tone: "critical", onDismiss: () => {
              }, children: uploadFetcher.data?.error || "Upload error" })
            ] }),
            /* @__PURE__ */ jsx3(
              TextField,
              {
                label: "Logo URL (Alternative)",
                value: logoUrl,
                onChange: handleLogoUrlChange,
                name: "logoUrl",
                helpText: "Or provide a direct URL to your logo",
                autoComplete: "off"
              }
            ),
            /* @__PURE__ */ jsx3(InlineStack, { align: "end", children: /* @__PURE__ */ jsx3(Button, { variant: "primary", submit: !0, children: "Save Settings" }) })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsx3(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsx3(Card, { children: /* @__PURE__ */ jsxs2("div", { style: { padding: "20px" }, children: [
          /* @__PURE__ */ jsx3(Text, { variant: "headingSm", as: "h3", children: "Preview" }),
          /* @__PURE__ */ jsx3("div", { style: { marginTop: "16px" }, children: /* @__PURE__ */ jsxs2(
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
                /* @__PURE__ */ jsx3(Text, { variant: "headingLg", as: "h2", children: brandName || "Your App Name" }),
                /* @__PURE__ */ jsx3(Text, { variant: "bodyMd", as: "p", children: tagline || "Your tagline here" })
              ]
            }
          ) })
        ] }) }) })
      ] })
    }
  );
}

// app/routes/api.admin.shop.tsx
var api_admin_shop_exports = {};
__export(api_admin_shop_exports, {
  loader: () => loader3
});
import { json as json5 } from "@remix-run/node";
async function loader3({ request }) {
  try {
    let context = await requireSession(request);
    if (new URL(request.url).searchParams.get("validate") === "true") {
      if (!await validateShopAccess(context.shop))
        return json5(createErrorResponse(
          "Shop validation failed",
          "SHOP_VALIDATION_FAILED"
        ), { status: 400 });
      let validationResponse = {
        valid: !0,
        shop: await getShopInfo(context.shop)
      }, validatedResponse = ShopValidationResponseSchema.parse(validationResponse);
      return json5(validatedResponse, {
        headers: {
          "Cache-Control": "private, max-age=300",
          // 5 minutes cache
          "Content-Type": "application/json"
        }
      });
    } else {
      let shopInfo = await getShopInfo(context.shop);
      return shopInfo ? json5(shopInfo, {
        headers: {
          "Cache-Control": "private, max-age=300",
          // 5 minutes cache
          "Content-Type": "application/json"
        }
      }) : json5(createErrorResponse(
        "Failed to retrieve shop information",
        "SHOP_INFO_ERROR"
      ), { status: 500 });
    }
  } catch (error) {
    if (console.error("Admin shop API error:", error), error instanceof Response)
      throw error;
    if (error instanceof Error) {
      if (error.message.includes("Admin API authentication failed"))
        return json5(createErrorResponse(
          "Shop authentication failed",
          "ADMIN_AUTH_ERROR"
        ), { status: 401 });
      if (error.message.includes("Shop subscription required"))
        return json5(createErrorResponse(
          "Shop subscription required for Admin API access",
          "SUBSCRIPTION_ERROR"
        ), { status: 402 });
      if (error.message.includes("rate limit"))
        return json5(createErrorResponse(
          "Admin API rate limit exceeded",
          "ADMIN_RATE_LIMIT"
        ), { status: 429 });
    }
    return json5(createErrorResponse(
      "Failed to retrieve shop information",
      "INTERNAL_ERROR"
    ), { status: 500 });
  }
}

// app/routes/auth.callback.tsx
var auth_callback_exports = {};
__export(auth_callback_exports, {
  loader: () => loader4
});
import { redirect } from "@remix-run/node";

// app/lib/shopify-auth.server.ts
import { createHmac as createHmac4, timingSafeEqual as timingSafeEqual2 } from "crypto";
function verifyShopifyHmac(query, secret) {
  try {
    let params = query instanceof URLSearchParams ? query : new URLSearchParams(query), hmac = params.get("hmac");
    if (!hmac)
      return !1;
    params.delete("hmac"), params.delete("signature");
    let sortedParams = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&"), expectedHmac = createHmac4("sha256", secret).update(sortedParams).digest("hex");
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

// app/routes/auth.callback.tsx
async function loader4({ request }) {
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

// app/routes/api.products.tsx
var api_products_exports = {};
__export(api_products_exports, {
  loader: () => loader5
});
import { json as json6 } from "@remix-run/node";

// app/lib/storefront.server.ts
var STOREFRONT_API_VERSION = "2024-01", PRODUCTS_QUERY2 = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          description(truncateAt: 250)
          images(first: 3) {
            edges {
              node {
                url(transform: { maxWidth: 600, maxHeight: 600 })
                altText
              }
            }
          }
          variants(first: 3) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
async function createStorefrontAccessToken(shopDomain) {
  try {
    let shopData = await getShopWithToken(shopDomain);
    if (!shopData)
      return console.error("Shop not found or inactive:", shopDomain), null;
    let adminUrl = `https://${shopDomain}/admin/api/${STOREFRONT_API_VERSION}/storefront_access_tokens.json`, response = await fetch(adminUrl, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": shopData.accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        storefront_access_token: {
          title: "TurnApp Mobile Access Token"
        }
      })
    });
    if (!response.ok) {
      let error = await response.text();
      return console.error("Failed to create Storefront access token:", error), null;
    }
    return (await response.json()).storefront_access_token?.access_token || null;
  } catch (error) {
    return console.error("Error creating Storefront access token:", error), null;
  }
}
async function getStorefrontAccessToken(shopDomain) {
  return await createStorefrontAccessToken(shopDomain);
}
async function queryStorefrontAPI(shopDomain, query, variables = {}) {
  try {
    let accessToken = await getStorefrontAccessToken(shopDomain);
    if (!accessToken)
      throw new Error("Failed to get Storefront access token");
    let storefrontUrl = `https://${shopDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`, response = await fetch(storefrontUrl, {
      method: "POST",
      headers: {
        "X-Shopify-Storefront-Access-Token": accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, variables })
    });
    if (!response.ok) {
      let error = await response.text();
      throw new Error(`Storefront API error: ${response.status} ${error}`);
    }
    let data = await response.json();
    if (data.errors && data.errors.length > 0)
      throw console.error("GraphQL errors:", data.errors), new Error(`GraphQL error: ${data.errors[0].message}`);
    return data;
  } catch (error) {
    throw console.error("Storefront API query failed:", error), error;
  }
}
async function fetchProducts(shopDomain, first = 10, after) {
  try {
    let variables = { first, ...after && { after } };
    return await queryStorefrontAPI(shopDomain, PRODUCTS_QUERY2, variables);
  } catch (error) {
    throw console.error("Failed to fetch products:", error), error;
  }
}
function checkStorefrontRateLimit(shopDomain) {
  return !0;
}
function transformProductForMobile(product) {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    image: product.images.edges[0]?.node.url || null,
    images: product.images.edges.map((edge) => ({
      url: edge.node.url,
      altText: edge.node.altText
    })),
    price: {
      amount: product.priceRange.minVariantPrice.amount,
      currency: product.priceRange.minVariantPrice.currencyCode
    },
    variants: product.variants.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      price: edge.node.price,
      compareAtPrice: edge.node.compareAtPrice,
      available: edge.node.availableForSale
    }))
  };
}

// app/routes/api.products.tsx
async function loader5({ request }) {
  try {
    let context = await flexibleAuth(request);
    logRequest2(request, context);
    let url = new URL(request.url), first = Math.min(parseInt(url.searchParams.get("first") || "10"), 50), after = url.searchParams.get("after") || void 0;
    if (first < 1)
      return json6(createErrorResponse(
        'Invalid "first" parameter. Must be between 1 and 50.',
        "INVALID_PARAMETER"
      ), { status: 400 });
    if (!checkStorefrontRateLimit(context.shop))
      return json6(createErrorResponse(
        "Rate limit exceeded. Please try again later.",
        "RATE_LIMIT_EXCEEDED"
      ), { status: 429 });
    let productsResponse = await fetchProducts(context.shop, first, after), transformedProducts = productsResponse.data.products.edges.map(
      (edge) => transformProductForMobile(edge.node)
    ), response = {
      products: transformedProducts,
      pageInfo: productsResponse.data.products.pageInfo,
      shop: context.shop,
      total: transformedProducts.length
    }, validatedResponse = ProductsResponseSchema.parse(response);
    return json6(validatedResponse, {
      headers: {
        "Cache-Control": "public, max-age=300",
        // 5 minutes cache
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    if (console.error("Products API error:", error), error instanceof Response)
      throw error;
    if (error instanceof Error) {
      if (error.message.includes("Storefront API error: 401"))
        return json6(createErrorResponse(
          "Shop authentication failed",
          "AUTH_ERROR"
        ), { status: 401 });
      if (error.message.includes("Storefront API error: 402"))
        return json6(createErrorResponse(
          "Shop subscription required",
          "SUBSCRIPTION_ERROR"
        ), { status: 402 });
      if (error.message.includes("Rate limit"))
        return json6(createErrorResponse(
          "Shopify rate limit exceeded",
          "SHOPIFY_RATE_LIMIT"
        ), { status: 429 });
    }
    return json6(createErrorResponse(
      "Failed to fetch products",
      "INTERNAL_ERROR"
    ), { status: 500 });
  }
}

// app/routes/api.settings.tsx
var api_settings_exports = {};
__export(api_settings_exports, {
  action: () => action4
});
import { json as json7 } from "@remix-run/node";
async function action4({ request }) {
  if (request.method !== "POST")
    return json7(createErrorResponse("Method not allowed", "METHOD_NOT_ALLOWED"), { status: 405 });
  try {
    let context = await flexibleAuth(request);
    logRequest2(request, context);
    let formData = await request.formData(), brandingData = {
      brandName: formData.get("brandName"),
      primaryColor: formData.get("primaryColor"),
      logoUrl: formData.get("logoUrl") || "",
      tagline: formData.get("tagline") || ""
    }, validatedBranding = validateBrandingData(brandingData), updatedSettings = {
      ...context.shopRecord.settings || {},
      ...validatedBranding,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return await prisma.shop.update({
      where: { shopDomain: context.shop },
      data: { settings: updatedSettings }
    }), console.log(`Updated branding settings for shop: ${context.shop}`, validatedBranding), json7({
      success: !0,
      message: "Branding settings saved successfully!",
      branding: validatedBranding
    });
  } catch (error) {
    if (console.error("Settings API error:", error), error instanceof Response)
      throw error;
    return error instanceof Error && error.message.includes("Validation failed") ? json7(createErrorResponse(
      error.message,
      "VALIDATION_ERROR"
    ), { status: 400 }) : json7(createErrorResponse(
      "Failed to update settings",
      "INTERNAL_ERROR"
    ), { status: 500 });
  }
}

// app/routes/auth.install.tsx
var auth_install_exports = {};
__export(auth_install_exports, {
  loader: () => loader6
});
import { redirect as redirect2 } from "@remix-run/node";
async function loader6({ request }) {
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
  loader: () => loader7
});
import { json as json8 } from "@remix-run/node";
async function loader7({ request }) {
  let context = await flexibleAuth(request);
  logRequest2(request, context);
  try {
    let settings = await getShopSettings(context.shop);
    if (!settings)
      return json8({ error: "Shop not found or not active" }, { status: 404 });
    let branding = {
      brandName: settings.brandName || context.shop.split(".")[0],
      primaryColor: settings.primaryColor || "#007C3B",
      logoUrl: settings.logoUrl || "",
      tagline: settings.tagline || "Your mobile shopping experience"
    }, configResponse = {
      shop: context.shop,
      branding,
      storefrontEndpoint: `https://${context.shop}/api/2024-01/graphql.json`,
      appVersion: "1.0.0"
    }, validatedConfig = ConfigResponseSchema.parse(configResponse);
    return json8(validatedConfig, {
      headers: {
        "Cache-Control": "public, max-age=300",
        // 5 minutes cache
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return console.error("Config API error:", error), json8({ error: "Internal server error" }, { status: 500 });
  }
}

// app/routes/api.upload.tsx
var api_upload_exports = {};
__export(api_upload_exports, {
  action: () => action5
});
import { json as json9, unstable_parseMultipartFormData, unstable_createFileUploadHandler } from "@remix-run/node";
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
    return json9(createErrorResponse("Method not allowed", "METHOD_NOT_ALLOWED"), { status: 405 });
  try {
    let context = await flexibleAuth(request);
    logRequest2(request, context);
    let uploadHandler = unstable_createFileUploadHandler({
      directory: path.join(process.cwd(), "public", "uploads"),
      file: ({ filename, contentType }) => {
        if (!ALLOWED_MIME_TYPES.includes(contentType))
          throw new Error(`Invalid file type: ${contentType}`);
        let ext = path.extname(filename || ""), randomId = randomBytes2(8).toString("hex");
        return `${Date.now()}-${randomId}${ext}`;
      },
      maxPartSize: MAX_FILE_SIZE
    }), formData = await unstable_parseMultipartFormData(request, uploadHandler), file = formData.get("file"), kindParam = formData.get("kind") || "logo";
    if (!file)
      return json9(createErrorResponse("No file provided", "FILE_REQUIRED"), { status: 400 });
    let validationResult = UploadRequestSchema.safeParse({ kind: kindParam });
    if (!validationResult.success)
      return json9(createErrorResponse(
        validationResult.error.errors[0].message,
        "VALIDATION_ERROR"
      ), { status: 400 });
    let { kind } = validationResult.data;
    if (file.size > MAX_FILE_SIZE)
      return json9(createErrorResponse(
        `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        "FILE_TOO_LARGE"
      ), { status: 400 });
    let fileUrl = `/uploads/${file.name}`, existingAsset = await prisma.asset.findFirst({
      where: {
        shopId: context.shopRecord.id,
        kind
      }
    });
    existingAsset && await prisma.asset.delete({
      where: { id: existingAsset.id }
    });
    let asset = await prisma.asset.create({
      data: {
        shopId: context.shopRecord.id,
        kind,
        url: fileUrl
      }
    }), response = {
      success: !0,
      asset: {
        id: asset.id,
        kind: asset.kind,
        url: asset.url,
        filename: file.name
      },
      message: `${kind} uploaded successfully`
    }, validatedResponse = UploadResponseSchema.parse(response);
    return json9(validatedResponse);
  } catch (error) {
    if (console.error("Upload API error:", error), error instanceof Response)
      throw error;
    return json9(createErrorResponse(
      error instanceof Error ? error.message : "Upload failed",
      "UPLOAD_ERROR"
    ), { status: 500 });
  }
}

// app/routes/test.oauth.tsx
var test_oauth_exports = {};
__export(test_oauth_exports, {
  default: () => TestOAuth,
  loader: () => loader8
});
import { json as json10 } from "@remix-run/node";
import { useLoaderData as useLoaderData2, Link } from "@remix-run/react";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
async function loader8() {
  let testShop = "zeytestshop", installUrl = `/auth/install?shop=${testShop}.myshopify.com`;
  return json10({
    testShop,
    installUrl,
    apiKey: process.env.SHOPIFY_API_KEY || "NOT_SET",
    appUrl: process.env.APP_URL || "NOT_SET"
  });
}
function TestOAuth() {
  let { testShop, installUrl, apiKey, appUrl } = useLoaderData2();
  return /* @__PURE__ */ jsxs3("div", { style: { fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "20px" }, children: [
    /* @__PURE__ */ jsx4("h1", { children: "OAuth Test Page" }),
    /* @__PURE__ */ jsxs3("div", { style: { marginBottom: "20px" }, children: [
      /* @__PURE__ */ jsx4("h3", { children: "Configuration:" }),
      /* @__PURE__ */ jsxs3("p", { children: [
        "Test Shop: ",
        testShop,
        ".myshopify.com"
      ] }),
      /* @__PURE__ */ jsxs3("p", { children: [
        "API Key: ",
        apiKey
      ] }),
      /* @__PURE__ */ jsxs3("p", { children: [
        "App URL: ",
        appUrl
      ] })
    ] }),
    /* @__PURE__ */ jsxs3("div", { style: { marginBottom: "20px" }, children: [
      /* @__PURE__ */ jsx4("h3", { children: "Test OAuth Flow:" }),
      /* @__PURE__ */ jsxs3(
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
        }
      )
    ] }),
    /* @__PURE__ */ jsxs3("div", { style: { marginTop: "20px", fontSize: "14px", color: "#666" }, children: [
      /* @__PURE__ */ jsx4("p", { children: "\u26A0\uFE0F Make sure to:" }),
      /* @__PURE__ */ jsxs3("ul", { children: [
        /* @__PURE__ */ jsx4("li", { children: "Set SHOPIFY_API_KEY and SHOPIFY_API_SECRET in .env" }),
        /* @__PURE__ */ jsx4("li", { children: "Update APP_URL with your ngrok URL" }),
        /* @__PURE__ */ jsx4("li", { children: "Add the callback URL to your Shopify Partner Dashboard" })
      ] })
    ] })
  ] });
}

// app/routes/readiness.tsx
var readiness_exports = {};
__export(readiness_exports, {
  loader: () => loader9
});
import { json as json11 } from "@remix-run/node";
async function loader9({ request }) {
  let startTime = Date.now();
  try {
    logRequest(request);
    let readiness = await checkReadiness(), validatedReadiness = HealthResponseSchema.parse(readiness), duration = Date.now() - startTime, statusCode = readiness.status === "healthy" ? 200 : 503;
    return logRequest(request, void 0, { duration, statusCode }), json11(validatedReadiness, {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  } catch (error) {
    console.error("Readiness check endpoint error:", error);
    let duration = Date.now() - startTime, errorMessage = error instanceof Error ? error.message : "Readiness check failed";
    return logRequest(request, void 0, {
      duration,
      statusCode: 503,
      error: errorMessage
    }), json11(
      {
        status: "unhealthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        error: errorMessage
      },
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      }
    );
  }
}

// app/routes/healthz.tsx
var healthz_exports = {};
__export(healthz_exports, {
  loader: () => loader10
});
import { json as json12 } from "@remix-run/node";
async function loader10({ request }) {
  let startTime = Date.now();
  try {
    logRequest(request);
    let health = await performHealthCheck(!1), validatedHealth = HealthResponseSchema.parse(health), duration = Date.now() - startTime;
    return logRequest(request, void 0, { duration, statusCode: 200 }), json12(validatedHealth, {
      status: health.status === "healthy" ? 200 : 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  } catch (error) {
    console.error("Health check endpoint error:", error);
    let duration = Date.now() - startTime, errorMessage = error instanceof Error ? error.message : "Health check failed";
    return logRequest(request, void 0, {
      duration,
      statusCode: 503,
      error: errorMessage
    }), json12(
      {
        status: "unhealthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        error: errorMessage
      },
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      }
    );
  }
}

// app/routes/_index.tsx
var index_exports = {};
__export(index_exports, {
  default: () => Index,
  loader: () => loader11
});
import { json as json13 } from "@remix-run/node";
import { useLoaderData as useLoaderData3, Link as Link2 } from "@remix-run/react";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
async function loader11() {
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
    return json13({
      message: "TurnApp - Shopify App Admin Dashboard",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      dbStatus: "connected",
      shopCount,
      recentShops
    });
  } catch {
    return json13({
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
  return /* @__PURE__ */ jsxs4("div", { style: { fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "20px" }, children: [
    /* @__PURE__ */ jsx5("h1", { children: message }),
    /* @__PURE__ */ jsxs4("p", { children: [
      "Server Time: ",
      timestamp
    ] }),
    /* @__PURE__ */ jsxs4("p", { children: [
      "Database Status: ",
      dbStatus
    ] }),
    /* @__PURE__ */ jsxs4("p", { children: [
      "Registered Shops: ",
      shopCount
    ] }),
    /* @__PURE__ */ jsx5("p", { children: "Status: OAuth Flow Implemented \u2705" }),
    /* @__PURE__ */ jsxs4("div", { style: { marginTop: "30px" }, children: [
      /* @__PURE__ */ jsx5("h3", { children: "Development Tools:" }),
      /* @__PURE__ */ jsx5(
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
        }
      )
    ] }),
    recentShops.length > 0 && /* @__PURE__ */ jsxs4("div", { style: { marginTop: "30px" }, children: [
      /* @__PURE__ */ jsx5("h3", { children: "Recent Shop Installations:" }),
      /* @__PURE__ */ jsx5("ul", { children: recentShops.map((shop) => /* @__PURE__ */ jsxs4("li", { children: [
        shop.shopDomain,
        " - Installed: ",
        new Date(shop.installedAt).toLocaleString(),
        shop.uninstalledAt && ` (Uninstalled: ${new Date(shop.uninstalledAt).toLocaleString()})`
      ] }, shop.shopDomain)) })
    ] })
  ] });
}

// app/routes/admin.tsx
var admin_exports = {};
__export(admin_exports, {
  default: () => AdminLayout,
  loader: () => loader12
});
import { json as json14 } from "@remix-run/node";
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
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
async function loader12({ request }) {
  let url = new URL(request.url), context = await flexibleAuth(request);
  return logRequest2(request, context), json14({
    shop: context.shop,
    host: url.searchParams.get("host"),
    appBridgeConfig: {
      apiKey: process.env.SHOPIFY_API_KEY || "",
      shop: context.shop,
      host: url.searchParams.get("host") || ""
    }
  });
}
function AdminLayout() {
  let { shop } = useLoaderData4(), location = useLocation(), [mobileNavigationActive, setMobileNavigationActive] = useState2(!1), toggleMobileNavigationActive = useCallback2(
    () => setMobileNavigationActive((mobileNavigationActive2) => !mobileNavigationActive2),
    []
  ), navigationMarkup = /* @__PURE__ */ jsx6(Navigation, { location: location.pathname, children: /* @__PURE__ */ jsx6(
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
    }
  ) }), topBarMarkup = /* @__PURE__ */ jsx6(
    TopBar,
    {
      showNavigationToggle: !0,
      onNavigationToggle: toggleMobileNavigationActive
    }
  ), currentPath = location.pathname;
  return /* @__PURE__ */ jsx6(
    Frame,
    {
      topBar: topBarMarkup,
      navigation: navigationMarkup,
      showMobileNavigation: mobileNavigationActive,
      onNavigationDismiss: toggleMobileNavigationActive,
      children: currentPath === "/admin" || currentPath === "/admin/" ? /* @__PURE__ */ jsx6(Page2, { title: "TurnApp Overview", children: /* @__PURE__ */ jsxs5(Layout2, { children: [
        /* @__PURE__ */ jsx6(Layout2.Section, { children: /* @__PURE__ */ jsx6(Card2, { children: /* @__PURE__ */ jsxs5("div", { style: { padding: "20px" }, children: [
          /* @__PURE__ */ jsx6(Text2, { variant: "headingMd", as: "h2", children: "Welcome to TurnApp" }),
          /* @__PURE__ */ jsx6(Text2, { variant: "bodyMd", as: "p", tone: "subdued", children: "Transform your Shopify store into a mobile shopping app" }),
          /* @__PURE__ */ jsx6("div", { style: { marginTop: "20px" }, children: /* @__PURE__ */ jsxs5(Text2, { variant: "headingSm", as: "h3", children: [
            "Shop: ",
            shop
          ] }) }),
          /* @__PURE__ */ jsx6("div", { style: { marginTop: "20px" }, children: /* @__PURE__ */ jsx6(Link3, { to: "/admin/branding", children: /* @__PURE__ */ jsx6(Button2, { variant: "primary", children: "Configure Branding" }) }) })
        ] }) }) }),
        /* @__PURE__ */ jsx6(Layout2.Section, { variant: "oneThird", children: /* @__PURE__ */ jsx6(Card2, { children: /* @__PURE__ */ jsxs5("div", { style: { padding: "20px" }, children: [
          /* @__PURE__ */ jsx6(Text2, { variant: "headingSm", as: "h3", children: "Quick Stats" }),
          /* @__PURE__ */ jsxs5("div", { style: { marginTop: "12px" }, children: [
            /* @__PURE__ */ jsx6(Text2, { variant: "bodyMd", as: "p", children: "Status: Active" }),
            /* @__PURE__ */ jsx6(Text2, { variant: "bodyMd", as: "p", children: "App Version: 1.0.0" })
          ] })
        ] }) }) })
      ] }) }) : /* @__PURE__ */ jsx6(Outlet2, {})
    }
  );
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-JJAXA5IT.js", imports: ["/build/_shared/chunk-6OAKFNAK.js", "/build/_shared/chunk-Q3IECNXJ.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-PJLMP6NN.js", imports: ["/build/_shared/chunk-Y54SY5VO.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-POCWQ2ZL.js", imports: ["/build/_shared/chunk-PGOH7JLP.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/admin": { id: "routes/admin", parentId: "root", path: "admin", index: void 0, caseSensitive: void 0, module: "/build/routes/admin-CNBVJH3B.js", imports: ["/build/_shared/chunk-YBNSPA7F.js", "/build/_shared/chunk-PGOH7JLP.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/admin.branding": { id: "routes/admin.branding", parentId: "routes/admin", path: "branding", index: void 0, caseSensitive: void 0, module: "/build/routes/admin.branding-I2TKKB3E.js", imports: ["/build/_shared/chunk-Y54SY5VO.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.admin.products": { id: "routes/api.admin.products", parentId: "root", path: "api/admin/products", index: void 0, caseSensitive: void 0, module: "/build/routes/api.admin.products-UERGH3GH.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.admin.shop": { id: "routes/api.admin.shop", parentId: "root", path: "api/admin/shop", index: void 0, caseSensitive: void 0, module: "/build/routes/api.admin.shop-MOMKHQXW.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.config": { id: "routes/api.config", parentId: "root", path: "api/config", index: void 0, caseSensitive: void 0, module: "/build/routes/api.config-VYVUKLOV.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.products": { id: "routes/api.products", parentId: "root", path: "api/products", index: void 0, caseSensitive: void 0, module: "/build/routes/api.products-HTAHYVUM.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.settings": { id: "routes/api.settings", parentId: "root", path: "api/settings", index: void 0, caseSensitive: void 0, module: "/build/routes/api.settings-WC5MSFW2.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.upload": { id: "routes/api.upload", parentId: "root", path: "api/upload", index: void 0, caseSensitive: void 0, module: "/build/routes/api.upload-EDJPRBR7.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/auth.callback": { id: "routes/auth.callback", parentId: "root", path: "auth/callback", index: void 0, caseSensitive: void 0, module: "/build/routes/auth.callback-YM4JZOLA.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/auth.install": { id: "routes/auth.install", parentId: "root", path: "auth/install", index: void 0, caseSensitive: void 0, module: "/build/routes/auth.install-DXK6BF6B.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/healthz": { id: "routes/healthz", parentId: "root", path: "healthz", index: void 0, caseSensitive: void 0, module: "/build/routes/healthz-FNKLRQV4.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/readiness": { id: "routes/readiness", parentId: "root", path: "readiness", index: void 0, caseSensitive: void 0, module: "/build/routes/readiness-OOG77MDA.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/test.oauth": { id: "routes/test.oauth", parentId: "root", path: "test/oauth", index: void 0, caseSensitive: void 0, module: "/build/routes/test.oauth-EMIJO535.js", imports: ["/build/_shared/chunk-PGOH7JLP.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/webhooks.app_uninstalled": { id: "routes/webhooks.app_uninstalled", parentId: "root", path: "webhooks/app_uninstalled", index: void 0, caseSensitive: void 0, module: "/build/routes/webhooks.app_uninstalled-PUWFJRDX.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/webhooks.products_update": { id: "routes/webhooks.products_update", parentId: "root", path: "webhooks/products_update", index: void 0, caseSensitive: void 0, module: "/build/routes/webhooks.products_update-GUQ3L4LT.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "364270eb", hmr: void 0, url: "/build/manifest-364270EB.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "production", assetsBuildDirectory = "public/build", future = { v3_fetcherPersist: !1, v3_relativeSplatPath: !1, v3_throwAbortReason: !1, v3_routeConfig: !1, v3_singleFetch: !1, v3_lazyRouteDiscovery: !1, unstable_optimizeDeps: !1 }, publicPath = "/build/", entry = { module: entry_server_node_exports }, routes = {
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
  "routes/api.admin.products": {
    id: "routes/api.admin.products",
    parentId: "root",
    path: "api/admin/products",
    index: void 0,
    caseSensitive: void 0,
    module: api_admin_products_exports
  },
  "routes/admin.branding": {
    id: "routes/admin.branding",
    parentId: "routes/admin",
    path: "branding",
    index: void 0,
    caseSensitive: void 0,
    module: admin_branding_exports
  },
  "routes/api.admin.shop": {
    id: "routes/api.admin.shop",
    parentId: "root",
    path: "api/admin/shop",
    index: void 0,
    caseSensitive: void 0,
    module: api_admin_shop_exports
  },
  "routes/auth.callback": {
    id: "routes/auth.callback",
    parentId: "root",
    path: "auth/callback",
    index: void 0,
    caseSensitive: void 0,
    module: auth_callback_exports
  },
  "routes/api.products": {
    id: "routes/api.products",
    parentId: "root",
    path: "api/products",
    index: void 0,
    caseSensitive: void 0,
    module: api_products_exports
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
  "routes/readiness": {
    id: "routes/readiness",
    parentId: "root",
    path: "readiness",
    index: void 0,
    caseSensitive: void 0,
    module: readiness_exports
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
