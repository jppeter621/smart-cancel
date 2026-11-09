/* global process */
import { Link, Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={enTranslations}>
        <NavMenu>
          <Link to="/app" rel="home">
            Dashboard
          </Link>
          <Link to="/app/billing">Plans & Billing</Link>
          <Link to="/app/additional">Insights & FAQs</Link>
        </NavMenu>
        <Outlet />
      </PolarisAppProvider>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  const error = useRouteError();
  const shopifyError = boundary.error(error);
  if (shopifyError) return shopifyError;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#d72c0d" }}>SmartCancel Error</h2>
      <p>An unexpected error occurred while loading the app:</p>
      <pre
        style={{
          background: "#fff4f4",
          color: "#bf0711",
          border: "1px solid #fed2d2",
          padding: "1rem",
          borderRadius: "8px",
          overflowX: "auto",
        }}
      >
        {error?.message || (typeof error === "string" ? error : JSON.stringify(error, null, 2))}
      </pre>
      {error?.stack && (
        <details style={{ marginTop: "1rem" }}>
          <summary>Stack Trace</summary>
          <pre
            style={{
              background: "#f4f4f4",
              padding: "1rem",
              borderRadius: "8px",
              fontSize: "12px",
              overflowX: "auto",
            }}
          >
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
