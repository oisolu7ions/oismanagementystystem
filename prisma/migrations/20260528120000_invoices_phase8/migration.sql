-- Rename columns and adjust types for Phase 8 invoices
ALTER TABLE "Invoice" RENAME COLUMN "number" TO "invoiceNumber";
ALTER TABLE "Invoice" RENAME COLUMN "description" TO "notes";

ALTER TABLE "Invoice" ADD COLUMN "paymentLink" TEXT;

ALTER TABLE "Invoice" ALTER COLUMN "amount" TYPE TEXT USING TRIM("amount"::text);
