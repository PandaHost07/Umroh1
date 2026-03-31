import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global;

function createPrisma() {
  const client = new PrismaClient();
  if (process.env.DATABASE_URL?.startsWith("prisma+")) {
    return client.$extends(withAccelerate());
  }
  return client;
}

const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
