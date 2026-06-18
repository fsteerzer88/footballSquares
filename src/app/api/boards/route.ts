import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { buildEmptySquares } from "@/lib/board-rules";
import { prisma } from "@/lib/db";
import { dollarsToCents } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { getSportsProvider } from "@/lib/sports-provider";
import { getCachedTeams } from "@/lib/team-cache";

const schema = z.object({
  title: z.string().min(3),
  fundraiserName: z.string().min(3),
  league: z.enum(["NFL", "NCAA"]),
  mode: z.enum(["SINGLE_GAME", "SEASON"]),
  visibility: z.enum(["PUBLIC", "CODE_PROTECTED"]),
  accessCode: z.string().trim().min(4).max(64).optional().or(z.literal("").transform(() => undefined)),
  teamId: z.string().min(1),
  gameIds: z.array(z.string()).min(1),
  pricePerSquare: z.coerce.number().positive(),
  maxSquaresPerBuyer: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  payouts: z.object({
    q1: z.coerce.number().min(0),
    q2: z.coerce.number().min(0),
    q3: z.coerce.number().min(0),
    final: z.coerce.number().min(0)
  })
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to create a board." }, { status: 401 });
  }

  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const data = result.data;

  if (data.visibility === "CODE_PROTECTED" && !data.accessCode) {
    return NextResponse.json({ error: "Access code is required for code-protected boards." }, { status: 400 });
  }

  const provider = getSportsProvider();
  const providerTeams = await getCachedTeams(data.league);
  const providerTeam = providerTeams.find((team) => team.id === data.teamId);

  if (!providerTeam) {
    return NextResponse.json({ error: "Selected team was not found." }, { status: 400 });
  }

  const schedule = await provider.getTeamSchedule(data.teamId, 2026);
  const selectedGames = schedule.filter((game) => data.gameIds.includes(game.id));

  if (selectedGames.length !== data.gameIds.length) {
    return NextResponse.json({ error: "One or more selected games could not be found." }, { status: 400 });
  }

  const accessCodeHash = data.accessCode ? await hashPassword(data.accessCode) : undefined;

  const board = await prisma.$transaction(async (tx) => {
    await tx.team.upsert({
      where: { externalId: providerTeam.id },
      update: {
        league: providerTeam.league,
        name: providerTeam.name,
        shortName: providerTeam.shortName,
        logoUrl: providerTeam.logoUrl
      },
      create: {
        externalId: providerTeam.id,
        league: providerTeam.league,
        name: providerTeam.name,
        shortName: providerTeam.shortName,
        logoUrl: providerTeam.logoUrl
      }
    });

    for (const game of selectedGames) {
      const homeTeam = await tx.team.upsert({
        where: { externalId: game.homeTeam.id },
        update: {
          league: game.homeTeam.league,
          name: game.homeTeam.name,
          shortName: game.homeTeam.shortName,
          logoUrl: game.homeTeam.logoUrl
        },
        create: {
          externalId: game.homeTeam.id,
          league: game.homeTeam.league,
          name: game.homeTeam.name,
          shortName: game.homeTeam.shortName,
          logoUrl: game.homeTeam.logoUrl
        }
      });
      const awayTeam = await tx.team.upsert({
        where: { externalId: game.awayTeam.id },
        update: {
          league: game.awayTeam.league,
          name: game.awayTeam.name,
          shortName: game.awayTeam.shortName,
          logoUrl: game.awayTeam.logoUrl
        },
        create: {
          externalId: game.awayTeam.id,
          league: game.awayTeam.league,
          name: game.awayTeam.name,
          shortName: game.awayTeam.shortName,
          logoUrl: game.awayTeam.logoUrl
        }
      });

      await tx.game.upsert({
        where: { externalId: game.id },
        update: {
          league: game.league,
          season: game.season,
          week: game.week,
          kickoffAt: new Date(game.kickoffAt),
          status: game.status,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id
        },
        create: {
          externalId: game.id,
          league: game.league,
          season: game.season,
          week: game.week,
          kickoffAt: new Date(game.kickoffAt),
          status: game.status,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id
        }
      });
    }

    const dbTeam = await tx.team.findUniqueOrThrow({
      where: { externalId: providerTeam.id }
    });
    const dbGames = await tx.game.findMany({
      where: { externalId: { in: data.gameIds } }
    });

    const createdBoard = await tx.board.create({
      data: {
        hostId: user.id,
        teamId: dbTeam.id,
        title: data.title,
        fundraiserName: data.fundraiserName,
        complianceAcceptedAt: new Date(),
        league: data.league,
        mode: data.mode,
        status: "OPEN",
        visibility: data.visibility,
        accessCodeHash,
        pricePerSquareCents: dollarsToCents(data.pricePerSquare),
        maxSquaresPerBuyer: data.maxSquaresPerBuyer,
        payoutQ1Cents: dollarsToCents(data.payouts.q1),
        payoutQ2Cents: dollarsToCents(data.payouts.q2),
        payoutQ3Cents: dollarsToCents(data.payouts.q3),
        payoutFinalCents: dollarsToCents(data.payouts.final),
        games: {
          create: dbGames.map((game) => ({
            gameId: game.id
          }))
        },
        squares: {
          create: buildEmptySquares()
        }
      },
      include: {
        team: true,
        squares: true
      }
    });

    return createdBoard;
  });

  return NextResponse.json({
    id: board.id,
    title: board.title,
    status: board.status
  });
}
