import {
  require_middleware
} from "/build/_shared/chunk-Q4XQCCJX.js";
import {
  require_node
} from "/build/_shared/chunk-G7CHZRZX.js";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Divider,
  DropZone,
  FormLayout,
  Icon,
  InlineStack,
  Layout,
  Page,
  Text,
  TextField,
  Thumbnail
} from "/build/_shared/chunk-RRH55SMP.js";
import {
  Form,
  useActionData,
  useFetcher,
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
import {
  require_react
} from "/build/_shared/chunk-2Q7FBYOG.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/routes/admin.branding.tsx
var import_node = __toESM(require_node(), 1);
var import_middleware = __toESM(require_middleware(), 1);
var import_react4 = __toESM(require_react(), 1);

// node_modules/@shopify/polaris-icons/dist/icons/ImageIcon.svg.mjs
var import_react = __toESM(require_react(), 1);
var SvgImageIcon = function SvgImageIcon2(props) {
  return /* @__PURE__ */ import_react.default.createElement("svg", Object.assign({
    viewBox: "0 0 20 20"
  }, props), /* @__PURE__ */ import_react.default.createElement("path", {
    d: "M12.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
  }), /* @__PURE__ */ import_react.default.createElement("path", {
    fillRule: "evenodd",
    d: "M9.018 3.5h1.964c.813 0 1.469 0 2 .043.546.045 1.026.14 1.47.366a3.75 3.75 0 0 1 1.64 1.639c.226.444.32.924.365 1.47.043.531.043 1.187.043 2v1.964c0 .813 0 1.469-.043 2-.045.546-.14 1.026-.366 1.47a3.75 3.75 0 0 1-1.639 1.64c-.444.226-.924.32-1.47.365-.531.043-1.187.043-2 .043h-1.964c-.813 0-1.469 0-2-.043-.546-.045-1.026-.14-1.47-.366a3.75 3.75 0 0 1-1.64-1.639c-.226-.444-.32-.924-.365-1.47-.043-.531-.043-1.187-.043-2v-1.964c0-.813 0-1.469.043-2 .045-.546.14-1.026.366-1.47a3.75 3.75 0 0 1 1.639-1.64c.444-.226.924-.32 1.47-.365.531-.043 1.187-.043 2-.043Zm-1.877 1.538c-.454.037-.715.107-.912.207a2.25 2.25 0 0 0-.984.984c-.1.197-.17.458-.207.912-.037.462-.038 1.057-.038 1.909v1.428l.723-.867a1.75 1.75 0 0 1 2.582-.117l2.695 2.695 1.18-1.18a1.75 1.75 0 0 1 2.604.145l.216.27v-2.374c0-.852 0-1.447-.038-1.91-.037-.453-.107-.714-.207-.911a2.25 2.25 0 0 0-.984-.984c-.197-.1-.458-.17-.912-.207-.462-.037-1.056-.038-1.909-.038h-1.9c-.852 0-1.447 0-1.91.038Zm-2.103 7.821a7.12 7.12 0 0 1-.006-.08.746.746 0 0 0 .044-.049l1.8-2.159a.25.25 0 0 1 .368-.016l3.226 3.225a.75.75 0 0 0 1.06 0l1.71-1.71a.25.25 0 0 1 .372.021l1.213 1.516c-.021.06-.045.114-.07.165-.216.423-.56.767-.984.983-.197.1-.458.17-.912.207-.462.037-1.056.038-1.909.038h-1.9c-.852 0-1.447 0-1.91-.038-.453-.037-.714-.107-.911-.207a2.25 2.25 0 0 1-.984-.984c-.1-.197-.17-.458-.207-.912Z"
  }));
};
SvgImageIcon.displayName = "ImageIcon";

// node_modules/@shopify/polaris-icons/dist/index.mjs
var import_react2 = __toESM(require_react(), 1);

// app/routes/admin.branding.tsx
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
  import.meta.hot.lastModified = "1755766423683.6448";
}
function AdminBranding() {
  _s();
  const {
    shop,
    brandingSettings
  } = useLoaderData();
  const actionData = useActionData();
  const uploadFetcher = useFetcher();
  const [brandName, setBrandName] = (0, import_react4.useState)(brandingSettings.brandName);
  const [primaryColor, setPrimaryColor] = (0, import_react4.useState)(brandingSettings.primaryColor);
  const [logoUrl, setLogoUrl] = (0, import_react4.useState)(brandingSettings.logoUrl);
  const [tagline, setTagline] = (0, import_react4.useState)(brandingSettings.tagline);
  const [uploadedFile, setUploadedFile] = (0, import_react4.useState)(null);
  const handleBrandNameChange = (0, import_react4.useCallback)((value) => setBrandName(value), []);
  const handleLogoUrlChange = (0, import_react4.useCallback)((value) => setLogoUrl(value), []);
  const handleTaglineChange = (0, import_react4.useCallback)((value) => setTagline(value), []);
  const handleDropZoneDrop = (0, import_react4.useCallback)((files) => {
    const file = files[0];
    if (file) {
      setUploadedFile(file);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "logo");
      uploadFetcher.submit(formData, {
        method: "POST",
        action: `/api/upload?shop=${shop}`,
        encType: "multipart/form-data"
      });
    }
  }, [shop, uploadFetcher]);
  const uploadData = uploadFetcher.data;
  if (uploadData?.success && uploadData.asset?.url && uploadData.asset.url !== logoUrl) {
    setLogoUrl(uploadData.asset.url);
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Page, { title: "Branding Configuration", subtitle: "Customize your mobile app appearance", backAction: {
    url: "/admin"
  }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Layout, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Layout.Section, { children: [
      actionData?.success && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Banner, { tone: "success", onDismiss: () => {
      }, children: actionData.message }, void 0, false, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 134,
        columnNumber: 35
      }, this),
      actionData?.error && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Banner, { tone: "critical", onDismiss: () => {
      }, children: actionData.error }, void 0, false, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 137,
        columnNumber: 33
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Card, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { method: "post", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FormLayout, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "headingSm", as: "h3", children: "Basic Information" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 144,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TextField, { label: "App Name", value: brandName, onChange: handleBrandNameChange, name: "brandName", helpText: "This will be the name of your mobile app", autoComplete: "off" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 146,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TextField, { label: "Tagline", value: tagline, onChange: handleTaglineChange, name: "tagline", helpText: "A short description for your mobile app", autoComplete: "off" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 148,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Divider, {}, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 150,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "headingSm", as: "h3", children: "Visual Design" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 152,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TextField, { label: "Primary Color", value: primaryColor, onChange: setPrimaryColor, name: "primaryColor", helpText: "Hex color code for your app's primary color", autoComplete: "off", prefix: "#", placeholder: "007C3B" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 154,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "bodyMd", as: "p", fontWeight: "medium", children: "Logo Upload" }, void 0, false, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 157,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
            marginTop: "8px"
          }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropZone, { onDrop: handleDropZoneDrop, accept: "image/*", type: "image", children: uploadedFile ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BlockStack, { gap: "200", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Thumbnail, { source: URL.createObjectURL(uploadedFile), alt: uploadedFile.name, size: "large" }, void 0, false, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 163,
              columnNumber: 27
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "bodyMd", as: "p", alignment: "center", children: uploadedFile.name }, void 0, false, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 164,
              columnNumber: 27
            }, this),
            uploadFetcher.state === "submitting" && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "bodyMd", as: "p", alignment: "center", children: "Uploading..." }, void 0, false, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 167,
              columnNumber: 68
            }, this),
            uploadFetcher.data?.success && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "bodyMd", as: "p", alignment: "center", tone: "success", children: "Upload successful!" }, void 0, false, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 170,
              columnNumber: 59
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 162,
            columnNumber: 39
          }, this) : logoUrl ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BlockStack, { gap: "200", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Thumbnail, { source: logoUrl, alt: "Current logo", size: "large" }, void 0, false, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 174,
              columnNumber: 27
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "bodyMd", as: "p", alignment: "center", children: "Current logo" }, void 0, false, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 175,
              columnNumber: 27
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 173,
            columnNumber: 51
          }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BlockStack, { gap: "200", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { source: SvgImageIcon, tone: "subdued" }, void 0, false, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 179,
              columnNumber: 27
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "bodyMd", as: "p", alignment: "center", children: "Drop logo here or click to upload" }, void 0, false, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 180,
              columnNumber: 27
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "bodyMd", as: "p", alignment: "center", tone: "subdued", children: "Supports JPG, PNG, WebP, SVG (max 2MB)" }, void 0, false, {
              fileName: "app/routes/admin.branding.tsx",
              lineNumber: 183,
              columnNumber: 27
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 178,
            columnNumber: 41
          }, this) }, void 0, false, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 161,
            columnNumber: 21
          }, this) }, void 0, false, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 158,
            columnNumber: 19
          }, this),
          uploadFetcher.data?.error && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Banner, { tone: "critical", onDismiss: () => {
          }, children: uploadFetcher.data?.error || "Upload error" }, void 0, false, {
            fileName: "app/routes/admin.branding.tsx",
            lineNumber: 189,
            columnNumber: 49
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 156,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TextField, { label: "Logo URL (Alternative)", value: logoUrl, onChange: handleLogoUrlChange, name: "logoUrl", helpText: "Or provide a direct URL to your logo", autoComplete: "off" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 194,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(InlineStack, { align: "end", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { variant: "primary", submit: true, children: "Save Settings" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 197,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 196,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 143,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 142,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 141,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/admin.branding.tsx",
      lineNumber: 133,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Card, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
      padding: "20px"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "headingSm", as: "h3", children: "Preview" }, void 0, false, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 211,
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
          lineNumber: 222,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { variant: "bodyMd", as: "p", children: tagline || "Your tagline here" }, void 0, false, {
          fileName: "app/routes/admin.branding.tsx",
          lineNumber: 225,
          columnNumber: 19
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 215,
        columnNumber: 17
      }, this) }, void 0, false, {
        fileName: "app/routes/admin.branding.tsx",
        lineNumber: 212,
        columnNumber: 15
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/admin.branding.tsx",
      lineNumber: 208,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/routes/admin.branding.tsx",
      lineNumber: 207,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/routes/admin.branding.tsx",
      lineNumber: 206,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/admin.branding.tsx",
    lineNumber: 132,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/admin.branding.tsx",
    lineNumber: 129,
    columnNumber: 10
  }, this);
}
_s(AdminBranding, "WLkQLAGcYn4cfwUPPH7wNBKpBNU=", false, function() {
  return [useLoaderData, useActionData, useFetcher];
});
_c = AdminBranding;
var _c;
$RefreshReg$(_c, "AdminBranding");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  AdminBranding as default
};
//# sourceMappingURL=/build/routes/admin.branding-WJXWEVRL.js.map
