import type { Prisma } from "@prisma/client";

export function normalizeBoardNumber(boardNumber: string) {
  return boardNumber.trim().replace(/\D/g, "");
}

export function formatBoardNumber(boardNumber: string) {
  return normalizeBoardNumber(boardNumber).padStart(6, "0");
}

export async function generateBoardNumber(tx: Prisma.TransactionClient) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const boardNumber = String(Math.floor(100000 + Math.random() * 900000));
    const existing = await tx.board.findUnique({
      where: { boardNumber },
      select: { id: true }
    });

    if (!existing) {
      return boardNumber;
    }
  }

  throw new Error("Unable to generate a unique board number.");
}
