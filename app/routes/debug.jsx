import db from "../db.server";

export const loader = async () => {
  let dbUrlParsed = null;
  if (process.env.DATABASE_URL) {
    try {
      const u = new URL(process.env.DATABASE_URL);
      dbUrlParsed = {
        protocol: u.protocol,
        username: u.username,
        host: u.host,
        pathname: u.pathname,
        search: u.search,
      };
    } catch {
      dbUrlParsed = "INVALID_URL";
    }
  }

  const envStatus = {
    NODE_ENV: process.env.NODE_ENV,
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY
      ? `${process.env.SHOPIFY_API_KEY.slice(0, 8)}... (len: ${process.env.SHOPIFY_API_KEY.length})`
      : "MISSING",
    SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET
      ? `${process.env.SHOPIFY_API_SECRET.slice(0, 4)}... (len: ${process.env.SHOPIFY_API_SECRET.length})`
      : "MISSING",
    SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL || "MISSING",
    SCOPES: process.env.SCOPES || "MISSING",
    DATABASE_URL_DETAILS: dbUrlParsed,
  };

  let dbStatus = { status: "unknown" };
  try {
    const sessionCount = await db.session.count();
    const settingsCount = await db.cancelSettings.count();
    const sessions = await db.session.findMany({
      select: { id: true, shop: true, isOnline: true, expires: true, scope: true },
      take: 10,
    });
    dbStatus = {
      status: "connected",
      sessionCount,
      settingsCount,
      sessions,
    };
  } catch (error) {
    dbStatus = {
      status: "error",
      message: error?.message || String(error),
      code: error?.code,
      stack: error?.stack,
    };
  }

  const lastErr = typeof global !== "undefined" ? global.lastServerError : null;

  return Response.json({
    timestamp: new Date().toISOString(),
    envStatus,
    dbStatus,
    lastServerError: lastErr,
  });
};

export default function DebugRoute() {
  return null;
}
