ALTER TABLE "Board" ADD COLUMN "accessCodeLookup" TEXT;
CREATE UNIQUE INDEX "Board_accessCodeLookup_key" ON "Board"("accessCodeLookup");
