import Link from "next/link";
import { redirect } from "next/navigation";
import { BoardCard } from "@/components/BoardCard";
import type { BoardCardData } from "@/lib/board-card-types";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in?next=/dashboard");
  }

  const boards = await prisma.board.findMany({
    where: { hostId: user.id, archivedAt: null },
    include: {
      team: true,
      squares: {
        select: {
          ownerId: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  const boardCards: BoardCardData[] = boards.map((board) => {
    const soldSquares = board.squares.filter((square) => square.ownerId).length;

    return {
      id: board.id,
      boardNumber: board.boardNumber,
      title: board.title,
      fundraiserName: board.fundraiserName,
      league: board.league,
      mode: board.mode,
      visibility: board.visibility,
      status: board.status,
      teamName: board.team.name,
      accessCode: board.accessCodeLookup ?? undefined,
      pricePerSquareCents: board.pricePerSquareCents,
      soldSquares
    };
  });
  const totalRaised = boardCards.reduce(
    (sum, board) => sum + board.soldSquares * board.pricePerSquareCents,
    0
  );
  const claimedSquares = boardCards.reduce((sum, board) => sum + board.soldSquares, 0);

  return (
    <div className="page stack">
      <div>
        <p className="eyebrow">Host dashboard</p>
        <h1>{user.name}&apos;s fundraiser boards.</h1>
        <p>Monitor boards, payment status, schedule sync, and quarter winners from one place.</p>
      </div>
      <div className="metric-grid">
        <div className="card">
          <p className="label">Open boards</p>
          <h2>{boardCards.length}</h2>
        </div>
        <div className="card">
          <p className="label">Squares claimed</p>
          <h2>{claimedSquares}</h2>
        </div>
        <div className="card">
          <p className="label">Manual payments due</p>
          <h2>{formatMoney(totalRaised)}</h2>
        </div>
      </div>
      <div className="actions">
        <Link className="button" href="/boards/new">
          New board
        </Link>
      </div>
      {boardCards.length > 0 ? (
        <div className="board-list">
          {boardCards.map((board) => (
            <BoardCard board={board} key={board.id} />
          ))}
        </div>
      ) : (
        <div className="card">
          <h3>No boards yet</h3>
          <p>Create your first fundraiser board and it will appear here.</p>
        </div>
      )}
      <div className="card">
        <h3>Recent reservations</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Board</th>
              <th>Squares</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Jamie L.</td>
              <td>12U Baseball Chiefs Squares</td>
              <td>4</td>
              <td>Reserved</td>
            </tr>
            <tr>
              <td>Morgan R.</td>
              <td>Bulldogs Season Booster Board</td>
              <td>2</td>
              <td>Paid</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
