-- CreateEnum
CREATE TYPE "DocumentFileType" AS ENUM (
  'CONTRACT',
  'PROPOSAL',
  'INVOICE',
  'LOGO',
  'BRANDING',
  'IMAGES',
  'WEBSITE_COPY',
  'ACCESS_CREDENTIALS',
  'MEETING_NOTES',
  'PROJECT_BRIEF',
  'LEGAL_DOCUMENT',
  'OTHER'
);

-- AlterTable
ALTER TABLE "DocumentLink" RENAME COLUMN "title" TO "name";

ALTER TABLE "DocumentLink" ADD COLUMN "fileType" "DocumentFileType" NOT NULL DEFAULT 'OTHER';
ALTER TABLE "DocumentLink" ADD COLUMN "notes" TEXT;

ALTER TABLE "DocumentLink" ALTER COLUMN "fileType" DROP DEFAULT;
