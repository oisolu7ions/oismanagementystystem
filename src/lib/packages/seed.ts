import { defaultOisPackages } from "@/lib/packages/defaults";
import type { PrismaClient } from "@/generated/prisma/client";

export async function seedDefaultPackages(prisma: PrismaClient): Promise<void> {
  for (const pkg of defaultOisPackages) {
    const existing = await prisma.package.findFirst({
      where: { name: pkg.name },
    });

    if (existing) {
      await prisma.package.update({
        where: { id: existing.id },
        data: {
          setupPrice: pkg.setupPrice,
          monthlyPrice: pkg.monthlyPrice,
          description: pkg.description,
          features: pkg.features,
          isActive: pkg.isActive,
        },
      });
    } else {
      await prisma.package.create({ data: pkg });
    }
  }

  console.log(`Seeded ${defaultOisPackages.length} OIS packages`);
}
