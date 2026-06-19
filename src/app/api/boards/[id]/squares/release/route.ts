import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  row: z.number().int().min(0).max(9),
  column: z.number().int().min(0).max(9)
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in as the host to remove reserved squares." }, { status: 401 });
  }

  const { id } = await params;
  const result = schema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: "Choose a valid square to remove." }, { status: 400 });
  }

  const board = await prisma.board.findUnique({
    where: { id },
    select: { hostId: true, status: true }
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  if (board.hostId !== user.id) {
    return NextResponse.json({ error: "Only the board host can remove reserved squares." }, { status: 403 });
  }

  if (board.status !== "OPEN") {
    return NextResponse.json({ error: "This board is locked and cannot be changed." }, { status: 409 });
  }

  const square = await prisma.square.findUnique({
    where: {
      boardId_row_column: {
        boardId: id,
        row: result.data.row,
        column: result.data.column
      }
    },
    select: {
      id: true,
      purchaseId: true,
      ownerId: true,
      reservedName: true
    }
  });

  if (!square) {
    return NextResponse.json({ error: "Square not found." }, { status: 404 });
  }

  if (!square.ownerId && !square.reservedName) {
    return NextResponse.json({ error: "That square is already open." }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.square.update({
      where: { id: square.id },
      data: {
        ownerId: null,
        purchaseId: null,
        reservedName: null
      }
    });

    if (square.purchaseId) {
      const remainingSquares = await tx.square.count({
        where: { purchaseId: square.purchaseId }
      });

      if (remainingSquares === 0) {
        await tx.purchase.update({
          where: { id: square.purchaseId },
          data: { status: "CANCELED" }
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
