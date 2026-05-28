-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM (
  'WEBSITE_BUILD',
  'WEBSITE_REDESIGN',
  'CRM_INTEGRATION',
  'EMAIL_AUTOMATION',
  'BOOKING_SYSTEM',
  'DASHBOARD',
  'AI_BUSINESS_SYSTEM',
  'WEB_APP',
  'DIGITAL_INFRASTRUCTURE',
  'OTHER'
);

-- Replace ProjectStatus enum
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";

CREATE TYPE "ProjectStatus" AS ENUM (
  'NOT_STARTED',
  'DISCOVERY',
  'DESIGN',
  'DEVELOPMENT',
  'REVIEW',
  'WAITING_ON_CLIENT',
  'COMPLETED',
  'PAUSED',
  'CANCELLED'
);

ALTER TABLE "Project" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Project"
ALTER COLUMN "status" TYPE "ProjectStatus"
USING (
  CASE "status"::text
    WHEN 'PLANNING' THEN 'NOT_STARTED'::"ProjectStatus"
    WHEN 'IN_PROGRESS' THEN 'DEVELOPMENT'::"ProjectStatus"
    WHEN 'ON_HOLD' THEN 'PAUSED'::"ProjectStatus"
    WHEN 'COMPLETED' THEN 'COMPLETED'::"ProjectStatus"
    WHEN 'CANCELLED' THEN 'CANCELLED'::"ProjectStatus"
    ELSE 'NOT_STARTED'::"ProjectStatus"
  END
);

ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';

DROP TYPE "ProjectStatus_old";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "serviceType" "ServiceType" NOT NULL DEFAULT 'OTHER';
ALTER TABLE "Project" ADD COLUMN "price" TEXT;
ALTER TABLE "Project" ADD COLUMN "monthlyFee" TEXT;

ALTER TABLE "Project" ALTER COLUMN "serviceType" DROP DEFAULT;
