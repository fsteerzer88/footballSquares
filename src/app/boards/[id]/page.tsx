import { notFound } from "next/navigation";
import { BoardGrid } from "@/components/BoardGrid";
import { getWinningCoordinate } from "@/lib/board-rules";
import { formatBoardNumber, normalizeBoardNumber } from "@/lib/board-number";
import type { BoardDetailData } from "@/lib/board-detail-types";
import { prisma } from "@/lib/db";
import { demoBoards } from "@/lib/demo-data";
import { formatMoney } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { teamShortName } from "@/lib/team-abbreviations";
import { logoUrlForTeam } from "@/lib/team-assets";

export default async function BoardPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ game?: string }>;
}) {
  const { id } = await params;
  const { game: requestedGameId } = await searchParams;
  const isBoardNumberRoute = /^\d+$/.test(id);
  const boardNumber = normalizeBoardNumber(id);
  const user = await getCurrentUser();
  const dbBoard = await prisma.board.findUnique({
    where: isBoardNumberRoute ? { boardNumber: formatBoardNumber(boardNumber) } : { id },
    include: {
      host: {
        select: {
          name: true
        }
      },
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
          id: true,
          status: true,
          amountDueCents: true,
          reservedName: true,
          buyer: {
            select: {
              name: true
            }
          },
          squares: {
            select: {
              row: true,
              column: true
            },
            orderBy: [{ row: "asc" }, { column: "asc" }]
          }
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
        }
      },
      digitSets: {
        orderBy: { randomizedAt: "desc" }
      }
    }
  });
  const isHost = user?.id === dbBoard?.hostId;
  const selectedBoardGame =
    dbBoard?.games.find((boardGame) => boardGame.gameId === requestedGameId) ?? dbBoard?.games[0];
  const selectedGame = selectedBoardGame?.game;
  const selectedDigitSet = dbBoard?.digitSets.find(
    (digitSet) => digitSet.gameId === selectedBoardGame?.gameId
  );
  const ownedSquares =
    dbBoard?.squares
      .filter((square) => square.owner || square.reservedName)
      .map((square) => ({
        row: square.row,
        column: square.column,
        ownerName: square.reservedName ?? square.owner?.name ?? "Reserved",
        paymentStatus: square.purchase?.status ?? "RESERVED" as const
      })) ?? [];
  const ownerByCoordinate = new Map(
    ownedSquares.map((square) => [`${square.row}:${square.column}`, square.ownerName])
  );
  const winnerScores = selectedGame && dbBoard
    ? [
        {
          quarter: "Q1" as const,
          payoutCents: dbBoard.payoutQ1Cents,
          homeScore: selectedGame.homeScoreQ1,
          awayScore: selectedGame.awayScoreQ1
        },
        {
          quarter: "Q2" as const,
          payoutCents: dbBoard.payoutQ2Cents,
          homeScore: selectedGame.homeScoreQ2,
          awayScore: selectedGame.awayScoreQ2
        },
        {
          quarter: "Q3" as const,
          payoutCents: dbBoard.payoutQ3Cents,
          homeScore: selectedGame.homeScoreQ3,
          awayScore: selectedGame.awayScoreQ3
        },
        {
          quarter: "Final" as const,
          payoutCents: dbBoard.payoutFinalCents,
          homeScore: selectedGame.homeScoreFinal,
          awayScore: selectedGame.awayScoreFinal
        }
      ]
    : [];
  const winners =
    selectedDigitSet
      ? winnerScores.flatMap((score) => {
          if (score.homeScore === null || score.awayScore === null) {
            return [];
          }

          const coordinate = getWinningCoordinate(
            [score.homeScore, score.awayScore],
            selectedDigitSet.homeDigits,
            selectedDigitSet.awayDigits
          );

          return [
            {
              quarter: score.quarter,
              payoutCents: score.payoutCents,
              homeScore: score.homeScore,
              awayScore: score.awayScore,
              row: coordinate.row,
              column: coordinate.column,
              ownerName: ownerByCoordinate.get(`${coordinate.row}:${coordinate.column}`)
            }
          ];
        })
      : [];
  const board: BoardDetailData | undefined = dbBoard
    ? {
        id: dbBoard.id,
        boardNumber: dbBoard.boardNumber,
        title: dbBoard.title,
        fundraiserName: dbBoard.fundraiserName,
        league: dbBoard.league,
        mode: dbBoard.mode,
        visibility: dbBoard.visibility,
        isHost,
        hostName: dbBoard.host.name,
        status: dbBoard.status,
        teamName: dbBoard.team.name,
        accessCode: isHost ? dbBoard.accessCodeLookup ?? undefined : undefined,
        pricePerSquareCents: dbBoard.pricePerSquareCents,
        maxSquaresPerBuyer: dbBoard.maxSquaresPerBuyer ?? undefined,
        soldSquares: dbBoard.squares.filter((square) => square.owner || square.reservedName).length,
        paymentSummary: {
          receivedCents: dbBoard.purchases
            .filter((purchase) => purchase.status === "PAID")
            .reduce((sum, purchase) => sum + purchase.amountDueCents, 0),
          owedCents: dbBoard.purchases
            .filter((purchase) => purchase.status === "RESERVED")
            .reduce((sum, purchase) => sum + purchase.amountDueCents, 0)
        },
        ownedSquares,
        reservations: dbBoard.purchases
          .filter((purchase) => purchase.status !== "CANCELED" && purchase.status !== "REFUNDED")
          .map((purchase) => ({
            id: purchase.id,
            name: purchase.reservedName ?? purchase.buyer.name,
            amountDueCents: purchase.amountDueCents,
            status: purchase.status,
            squares: purchase.squares
          })),
        payouts: {
          q1: dbBoard.payoutQ1Cents,
          q2: dbBoard.payoutQ2Cents,
          q3: dbBoard.payoutQ3Cents,
          final: dbBoard.payoutFinalCents
        },
        nextGame: {
          id: selectedGame?.externalId ?? selectedGame?.id ?? "pending-game",
          league: dbBoard.league,
          season: selectedGame?.season ?? 2026,
          week: selectedGame?.week ?? 1,
          kickoffAt: selectedGame?.kickoffAt.toISOString() ?? new Date().toISOString(),
          status: selectedGame?.status ?? "SCHEDULED",
          scores: selectedGame
            ? {
                q1:
                  selectedGame.homeScoreQ1 !== null && selectedGame.awayScoreQ1 !== null
                    ? [selectedGame.homeScoreQ1, selectedGame.awayScoreQ1]
                    : undefined,
                q2:
                  selectedGame.homeScoreQ2 !== null && selectedGame.awayScoreQ2 !== null
                    ? [selectedGame.homeScoreQ2, selectedGame.awayScoreQ2]
                    : undefined,
                q3:
                  selectedGame.homeScoreQ3 !== null && selectedGame.awayScoreQ3 !== null
                    ? [selectedGame.homeScoreQ3, selectedGame.awayScoreQ3]
                    : undefined,
                final:
                  selectedGame.homeScoreFinal !== null &&
                  selectedGame.awayScoreFinal !== null
                    ? [selectedGame.homeScoreFinal, selectedGame.awayScoreFinal]
                    : undefined
              }
            : undefined,
          homeTeam: {
            id: selectedGame?.homeTeam.externalId ?? selectedGame?.homeTeam.id ?? "home",
            league: dbBoard.league,
            name: selectedGame?.homeTeam.name ?? "Home",
            shortName: selectedGame?.homeTeam
              ? teamShortName(selectedGame.homeTeam)
              : "HOME",
            logoUrl: selectedGame?.homeTeam.logoUrl ?? logoUrlForTeam(
              selectedGame?.homeTeam.externalId ?? selectedGame?.homeTeam.id ?? "",
              dbBoard.league
            )
          },
          awayTeam: {
            id: selectedGame?.awayTeam.externalId ?? selectedGame?.awayTeam.id ?? "away",
            league: dbBoard.league,
            name: selectedGame?.awayTeam.name ?? "Away",
            shortName: selectedGame?.awayTeam
              ? teamShortName(selectedGame.awayTeam)
              : "AWAY",
            logoUrl: selectedGame?.awayTeam.logoUrl ?? logoUrlForTeam(
              selectedGame?.awayTeam.externalId ?? selectedGame?.awayTeam.id ?? "",
              dbBoard.league
            )
          }
        },
        selectedGameId: selectedBoardGame?.gameId ?? "",
        gameSnapshots: dbBoard.games.map((boardGame) => ({
          gameId: boardGame.gameId,
          week: boardGame.game.week,
          kickoffAt: boardGame.game.kickoffAt.toISOString(),
          matchup: `${teamShortName(boardGame.game.awayTeam)} at ${teamShortName(boardGame.game.homeTeam)}`,
          hasLockedDigits: dbBoard.digitSets.some((digitSet) => digitSet.gameId === boardGame.gameId),
          isFinal: boardGame.game.status === "FINAL"
        })),
        digits: selectedDigitSet
          ? {
              homeDigits: selectedDigitSet.homeDigits,
              awayDigits: selectedDigitSet.awayDigits
            }
          : undefined,
        winners
      }
    : demoBoards.find((candidate) => candidate.id === id || candidate.boardNumber === formatBoardNumber(boardNumber));

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
