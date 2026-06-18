import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  row: z.number().int().min(0).max(9),
  column: z.number().int().min(0).max(9),
  status: z.enum(["RESERVED", "PAID"])
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in as the host to update payment status." }, { status: 401 });
  }

  const { id } = await params;
  const result = schema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: "Choose a valid square and payment status." }, { status: 400 });
  }

  const board = await prisma.board.findUnique({
    where: { id },
    select: { hostId: true }
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  if (board.hostId !== user.id) {
    return NextResponse.json({ error: "Only the board host can update payment status." }, { status: 403 });
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
      purchaseId: true
    }
  });

  if (!square?.purchaseId) {
    return NextResponse.json({ error: "That square is not reserved." }, { status: 409 });
  }

  await prisma.purchase.update({
    where: { id: square.purchaseId },
    data: { status: result.data.status }
  });

  return NextResponse.json({ ok: true, status: result.data.status });
}
