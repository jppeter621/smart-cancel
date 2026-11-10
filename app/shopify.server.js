import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  BillingInterval,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server.js";

export const MONTHLY_PLAN_GROWTH = "Growth Plan";
export const MONTHLY_PLAN_PRO = "Pro Plan";

const defaultScopes = ["write_orders", "read_orders", "read_customers"];
const scopes =
  process.env.SCOPES && process.env.SCOPES.includes("orders")
    ? process.env.SCOPES.split(",").map((s) => s.trim())
    : defaultScopes;

const appUrl = (process.env.SHOPIFY_APP_URL || "https://smart-cancel.vercel.app").replace(/\/+$/, "");

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || "741616eef0a5a11569f7552c5ba52ff5",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes,
  appUrl,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma, {
    connectionRetries: 5,
    connectionRetryIntervalMs: 2000,
  }),
  distribution: AppDistribution.AppStore,
  billing: {
    [MONTHLY_PLAN_GROWTH]: {
      lineItems: [
        {
          amount: 9.99,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
    },
    [MONTHLY_PLAN_PRO]: {
      lineItems: [
        {
          amount: 24.99,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
    },
  },
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
