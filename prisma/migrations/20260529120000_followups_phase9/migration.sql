-- CreateEnum
CREATE TYPE "FollowUpReason" AS ENUM (
  'CONSULTATION_REMINDER',
  'PROPOSAL_FOLLOW_UP',
  'PAYMENT_REMINDER',
  'MISSING_CONTENT_REMINDER',
  'WEBSITE_REVIEW_REMINDER',
  'MONTHLY_CHECK_IN',
  'RENEWAL_REMINDER',
  'OTHER'
);

-- Add MISSED to FollowUpStatus
ALTER TYPE "FollowUpStatus" RENAME TO "FollowUpStatus_old";

CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'COMPLETED', 'MISSED', 'CANCELLED');

ALTER TABLE "FollowUp" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "FollowUp"
ALTER COLUMN "status" TYPE "FollowUpStatus"
USING ("status"::text::"FollowUpStatus");

ALTER TABLE "FollowUp" ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP TYPE "FollowUpStatus_old";

-- Add reason, migrate from title, drop legacy columns
ALTER TABLE "FollowUp" ADD COLUMN "reason" "FollowUpReason" NOT NULL DEFAULT 'OTHER';

ALTER TABLE "FollowUp" RENAME COLUMN "dueAt" TO "followUpDate";

ALTER TABLE "FollowUp" DROP CONSTRAINT IF EXISTS "FollowUp_ownerId_fkey";
ALTER TABLE "FollowUp" DROP CONSTRAINT IF EXISTS "FollowUp_projectId_fkey";

ALTER TABLE "FollowUp" DROP COLUMN "title";
ALTER TABLE "FollowUp" DROP COLUMN "ownerId";
ALTER TABLE "FollowUp" DROP COLUMN "projectId";

ALTER TABLE "FollowUp" ALTER COLUMN "reason" DROP DEFAULT;
