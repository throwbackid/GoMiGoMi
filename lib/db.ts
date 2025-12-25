import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function getPool(): Pool {
  if (globalForPrisma.pgPool) return globalForPrisma.pgPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  globalForPrisma.pgPool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  return globalForPrisma.pgPool;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(getPool());

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const db =
  globalForPrisma.prisma ??
  (globalForPrisma.prisma = createPrismaClient());

export default db;
