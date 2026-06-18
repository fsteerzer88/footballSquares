import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { BoardCardData } from "@/lib/board-card-types";

export function BoardCard({ board }: { board: BoardCardData }) {
  return (
    <article className="card stack">
      <div>
        <span className="status-pill">
          {board.league} {board.mode === "SEASON" ? "Season" : "Single game"}
        </span>
      </div>
      <div>
        <h3>{board.title}</h3>
        <p>{board.fundraiserName}</p>
      </div>
      <p>
        {board.teamName} board with {board.soldSquares}/100 squares claimed at{" "}
        {formatMoney(board.pricePerSquareCents)} each.
      </p>
      <div className="actions">
        <Link className="button small" href={`/boards/${board.id}`}>
          View board
        </Link>
      </div>
    </article>
  );
}
