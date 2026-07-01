-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM (
    'CLIENT_USER_CREATED',
    'VERIFICATION_EMAIL_SENT',
    'EMAIL_VERIFIED',
    'VERIFICATION_FAILED',
    'LOGIN_PASSWORD_SUCCESS',
    'LOGIN_PASSWORD_FAILED',
    'LOGIN_CODE_SENT',
    'LOGIN_CODE_SUCCESS',
    'LOGIN_CODE_FAILED',
    'LOGIN_CODE_EXPIRED',
    'LOGIN_SUCCESS',
    'LOGIN_BLOCKED_UNVERIFIED_EMAIL',
    'LOGOUT',
    'RATE_LIMITED'
);

-- AlterTable
ALTER TABLE "ClientUser" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ClientEmailVerificationToken" (
    "id" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientEmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientLoginCode" (
    "id" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientLoginCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "clientUserId" TEXT,
    "type" "SecurityEventType" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientEmailVerificationToken_tokenHash_key" ON "ClientEmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ClientEmailVerificationToken_clientUserId_createdAt_idx" ON "ClientEmailVerificationToken"("clientUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientEmailVerificationToken_expiresAt_idx" ON "ClientEmailVerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "ClientLoginCode_clientUserId_createdAt_idx" ON "ClientLoginCode"("clientUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientLoginCode_expiresAt_idx" ON "ClientLoginCode"("expiresAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_clientUserId_createdAt_idx" ON "SecurityEvent"("clientUserId", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_type_createdAt_idx" ON "SecurityEvent"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "ClientEmailVerificationToken" ADD CONSTRAINT "ClientEmailVerificationToken_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "ClientUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientLoginCode" ADD CONSTRAINT "ClientLoginCode_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "ClientUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "ClientUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
