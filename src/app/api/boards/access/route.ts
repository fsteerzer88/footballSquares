import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth";
import { formatBoardNumber, normalizeBoardNumber } from "@/lib/board-number";
import { prisma } from "@/lib/db";

const schema = z.object({
  boardNumber: z.string().min(1),
  password: z.string().optional()
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: "Enter a board number." }, { status: 400 });
  }

  const board = await prisma.board.findUnique({
    where: {
      boardNumber: formatBoardNumber(normalizeBoardNumber(result.data.boardNumber))
    },
    select: {
      boardNumber: true,
      visibility: true,
      accessCodeHash: true
    }
  });

  if (!board) {
    return NextResponse.json({ error: "No board was found for that number." }, { status: 404 });
  }

  if (board.visibility === "CODE_PROTECTED") {
    if (!board.accessCodeHash) {
      return NextResponse.json({ error: "This private board does not have a pool password set." }, { status: 409 });
    }

    if (!result.data.password || !(await verifyPassword(result.data.password, board.accessCodeHash))) {
      return NextResponse.json({ error: "Enter the correct pool password for this board." }, { status: 403 });
    }
  }

  return NextResponse.json({ boardNumber: board.boardNumber });
}
