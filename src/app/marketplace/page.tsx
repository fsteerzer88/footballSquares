import { BoardCard } from "@/components/BoardCard";
import { demoBoards } from "@/lib/demo-data";

export default function MarketplacePage() {
  return (
    <div className="page stack">
      <div>
        <p className="eyebrow">Marketplace</p>
        <h1>Find active fundraiser boards.</h1>
        <p>
          Public boards are listed here. Code-protected boards stay hidden from purchase until
          supporters enter the access code shared by the host.
        </p>
      </div>
      <div className="board-list">
        {demoBoards.map((board) => (
          <BoardCard board={board} key={board.id} />
        ))}
      </div>
    </div>
  );
}
