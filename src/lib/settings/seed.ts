import type { PrismaClient } from "@/generated/prisma/client";
import { defaultSettings } from "@/lib/settings/defaults";

export async function seedDefaultSettings(prisma: PrismaClient): Promise<void> {
  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        type: setting.type,
        group: setting.group,
        description: setting.description,
        isSecret: setting.isSecret ?? false,
      },
    });
  }

  console.log(`Seeded ${defaultSettings.length} default settings`);
}
