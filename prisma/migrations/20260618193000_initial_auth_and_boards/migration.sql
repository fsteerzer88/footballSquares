-- CreateEnum
CREATE TYPE "League" AS ENUM ('NFL', 'NCAA');

-- CreateEnum
CREATE TYPE "BoardMode" AS ENUM ('SINGLE_GAME', 'SEASON');

-- CreateEnum
CREATE TYPE "BoardStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'FINAL');

-- CreateEnum
CREATE TYPE "BoardVisibility" AS ENUM ('PUBLIC', 'CODE_PROTECTED');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('RESERVED', 'PAID', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "league" "League" NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "externalId" TEXT,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "league" "League" NOT NULL,
    "season" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "kickoffAt" TIMESTAMP(3) NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'SCHEDULED',
    "externalId" TEXT,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeScoreQ1" INTEGER,
    "awayScoreQ1" INTEGER,
    "homeScoreQ2" INTEGER,
    "awayScoreQ2" INTEGER,
    "homeScoreQ3" INTEGER,
    "awayScoreQ3" INTEGER,
    "homeScoreFinal" INTEGER,
    "awayScoreFinal" INTEGER,
    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fundraiserName" TEXT NOT NULL,
    "complianceAcceptedAt" TIMESTAMP(3),
    "league" "League" NOT NULL,
    "mode" "BoardMode" NOT NULL,
    "status" "BoardStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "BoardVisibility" NOT NULL DEFAULT 'PUBLIC',
    "accessCodeHash" TEXT,
    "pricePerSquareCents" INTEGER NOT NULL,
    "maxSquaresPerBuyer" INTEGER,
    "payoutQ1Cents" INTEGER NOT NULL,
    "payoutQ2Cents" INTEGER NOT NULL,
    "payoutQ3Cents" INTEGER NOT NULL,
    "payoutFinalCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardGame" (
    "boardId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    CONSTRAINT "BoardGame_pkey" PRIMARY KEY ("boardId","gameId")
);

-- CreateTable
CREATE TABLE "Square" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "ownerId" TEXT,
    "purchaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Square_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'RESERVED',
    "amountDueCents" INTEGER NOT NULL,
    "paymentNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardDigitSet" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "gameId" TEXT,
    "homeDigits" INTEGER[],
    "awayDigits" INTEGER[],
    "randomizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BoardDigitSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutResult" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "winningSquareId" TEXT,
    "payoutCents" INTEGER NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    CONSTRAINT "PayoutResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Team_externalId_key" ON "Team"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_externalId_key" ON "Game"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Square_boardId_row_column_key" ON "Square"("boardId", "row", "column");

-- CreateIndex
CREATE UNIQUE INDEX "BoardDigitSet_boardId_gameId_key" ON "BoardDigitSet"("boardId", "gameId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardGame" ADD CONSTRAINT "BoardGame_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardGame" ADD CONSTRAINT "BoardGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Square" ADD CONSTRAINT "Square_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Square" ADD CONSTRAINT "Square_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Square" ADD CONSTRAINT "Square_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardDigitSet" ADD CONSTRAINT "BoardDigitSet_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardDigitSet" ADD CONSTRAINT "BoardDigitSet_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutResult" ADD CONSTRAINT "PayoutResult_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutResult" ADD CONSTRAINT "PayoutResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
