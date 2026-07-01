-- ExtendEnum
ALTER TYPE "SecurityEventType" ADD VALUE IF NOT EXISTS 'ADMIN_SETTING_CHANGED';
ALTER TYPE "SecurityEventType" ADD VALUE IF NOT EXISTS 'TEST_EMAIL_SENT';

-- CreateEnum
CREATE TYPE "SettingValueType" AS ENUM ('STRING', 'BOOLEAN', 'NUMBER', 'JSON');

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "SettingValueType" NOT NULL DEFAULT 'STRING',
    "group" TEXT NOT NULL,
    "description" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE INDEX "Setting_group_idx" ON "Setting"("group");
