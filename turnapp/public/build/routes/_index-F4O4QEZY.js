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
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-PMI65YMG.js";
import "/build/_shared/chunk-56LDNGDG.js";
import "/build/_shared/chunk-2Q7FBYOG.js";
import {
  __commonJS,
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// empty-module:~/lib/prisma.server
var require_prisma = __commonJS({
  "empty-module:~/lib/prisma.server"(exports, module) {
    module.exports = {};
  }
});

// app/routes/_index.tsx
var import_node = __toESM(require_node(), 1);
var import_prisma = __toESM(require_prisma(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/_index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/_index.tsx"
  );
  import.meta.hot.lastModified = "1755762071971.7966";
}
function Index() {
  _s();
  const {
    message,
    timestamp,
    dbStatus,
    shopCount,
    recentShops
  } = useLoaderData();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
    fontFamily: "system-ui, sans-serif",
    lineHeight: "1.8",
    padding: "20px"
  }, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { children: message }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 72,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: [
      "Server Time: ",
      timestamp
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 73,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: [
      "Database Status: ",
      dbStatus
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 74,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: [
      "Registered Shops: ",
      shopCount
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 75,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Status: OAuth Flow Implemented \u2705" }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 76,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
      marginTop: "30px"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { children: "Development Tools:" }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 81,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: "/test/oauth", style: {
        padding: "8px 16px",
        backgroundColor: "#007C3B",
        color: "white",
        textDecoration: "none",
        borderRadius: "4px",
        marginRight: "10px"
      }, children: "Test OAuth Flow" }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 82,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 78,
      columnNumber: 7
    }, this),
    recentShops.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
      marginTop: "30px"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { children: "Recent Shop Installations:" }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 97,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", { children: recentShops.map((shop) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: [
        shop.shopDomain,
        " - Installed: ",
        new Date(shop.installedAt).toLocaleString(),
        shop.uninstalledAt && ` (Uninstalled: ${new Date(shop.uninstalledAt).toLocaleString()})`
      ] }, shop.shopDomain, true, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 99,
        columnNumber: 38
      }, this)) }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 98,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 94,
      columnNumber: 34
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 67,
    columnNumber: 10
  }, this);
}
_s(Index, "lEtFoZN/aQs7RFk56r7Edmgnfgc=", false, function() {
  return [useLoaderData];
});
_c = Index;
var _c;
$RefreshReg$(_c, "Index");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Index as default
};
//# sourceMappingURL=/build/routes/_index-F4O4QEZY.js.map
