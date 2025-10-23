/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SHOPIFY_API_KEY: string;
      SHOPIFY_API_SECRET: string;
      SCOPES: string;
      HOST: string;
      APP_URL: string;
      DATABASE_URL: string;
      SESSION_KEYS: string;
      ENCRYPTION_KEY: string;
    }
  }
}

export {};