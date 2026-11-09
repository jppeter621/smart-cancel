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
  const lastErr = typeof global !== "undefined" ? global.lastServerError : null;

  const rawMessage =
    error?.data?.message ||
    error?.data ||
    error?.message ||
    (typeof error === "string" ? error : JSON.stringify(error, null, 2));

  const errorMessage =
    rawMessage === "Unexpected Server Error" && lastErr
      ? `${lastErr.name || "Error"}: ${lastErr.message}\n(Phase: ${lastErr.phase || "server"}${lastErr.url ? ` | URL: ${lastErr.url}` : ""})`
      : rawMessage;

  const stack = lastErr?.stack || error?.stack;

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
            wordBreak: "break-word",
          }}
        >
          {errorMessage}
        </pre>
        {stack && (
          <details open style={{ marginTop: "1rem" }}>
            <summary style={{ fontWeight: 600, cursor: "pointer", marginBottom: "0.5rem" }}>
              Detailed Error Stack Trace
            </summary>
            <pre
              style={{
                background: "#f4f4f4",
                padding: "1rem",
                borderRadius: "8px",
                fontSize: "12px",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {stack}
            </pre>
          </details>
        )}
        <div style={{ marginTop: "1.5rem" }}>
          <a
            href="/debug"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#008060",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "4px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Open Live Diagnostic Data (/debug)
          </a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
