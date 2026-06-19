ALTER TABLE "Board" ADD COLUMN "boardNumber" TEXT;

WITH numbered_boards AS (
  SELECT id, LPAD((ROW_NUMBER() OVER (ORDER BY "createdAt"))::TEXT, 6, '0') AS generated_number
  FROM "Board"
)
UPDATE "Board"
SET "boardNumber" = numbered_boards.generated_number
FROM numbered_boards
WHERE "Board".id = numbered_boards.id;

ALTER TABLE "Board" ALTER COLUMN "boardNumber" SET NOT NULL;
CREATE UNIQUE INDEX "Board_boardNumber_key" ON "Board"("boardNumber");
