-- Replace TaskStatus: REVIEW -> WAITING
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";

CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'WAITING', 'DONE');

ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Task"
ALTER COLUMN "status" TYPE "TaskStatus"
USING (
  CASE "status"::text
    WHEN 'REVIEW' THEN 'WAITING'::"TaskStatus"
    ELSE "status"::text::"TaskStatus"
  END
);

ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'TODO';

DROP TYPE "TaskStatus_old";
