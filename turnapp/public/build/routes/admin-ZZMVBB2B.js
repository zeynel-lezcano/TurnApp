import {
  require_session
} from "/build/_shared/chunk-EV32D4DT.js";
import {
  require_node
} from "/build/_shared/chunk-G7CHZRZX.js";
import {
  Button,
  Card,
  Frame,
  Layout,
  Navigation,
  Page,
  Text,
  TopBar
} from "/build/_shared/chunk-RRH55SMP.js";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation
} from "/build/_shared/chunk-LW6LB2HF.js";
import {
  createHotContext
} from "/build/_shared/chunk-ALN5UVCC.js";
import "/build/_shared/chunk-UWV35TSL.js";
import "/build/_shared/chunk-56LDNGDG.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-PMI65YMG.js";
import {
  require_react
} from "/build/_shared/chunk-2Q7FBYOG.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/routes/admin.tsx
var import_node = __toESM(require_node(), 1);
var import_session = __toESM(require_session(), 1);
var import_react2 = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/admin.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/admin.tsx"
  );
  import.meta.hot.lastModified = "1755762071971.9812";
}
function AdminLayout() {
  _s();
  const {
    shop
  } = useLoaderData();
  const location = useLocation();
  const [mobileNavigationActive, setMobileNavigationActive] = (0, import_react2.useState)(false);
  const toggleMobileNavigationActive = (0, import_react2.useCallback)(() => setMobileNavigationActive((mobileNavigationActive2) => !mobileNavigationActive2), []);
  const navigationMarkup = /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Navigation, { location: location.pathname, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Navigation.Section, { items: [{
    url: "/admin",
    label: "Overview",
    icon: "HomeIcon",
    selected: location.pathname === "/admin"
  }, {
    url: "/admin/branding",
    label: "Branding",
    icon: "ColorIcon",
    selected: location.pathname === "/admin/branding"
  }] }, void 0, false, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 77,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 76,
    columnNumber: 28
  }, this);
  const topBarMarkup = /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TopBar, { showNavigationToggle: true, onNavigationToggle: toggleMobileNavigationActive }, void 0, false, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 89,
    columnNumber: 24
  }, this);
  const currentPath = location.pathname;
  const isOverview = currentPath === "/admin" || currentPath === "/admin/";
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Frame, { topBar: topBarMarkup, navigation: navigationMarkup, showMobileNavigation: mobileNavigationActive, onNavigationDismiss: toggleMobileNavigationActive, children: isOverview ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Page, { title: "TurnApp Overview", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Layout, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Layout.Section, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Card, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
      padding: "20px"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "headingMd", as: "h2", children: "Welcome to TurnApp" }, void 0, false, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 100,
        columnNumber: 19
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "bodyMd", as: "p", tone: "subdued", children: "Transform your Shopify store into a mobile shopping app" }, void 0, false, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 101,
        columnNumber: 19
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
        marginTop: "20px"
      }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "headingSm", as: "h3", children: [
        "Shop: ",
        shop
      ] }, void 0, true, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 107,
        columnNumber: 21
      }, this) }, void 0, false, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 104,
        columnNumber: 19
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
        marginTop: "20px"
      }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: "/admin/branding", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { variant: "primary", children: "Configure Branding" }, void 0, false, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 113,
        columnNumber: 23
      }, this) }, void 0, false, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 112,
        columnNumber: 21
      }, this) }, void 0, false, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 109,
        columnNumber: 19
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 97,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 96,
      columnNumber: 15
    }, this) }, void 0, false, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 95,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Card, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
      padding: "20px"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "headingSm", as: "h3", children: "Quick Stats" }, void 0, false, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 125,
        columnNumber: 19
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
        marginTop: "12px"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "bodyMd", as: "p", children: "Status: Active" }, void 0, false, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 129,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "bodyMd", as: "p", children: "App Version: 1.0.0" }, void 0, false, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 130,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 126,
        columnNumber: 19
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 122,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 121,
      columnNumber: 15
    }, this) }, void 0, false, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 120,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 94,
    columnNumber: 11
  }, this) }, void 0, false, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 93,
    columnNumber: 21
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Outlet, {}, void 0, false, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 136,
    columnNumber: 19
  }, this) }, void 0, false, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 92,
    columnNumber: 10
  }, this);
}
_s(AdminLayout, "N9XBbSrRALMepVlu7bCeVLiZ+UI=", false, function() {
  return [useLoaderData, useLocation];
});
_c = AdminLayout;
var _c;
$RefreshReg$(_c, "AdminLayout");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  AdminLayout as default
};
//# sourceMappingURL=/build/routes/admin-ZZMVBB2B.js.map
