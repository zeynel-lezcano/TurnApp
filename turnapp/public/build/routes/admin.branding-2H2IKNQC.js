import {
  require_session
} from "/build/_shared/chunk-EV32D4DT.js";
import {
  require_node
} from "/build/_shared/chunk-G7CHZRZX.js";
import {
  Banner,
  Button,
  Card,
  Divider,
  FormLayout,
  InlineStack,
  Layout,
  Page,
  Text,
  TextField
} from "/build/_shared/chunk-ANTKSAN7.js";
import {
  Form,
  useActionData,
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
import {
  require_react
} from "/build/_shared/chunk-2Q7FBYOG.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/routes/admin.branding.tsx
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
    window.$RefreshRuntime$.register(type, '"app/routes/admin.branding.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/admin.branding.tsx"
  );
  import.meta.hot.lastModified = "1755762071971.8945";
}
function AdminBranding() {
  _s();
  const {
    shop,
    brandingSettings
  } = useLoaderData();
  const actionData = useActionData();
  const [brandName, setBrandName] = (0, import_react2.useState)(brandingSettings.brandName);
  const [primaryColor, setPrimaryColor] = (0, import_react2.useState)(brandingSettings.primaryColor);
  const [logoUrl, setLogoUrl] = (0, import_react2.useState)(brandingSettings.logoUrl);
  const [tagline, setTagline] = (0, import_react2.useState)(brandingSettings.tagline);
  const handleBrandNameChange = (0, import_react2.useCallback)((value) => setBrandName(value), []);
  const handleLogoUrlChange = (0, import_react2.useCallback)((value) => setLogoUrl(value), []);
  const handleTaglineChange = (0, import_react2.useCallback)((value) => setTagline(value), []);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Page, { title: "Branding Configuration", subtitle: "Customize your mobile app appearance", backAction: {
    url: "/admin"
  }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Layout, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Layout.Section, { children: [
      actionData?.success && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Banner, { tone: "success", onDismiss: () => {
      }, children: actionData.message }, void 0, false, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 135,
        columnNumber: 35
      }, this),
      actionData?.error && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Banner, { tone: "critical", onDismiss: () => {
      }, children: actionData.error }, void 0, false, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 138,
        columnNumber: 33
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Card, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { method: "post", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FormLayout, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "headingSm", as: "h3", children: "Basic Information" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 145,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TextField, { label: "App Name", value: brandName, onChange: handleBrandNameChange, name: "brandName", helpText: "This will be the name of your mobile app", autoComplete: "off" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 147,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TextField, { label: "Tagline", value: tagline, onChange: handleTaglineChange, name: "tagline", helpText: "A short description for your mobile app", autoComplete: "off" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 149,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Divider, {}, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 151,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "headingSm", as: "h3", children: "Visual Design" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 153,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TextField, { label: "Primary Color", value: primaryColor, onChange: setPrimaryColor, name: "primaryColor", helpText: "Hex color code for your app's primary color", autoComplete: "off", prefix: "#", placeholder: "007C3B" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 155,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TextField, { label: "Logo URL", value: logoUrl, onChange: handleLogoUrlChange, name: "logoUrl", helpText: "URL to your app logo (optional)", autoComplete: "off" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 157,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(InlineStack, { align: "end", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { variant: "primary", submit: true, children: "Save Settings" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 160,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 159,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 144,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 143,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 142,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/admin.branding.tsx",
      lineNumber: 134,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Card, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
      padding: "20px"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "headingSm", as: "h3", children: "Preview" }, void 0, false, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 174,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
        marginTop: "16px"
      }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
        padding: "20px",
        backgroundColor: primaryColor,
        color: "white",
        borderRadius: "8px",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "headingLg", as: "h2", children: brandName || "Your App Name" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 185,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "bodyMd", as: "p", children: tagline || "Your tagline here" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 188,
          columnNumber: 19
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 178,
        columnNumber: 17
      }, this) }, void 0, false, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 175,
        columnNumber: 15
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/admin.branding.tsx",
      lineNumber: 171,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/routes/admin.branding.tsx",
      lineNumber: 170,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/routes/admin.branding.tsx",
      lineNumber: 169,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/admin.branding.tsx",
    lineNumber: 133,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/admin.branding.tsx",
    lineNumber: 130,
    columnNumber: 10
  }, this);
}
_s(AdminBranding, "s4vVTHiP5RDtUYa7F6rc9vXnvVM=", false, function() {
  return [useLoaderData, useActionData];
});
_c = AdminBranding;
var _c;
$RefreshReg$(_c, "AdminBranding");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  AdminBranding as default
};
//# sourceMappingURL=/build/routes/admin.branding-2H2IKNQC.js.map
