import "dotenv/config";
import { UserRole } from "../src/generated/prisma/client";
import { createPrismaClient } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth/password";
import { seedDefaultPackages } from "../src/lib/packages/seed";
import { seedDefaultSettings } from "../src/lib/settings/seed";

const prisma = createPrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@ois.tech").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const name = process.env.ADMIN_NAME ?? "OIS Admin";

  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      email,
      name,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin user ready: ${email}`);

  await seedDefaultPackages(prisma);
  await seedDefaultSettings(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
