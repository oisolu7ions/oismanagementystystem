import { statSync } from "fs";
import { join } from "path";
import { createPrismaClient } from "@/lib/db";

const generatedClientPath = join(
  process.cwd(),
  "src/generated/prisma/client.ts",
);

function getGeneratedClientMtime(): number {
  try {
    return statSync(generatedClientPath).mtimeMs;
  } catch {
    return 0;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
  prismaClientMtime?: number;
};

const clientMtime = getGeneratedClientMtime();

if (
  globalForPrisma.prisma &&
  globalForPrisma.prismaClientMtime !== clientMtime
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaClientMtime = clientMtime;
}
