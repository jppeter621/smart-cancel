import { PrismaClient } from "@prisma/client";

const FALLBACK_DATABASE_URL =
  "postgresql://neondb_owner:npg_Q1mWglnfX3AU@ep-small-wave-b4dufyux-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=30";

function sanitizeDatabaseUrl(rawUrl) {
  let url = (rawUrl || "").trim();
  if (!url || url.includes("://USER:") || url.includes("://USER@")) {
    url = FALLBACK_DATABASE_URL;
  }
  if (!url.includes("connect_timeout")) {
    url += url.includes("?") ? "&connect_timeout=30" : "?connect_timeout=30";
  }
  return url;
}

const finalDbUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL);
process.env.DATABASE_URL = finalDbUrl;

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient({
      datasources: { db: { url: finalDbUrl } },
    });
  }
}

const prisma =
  global.prismaGlobal ??
  new PrismaClient({
    datasources: { db: { url: finalDbUrl } },
  });

export default prisma;
