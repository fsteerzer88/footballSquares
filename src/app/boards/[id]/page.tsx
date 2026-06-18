import { notFound } from "next/navigation";
import { BoardGrid } from "@/components/BoardGrid";
import type { BoardDetailData } from "@/lib/board-detail-types";
import { prisma } from "@/lib/db";
import { demoBoards } from "@/lib/demo-data";
import { formatMoney } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { logoUrlForTeam } from "@/lib/team-assets";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const dbBoard = await prisma.board.findUnique({
    where: { id },
    include: {
      team: true,
      squares: {
        select: {
          row: true,
          column: true,
          reservedName: true,
          owner: {
            select: {
              name: true
            }
          },
          purchase: {
            select: {
              status: true
            }
          }
        }
      },
      purchases: {
        select: {
          status: true,
          amountDueCents: true
        }
      },
      games: {
        include: {
          game: {
            include: {
              homeTeam: true,
              awayTeam: true
            }
          }
        },
        orderBy: {
          game: {
            kickoffAt: "asc"
          }
        },
        take: 1
      },
      digitSets: {
        orderBy: { randomizedAt: "desc" },
        take: 1
      }
    }
  });
  const board: BoardDetailData | undefined = dbBoard
    ? {
        id: dbBoard.id,
        title: dbBoard.title,
        fundraiserName: dbBoard.fundraiserName,
        league: dbBoard.league,
        mode: dbBoard.mode,
        visibility: dbBoard.visibility,
        isHost: user?.id === dbBoard.hostId,
        status: dbBoard.status,
        teamName: dbBoard.team.name,
        pricePerSquareCents: dbBoard.pricePerSquareCents,
        maxSquaresPerBuyer: dbBoard.maxSquaresPerBuyer ?? undefined,
        soldSquares: dbBoard.squares.filter((square) => square.owner).length,
        paymentSummary: {
          receivedCents: dbBoard.purchases
            .filter((purchase) => purchase.status === "PAID")
            .reduce((sum, purchase) => sum + purchase.amountDueCents, 0),
          owedCents: dbBoard.purchases
            .filter((purchase) => purchase.status === "RESERVED")
            .reduce((sum, purchase) => sum + purchase.amountDueCents, 0)
        },
        ownedSquares: dbBoard.squares
          .filter((square) => square.owner || square.reservedName)
          .map((square) => ({
            row: square.row,
            column: square.column,
            ownerName: square.reservedName ?? square.owner?.name ?? "Reserved",
            paymentStatus: square.purchase?.status ?? "RESERVED"
          })),
        payouts: {
          q1: dbBoard.payoutQ1Cents,
          q2: dbBoard.payoutQ2Cents,
          q3: dbBoard.payoutQ3Cents,
          final: dbBoard.payoutFinalCents
        },
        nextGame: {
          id: dbBoard.games[0]?.game.externalId ?? dbBoard.games[0]?.game.id ?? "pending-game",
          league: dbBoard.league,
          season: dbBoard.games[0]?.game.season ?? 2026,
          week: dbBoard.games[0]?.game.week ?? 1,
          kickoffAt: dbBoard.games[0]?.game.kickoffAt.toISOString() ?? new Date().toISOString(),
          status: dbBoard.games[0]?.game.status ?? "SCHEDULED",
          homeTeam: {
            id: dbBoard.games[0]?.game.homeTeam.externalId ?? dbBoard.games[0]?.game.homeTeam.id ?? "home",
            league: dbBoard.league,
            name: dbBoard.games[0]?.game.homeTeam.name ?? "Home",
            shortName: dbBoard.games[0]?.game.homeTeam.shortName ?? "HOME",
            logoUrl: dbBoard.games[0]?.game.homeTeam.logoUrl ?? logoUrlForTeam(
              dbBoard.games[0]?.game.homeTeam.externalId ?? dbBoard.games[0]?.game.homeTeam.id ?? "",
              dbBoard.league
            )
          },
          awayTeam: {
            id: dbBoard.games[0]?.game.awayTeam.externalId ?? dbBoard.games[0]?.game.awayTeam.id ?? "away",
            league: dbBoard.league,
            name: dbBoard.games[0]?.game.awayTeam.name ?? "Away",
            shortName: dbBoard.games[0]?.game.awayTeam.shortName ?? "AWAY",
            logoUrl: dbBoard.games[0]?.game.awayTeam.logoUrl ?? logoUrlForTeam(
              dbBoard.games[0]?.game.awayTeam.externalId ?? dbBoard.games[0]?.game.awayTeam.id ?? "",
              dbBoard.league
            )
          }
        },
        digits: dbBoard.digitSets[0]
          ? {
              homeDigits: dbBoard.digitSets[0].homeDigits,
              awayDigits: dbBoard.digitSets[0].awayDigits
            }
          : undefined
      }
    : demoBoards.find((candidate) => candidate.id === id);

  if (!board) {
    notFound();
  }

  return (
    <div className="page board-page stack">
      <div>
        <p className="eyebrow">
          {board.league} {board.mode === "SEASON" ? "Season board" : "Single-game board"}
        </p>
        <h1>{board.title}</h1>
        <p>
          Payouts: Q1 {formatMoney(board.payouts.q1)}, Q2 {formatMoney(board.payouts.q2)}, Q3{" "}
          {formatMoney(board.payouts.q3)}, Final {formatMoney(board.payouts.final)}
        </p>
      </div>
      <BoardGrid board={board} />
    </div>
  );
}
