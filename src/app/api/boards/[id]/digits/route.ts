import { NextResponse } from "next/server";
import { z } from "zod";
import { createDigitSet } from "@/lib/board-rules";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  gameId: z.string().min(1)
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in as the host to lock board digits." }, { status: 401 });
  }

  const { id } = await params;
  const result = schema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: "Choose a game before locking digits." }, { status: 400 });
  }

  const board = await prisma.board.findUnique({
    where: { id },
    select: {
      hostId: true,
      status: true,
      games: {
        where: {
          gameId: result.data.gameId
        },
        select: {
          gameId: true
        }
      }
    }
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  if (board.hostId !== user.id) {
    return NextResponse.json({ error: "Only this board's host can lock digits." }, { status: 403 });
  }

  if (board.status !== "OPEN") {
    return NextResponse.json({ error: "This board is locked and cannot be changed." }, { status: 409 });
  }

  if (board.games.length === 0) {
    return NextResponse.json({ error: "That game is not attached to this board." }, { status: 404 });
  }

  const existing = await prisma.boardDigitSet.findUnique({
    where: {
      boardId_gameId: {
        boardId: id,
        gameId: result.data.gameId
      }
    }
  });

  if (existing) {
    return NextResponse.json(
      {
        error: "Digits are already locked for this game.",
        digits: {
          homeDigits: existing.homeDigits,
          awayDigits: existing.awayDigits
        }
      },
      { status: 409 }
    );
  }

  const digits = createDigitSet();

  await prisma.boardDigitSet.create({
    data: {
      boardId: id,
      gameId: result.data.gameId,
      homeDigits: digits.homeDigits,
      awayDigits: digits.awayDigits
    }
  });

  return NextResponse.json({ digits });
}
