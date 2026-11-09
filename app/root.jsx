import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from "react-router";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const errorMessage =
    error?.data?.message ||
    error?.data ||
    error?.message ||
    (typeof error === "string" ? error : JSON.stringify(error, null, 2));

  return (
    <html lang="en">
      <head>
        <title>Application Error</title>
        <Meta />
        <Links />
      </head>
      <body style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h2 style={{ color: "#d72c0d" }}>SmartCancel Application Error</h2>
        <pre
          style={{
            background: "#fff4f4",
            color: "#bf0711",
            border: "1px solid #fed2d2",
            padding: "1rem",
            borderRadius: "8px",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            fontSize: "14px",
          }}
        >
          {errorMessage}
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
        <Scripts />
      </body>
    </html>
  );
}
