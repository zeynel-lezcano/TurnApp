import {
  require_node
} from "/build/_shared/chunk-G7CHZRZX.js";
import {
  Link,
  useLoaderData
} from "/build/_shared/chunk-LW6LB2HF.js";
import {
  createHotContext
} from "/build/_shared/chunk-ALN5UVCC.js";
import "/build/_shared/chunk-UWV35TSL.js";
import "/build/_shared/chunk-56LDNGDG.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-PMI65YMG.js";
import "/build/_shared/chunk-2Q7FBYOG.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/routes/test.oauth.tsx
var import_node = __toESM(require_node(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/test.oauth.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/test.oauth.tsx"
  );
  import.meta.hot.lastModified = "1755762071972.3708";
}
function TestOAuth() {
  _s();
  const {
    testShop,
    installUrl,
    apiKey,
    appUrl
  } = useLoaderData();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
    fontFamily: "system-ui, sans-serif",
    lineHeight: "1.8",
    padding: "20px"
  }, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { children: "OAuth Test Page" }, void 0, false, {
      fileName: "app/routes/test.oauth.tsx",
      lineNumber: 47,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
      marginBottom: "20px"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { children: "Configuration:" }, void 0, false, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 52,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: [
        "Test Shop: ",
        testShop,
        ".myshopify.com"
      ] }, void 0, true, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 53,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: [
        "API Key: ",
        apiKey
      ] }, void 0, true, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 54,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: [
        "App URL: ",
        appUrl
      ] }, void 0, true, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 55,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/test.oauth.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
      marginBottom: "20px"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { children: "Test OAuth Flow:" }, void 0, false, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 61,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: installUrl, style: {
        padding: "10px 20px",
        backgroundColor: "#007C3B",
        color: "white",
        textDecoration: "none",
        borderRadius: "4px"
      }, children: [
        "Install App to ",
        testShop,
        ".myshopify.com"
      ] }, void 0, true, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 62,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/test.oauth.tsx",
      lineNumber: 58,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
      marginTop: "20px",
      fontSize: "14px",
      color: "#666"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "\u26A0\uFE0F Make sure to:" }, void 0, false, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 78,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "Set SHOPIFY_API_KEY and SHOPIFY_API_SECRET in .env" }, void 0, false, {
          fileName: "app/routes/test.oauth.tsx",
          lineNumber: 80,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "Update APP_URL with your ngrok URL" }, void 0, false, {
          fileName: "app/routes/test.oauth.tsx",
          lineNumber: 81,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "Add the callback URL to your Shopify Partner Dashboard" }, void 0, false, {
          fileName: "app/routes/test.oauth.tsx",
          lineNumber: 82,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/test.oauth.tsx",
        lineNumber: 79,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/test.oauth.tsx",
      lineNumber: 73,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/test.oauth.tsx",
    lineNumber: 42,
    columnNumber: 10
  }, this);
}
_s(TestOAuth, "LwIabIOtOii9+ayRA300vFyXHug=", false, function() {
  return [useLoaderData];
});
_c = TestOAuth;
var _c;
$RefreshReg$(_c, "TestOAuth");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  TestOAuth as default
};
//# sourceMappingURL=/build/routes/test.oauth-2MXZLR7I.js.map
