import { PrismaClient } from "@prisma/client";

// Clean up DATABASE_URL and DIRECT_URL if they accidentally include surrounding quotes or whitespace
let dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  dbUrl = dbUrl.trim().replace(/^["']|["']$/g, "");
  process.env.DATABASE_URL = dbUrl;
}

let directUrl = process.env.DIRECT_URL;
if (directUrl) {
  directUrl = directUrl.trim().replace(/^["']|["']$/g, "");
  process.env.DIRECT_URL = directUrl;
} else if (dbUrl) {
  process.env.DIRECT_URL = dbUrl;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
