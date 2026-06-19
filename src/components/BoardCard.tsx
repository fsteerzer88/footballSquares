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
      <p className="helper-text">Board #{board.boardNumber}</p>
      {board.visibility === "CODE_PROTECTED" ? (
        <div className="access-code-box access-code-box-compact">
          <span className="label">Pool password</span>
          {board.accessCode ? (
            <strong>{board.accessCode}</strong>
          ) : (
            <p className="helper-text">No display code saved. Open the board to set a new code.</p>
          )}
        </div>
      ) : null}
      <div className="actions">
        <Link className="button small" href={`/boards/${board.boardNumber}`}>
          View board
        </Link>
      </div>
    </article>
  );
}
