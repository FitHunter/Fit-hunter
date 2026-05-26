import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function buildPool(): Pool {
  // Prefer individual host/credential env vars (set by Supabase Vercel integration)
  // because they bypass pg-connection-string SSL mode parsing entirely.
  if (process.env.POSTGRES_HOST) {
    return new Pool({
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      port: 5432,
      ssl: { rejectUnauthorized: false },
    });
  }

  // Fallback for local dev: parse the URL manually to avoid sslmode interference
  const connectionString = process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL!;
  const url = new URL(connectionString);
  return new Pool({
    host: url.hostname,
    port: url.port ? parseInt(url.port) : 5432,
    database: url.pathname.replace(/^\//, ""),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  });
}

function createPrismaClient() {
  const adapter = new PrismaPg(buildPool());
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
