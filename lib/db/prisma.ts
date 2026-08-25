import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "@/lib/generated/prisma/client";

declare global {
  var prismaClient: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it in Vercel Project Settings → Environment Variables (or .env.local for local development)."
    );
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

function getPrismaClient(): PrismaClient {
  // Lazily create the client on first use so Next.js build-time "Collecting
  // page data" can import route modules without requiring DATABASE_URL at
  // module evaluation time. Runtime still fails clearly if the env var is
  // missing when a query is actually made.
  if (!globalThis.prismaClient) {
    globalThis.prismaClient = createPrismaClient();
  }
  return globalThis.prismaClient;
}

/**
 * Shared Prisma client. Uses a Proxy so the connection is only opened on
 * first property access (e.g. `prisma.user.findUnique(...)`), not when this
 * module is imported during the Next.js build.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
