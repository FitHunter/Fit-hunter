import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function buildPool(): Pool {
  // Parse the connection string URL into individual params so that
  // pg.Pool never receives a connectionString argument. Without a
  // connectionString, pg-connection-string is never invoked, meaning
  // sslmode=require in the URL can never override ssl.rejectUnauthorized.
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
