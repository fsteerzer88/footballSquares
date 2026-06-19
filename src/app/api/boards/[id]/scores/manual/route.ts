import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const scorePairSchema = z.object({
  away: z.number().int().min(0),
  home: z.number().int().min(0)
});

const schema = z.object({
  gameId: z.string().min(1),
  scores: z.object({
    q1: scorePairSchema,
    q2: scorePairSchema,
    q3: scorePairSchema,
    final: scorePairSchema
  })
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in as the host to enter manual scores." }, { status: 401 });
  }

  const { id } = await params;
  const result = schema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: "Enter valid whole-number scores for each quarter." }, { status: 400 });
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
        },
        orderBy: {
          game: {
            kickoffAt: "asc"
          }
        },
        take: 1
      }
    }
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  if (board.hostId !== user.id) {
    return NextResponse.json({ error: "Only this board's host can enter manual scores." }, { status: 403 });
  }

  if (board.status !== "OPEN") {
    return NextResponse.json({ error: "This board is locked and cannot be changed." }, { status: 409 });
  }

  const gameId = board.games[0]?.gameId;

  if (!gameId) {
    return NextResponse.json({ error: "No game is attached to this board." }, { status: 409 });
  }

  const { scores } = result.data;

  await prisma.game.update({
    where: { id: gameId },
    data: {
      awayScoreQ1: scores.q1.away,
      homeScoreQ1: scores.q1.home,
      awayScoreQ2: scores.q2.away,
      homeScoreQ2: scores.q2.home,
      awayScoreQ3: scores.q3.away,
      homeScoreQ3: scores.q3.home,
      awayScoreFinal: scores.final.away,
      homeScoreFinal: scores.final.home
    }
  });

  return NextResponse.json({ ok: true, scores });
}
