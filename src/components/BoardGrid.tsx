"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BOARD_SIZE, createDigitSet } from "@/lib/board-rules";
import type { BoardDetailData } from "@/lib/board-detail-types";
import { formatMoney } from "@/lib/format";

export function BoardGrid({ board }: { board: BoardDetailData }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [digits, setDigits] = useState(board.digits ?? null);
  const [hostMode, setHostMode] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [reservationName, setReservationName] = useState("");
  const price = selected.size * board.pricePerSquareCents;
  const kickoff = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(board.nextGame.kickoffAt));

  const cells = useMemo(
    () =>
      Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => ({
        row: Math.floor(index / BOARD_SIZE),
        column: index % BOARD_SIZE
      })),
    []
  );
  const ownedSquares = useMemo(
    () =>
      new Map(
        board.ownedSquares.map((square) => [
          `${square.row}:${square.column}`,
          square.ownerName
        ])
      ),
    [board.ownedSquares]
  );

  function toggleSquare(key: string) {
    if (ownedSquares.has(key) || pending) {
      return;
    }

    setSelected((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else if (!board.maxSquaresPerBuyer || next.size < board.maxSquaresPerBuyer) {
        next.add(key);
      }

      return next;
    });
  }

  async function reserveSquares() {
    setMessage("");
    setPending(true);

    const squares = Array.from(selected).map((key) => {
      const [row, column] = key.split(":").map(Number);
      return { row, column };
    });

    const response = await fetch(`/api/boards/${board.id}/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationName, squares })
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to reserve those squares.");
      setPending(false);
      return;
    }

    setSelected(new Set());
    setReservationName("");
    setMessage(`Reserved ${squares.length} square${squares.length === 1 ? "" : "s"}.`);
    setPending(false);
    router.refresh();
  }

  async function releaseSquare(row: number, column: number) {
    setMessage("");
    setPending(true);

    const response = await fetch(`/api/boards/${board.id}/squares/release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row, column })
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to remove that reservation.");
      setPending(false);
      return;
    }

    setMessage("Reservation removed.");
    setPending(false);
    router.refresh();
  }

  return (
    <div className="board-detail">
      <section className="board-stage">
        <div className="square-board" aria-label="Football squares board">
          <div className="axis-spacer axis-spacer-top" />
          <div className="team-axis team-axis-home">
            <TeamMark team={board.nextGame.homeTeam} />
          </div>
          <div className="axis-spacer axis-spacer-side" />
          <div className="cell axis">-</div>
          {Array.from({ length: BOARD_SIZE }, (_, index) => (
            <div className="cell axis" key={`home-${index}`}>
              {digits ? digits.homeDigits[index] : "?"}
            </div>
          ))}
          <div className="team-axis team-axis-away">
            <TeamMark axis="away" team={board.nextGame.awayTeam} />
          </div>
          {Array.from({ length: BOARD_SIZE }, (_, row) => (
            <Fragment key={`row-${row}`}>
              <div className="cell axis" key={`away-${row}`}>
                {digits ? digits.awayDigits[row] : "?"}
              </div>
              {cells
                .filter((cell) => cell.row === row)
                .map((cell) => {
                  const key = `${cell.row}:${cell.column}`;
                  const ownerName = ownedSquares.get(key);
                  const owned = Boolean(ownerName);
                  const isSelected = selected.has(key);

                  return (
                    <div className="square-cell-wrap" key={key}>
                      <button
                        className={`cell ${owned ? "owned" : ""} ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleSquare(key)}
                        type="button"
                      >
                        {owned ? (
                          <span className="square-name">{ownerName}</span>
                        ) : isSelected ? (
                          <span className="square-name">You</span>
                        ) : (
                          ""
                        )}
                      </button>
                      {owned && hostMode && board.isHost ? (
                        <button
                          aria-label={`Remove reservation for row ${cell.row + 1}, column ${cell.column + 1}`}
                          className="remove-square"
                          disabled={pending}
                          onClick={() => releaseSquare(cell.row, cell.column)}
                          type="button"
                        >
                          x
                        </button>
                      ) : null}
                    </div>
                  );
                })}
            </Fragment>
          ))}
        </div>
      </section>
      <aside className="card stack">
        <div>
          <span className="status-pill">{board.status}</span>
          <h2>{board.title}</h2>
          <p>{board.fundraiserName}</p>
        </div>
        <p>
          {board.nextGame.awayTeam.shortName} at {board.nextGame.homeTeam.shortName}, Week{" "}
          {board.nextGame.week}
        </p>
        <div className="matchup-card">
          <TeamMark team={board.nextGame.awayTeam} />
          <span>at</span>
          <TeamMark team={board.nextGame.homeTeam} />
        </div>
        <p className="game-time">{kickoff}</p>
        <p>
          {board.mode === "SEASON"
            ? "Your selected positions stay yours all season. Digits are randomized separately before each game."
            : "Digits are hidden until the board sells out or the host closes the board."}
        </p>
        <table className="table">
          <tbody>
            <tr>
              <th>Square price</th>
              <td>{formatMoney(board.pricePerSquareCents)}</td>
            </tr>
            <tr>
              <th>Selected</th>
              <td>{selected.size}</td>
            </tr>
            <tr>
              <th>Amount due</th>
              <td>{formatMoney(price)}</td>
            </tr>
          </tbody>
        </table>
        <div className="field">
          <label htmlFor={`reservation-name-${board.id}`}>Name on squares</label>
          <input
            id={`reservation-name-${board.id}`}
            maxLength={80}
            onChange={(event) => setReservationName(event.target.value)}
            placeholder="Leave blank to use your account name"
            value={reservationName}
          />
        </div>
        {message ? <p className="helper-text">{message}</p> : null}
        <button
          className="button"
          disabled={selected.size === 0 || pending}
          onClick={reserveSquares}
          type="button"
        >
          {pending ? "Reserving" : "Reserve squares"}
        </button>
        <div className="host-tools">
          <label className="host-toggle">
            <input
              checked={hostMode}
              onChange={(event) => setHostMode(event.target.checked)}
              type="checkbox"
            />
            Host controls
          </label>
          {hostMode && board.isHost ? (
            <button className="button secondary" onClick={() => setDigits(createDigitSet())} type="button">
              Randomize digits
            </button>
          ) : hostMode ? (
            <p className="helper-text">Only this board&apos;s host can use host controls.</p>
          ) : (
            <p className="helper-text">Only the host can randomize board numbers.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function TeamMark({
  axis = "default",
  team
}: {
  axis?: "default" | "away";
  team: {
    name: string;
    shortName: string;
    logoUrl?: string;
  };
}) {
  return (
    <span className={`team-mark ${axis === "away" ? "team-mark-away" : ""}`}>
      {team.logoUrl ? (
        <span className="team-logo-wrap has-image">
          <img
            alt=""
            className="team-logo-img"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.parentElement?.classList.remove("has-image");
            }}
            src={team.logoUrl}
          />
          <span className="team-logo-fallback">{team.shortName.slice(0, 3)}</span>
        </span>
      ) : (
        <span className="team-logo-wrap team-logo-wrap-fallback">
          <span className="team-logo-fallback">{team.shortName.slice(0, 3)}</span>
        </span>
      )}
      <span className="team-name">{team.name}</span>
    </span>
  );
}
