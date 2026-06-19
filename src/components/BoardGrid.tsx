"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BOARD_SIZE, getWinningCoordinate } from "@/lib/board-rules";
import type { BoardDetailData } from "@/lib/board-detail-types";
import { formatMoney } from "@/lib/format";

type QuarterKey = "q1" | "q2" | "q3" | "final";
type ManualScoreInput = Record<QuarterKey, { away: string; home: string }>;

const quarterLabels: Array<{ key: QuarterKey; label: string }> = [
  { key: "q1", label: "1st" },
  { key: "q2", label: "2nd" },
  { key: "q3", label: "3rd" },
  { key: "final", label: "Final" }
];

function initialManualScores(board: BoardDetailData): ManualScoreInput {
  return {
    q1: {
      home: board.nextGame.scores?.q1?.[0]?.toString() ?? "",
      away: board.nextGame.scores?.q1?.[1]?.toString() ?? ""
    },
    q2: {
      home: board.nextGame.scores?.q2?.[0]?.toString() ?? "",
      away: board.nextGame.scores?.q2?.[1]?.toString() ?? ""
    },
    q3: {
      home: board.nextGame.scores?.q3?.[0]?.toString() ?? "",
      away: board.nextGame.scores?.q3?.[1]?.toString() ?? ""
    },
    final: {
      home: board.nextGame.scores?.final?.[0]?.toString() ?? "",
      away: board.nextGame.scores?.final?.[1]?.toString() ?? ""
    }
  };
}

export function BoardGrid({ board }: { board: BoardDetailData }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [digits, setDigits] = useState(board.digits ?? null);
  const [boardStatus, setBoardStatus] = useState(board.status);
  const [deleteSquaresMode, setDeleteSquaresMode] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [reservationName, setReservationName] = useState("");
  const [accessCode, setAccessCode] = useState(board.accessCode ?? "");
  const [nextAccessCode, setNextAccessCode] = useState("");
  const [testHomeScore, setTestHomeScore] = useState("");
  const [testAwayScore, setTestAwayScore] = useState("");
  const [scoreMode, setScoreMode] = useState<"AUTO" | "MANUAL">("AUTO");
  const [manualScores, setManualScores] = useState<ManualScoreInput>(() => initialManualScores(board));
  const isBoardOpen = boardStatus === "OPEN";
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
          {
            ownerName: square.ownerName,
            paymentStatus: square.paymentStatus
          }
        ])
      ),
    [board.ownedSquares]
  );
  const testWinner = useMemo(() => {
    if (!digits || testHomeScore.trim() === "" || testAwayScore.trim() === "") {
      return null;
    }

    const homeScore = Number(testHomeScore);
    const awayScore = Number(testAwayScore);

    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
      return null;
    }

    return getWinningCoordinate([homeScore, awayScore], digits.homeDigits, digits.awayDigits);
  }, [digits, testAwayScore, testHomeScore]);
  const testWinnerKey = testWinner ? `${testWinner.row}:${testWinner.column}` : null;
  const testWinnerSquare = testWinnerKey ? ownedSquares.get(testWinnerKey) : undefined;
  const lockedWinnerKeys = new Set(board.winners.map((winner) => `${winner.row}:${winner.column}`));

  useEffect(() => {
    setSelected(new Set());
    setDigits(board.digits ?? null);
    setTestHomeScore("");
    setTestAwayScore("");
    setManualScores(initialManualScores(board));
    setBoardStatus(board.status);
  }, [board.selectedGameId, board.digits, board]);

  function toggleSquare(key: string) {
    if (!isBoardOpen || ownedSquares.has(key) || pending) {
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
    if (!isBoardOpen) {
      setMessage("This board is locked and no longer accepts changes.");
      return;
    }

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
    if (!isBoardOpen) {
      setMessage("This board is locked and cannot be changed.");
      return;
    }

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

  async function updatePaymentStatus(row: number, column: number, status: "RESERVED" | "PAID") {
    if (!isBoardOpen) {
      setMessage("This board is locked and cannot be changed.");
      return;
    }

    setMessage("");
    setPending(true);

    const response = await fetch(`/api/boards/${board.id}/squares/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row, column, status })
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to update payment status.");
      setPending(false);
      return;
    }

    setMessage(status === "PAID" ? "Square marked paid." : "Square marked unpaid.");
    setPending(false);
    router.refresh();
  }

  async function updatePurchasePaymentStatus(purchaseId: string, status: "RESERVED" | "PAID") {
    if (!isBoardOpen) {
      setMessage("This board is locked and cannot be changed.");
      return;
    }

    setMessage("");
    setPending(true);

    const response = await fetch(`/api/boards/${board.id}/purchases/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseId, status })
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to update payment status.");
      setPending(false);
      return;
    }

    setMessage(status === "PAID" ? "Reservation marked paid." : "Reservation marked unpaid.");
    setPending(false);
    router.refresh();
  }

  async function saveAccessCode() {
    if (!isBoardOpen) {
      setMessage("This board is locked and cannot be changed.");
      return;
    }

    setMessage("");
    setPending(true);

    const response = await fetch(`/api/boards/${board.id}/access-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCode: nextAccessCode })
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to save that access code.");
      setPending(false);
      return;
    }

    setAccessCode(payload.accessCode);
    setNextAccessCode("");
    setMessage("Board access code saved.");
    setPending(false);
    router.refresh();
  }

  function updateManualScore(quarter: QuarterKey, team: "away" | "home", value: string) {
    setManualScores((current) => ({
      ...current,
      [quarter]: {
        ...current[quarter],
        [team]: value
      }
    }));
  }

  async function saveManualScores() {
    if (!isBoardOpen) {
      setMessage("This board is locked and cannot be changed.");
      return;
    }

    setMessage("");
    setPending(true);

    const scores = Object.fromEntries(
      quarterLabels.map(({ key }) => [
        key,
        {
          away: Number(manualScores[key].away),
          home: Number(manualScores[key].home)
        }
      ])
    ) as Record<QuarterKey, { away: number; home: number }>;

    const hasInvalidScore = quarterLabels.some(({ key }) => {
      const away = scores[key].away;
      const home = scores[key].home;
      return (
        manualScores[key].away.trim() === "" ||
        manualScores[key].home.trim() === "" ||
        !Number.isInteger(away) ||
        !Number.isInteger(home) ||
        away < 0 ||
        home < 0
      );
    });

    if (hasInvalidScore) {
      setMessage("Enter whole-number scores for every quarter and final.");
      setPending(false);
      return;
    }

    const response = await fetch(`/api/boards/${board.id}/scores/manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: board.selectedGameId, scores })
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to save manual scores.");
      setPending(false);
      return;
    }

    setTestAwayScore(manualScores.final.away);
    setTestHomeScore(manualScores.final.home);
    setMessage("Manual scores saved.");
    setPending(false);
    router.refresh();
  }

  async function lockDigitsForGame() {
    if (!isBoardOpen) {
      setMessage("This board is locked and cannot be changed.");
      return;
    }

    setMessage("");
    setPending(true);

    const response = await fetch(`/api/boards/${board.id}/digits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: board.selectedGameId })
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to lock digits for this game.");
      if (payload.digits) {
        setDigits(payload.digits);
      }
      setPending(false);
      return;
    }

    setDigits(payload.digits);
    setMessage("Digits locked for this game.");
    setPending(false);
    router.refresh();
  }

  async function closeBoard() {
    const confirmed = window.confirm(
      "Close and lock this board? No reservations, payment updates, score edits, digit locks, or access-code changes can be made after this."
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setPending(true);

    const response = await fetch(`/api/boards/${board.id}/close`, {
      method: "POST"
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to lock this board.");
      setPending(false);
      return;
    }

    setBoardStatus("CLOSED");
    setDeleteSquaresMode(false);
    setSelected(new Set());
    setMessage("Board locked. No further changes can be made.");
    setPending(false);
    router.refresh();
  }

  async function archiveBoard() {
    setMessage("");
    setPending(true);

    const response = await fetch(`/api/boards/${board.id}/archive`, {
      method: "POST"
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to archive this board.");
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      {board.isHost ? (
        <section className="host-toolbar">
          <div className="host-toolbar-heading">
            <span className="label">Host controls</span>
            <strong>{boardStatus === "OPEN" ? "Board open" : "Board locked"}</strong>
          </div>
          <div className="host-toolbar-actions">
            <button
              className={`button small ${deleteSquaresMode ? "danger" : "secondary"}`}
              disabled={!isBoardOpen}
              onClick={() => setDeleteSquaresMode((current) => !current)}
              type="button"
            >
              {deleteSquaresMode ? "Done deleting squares" : "Delete users squares"}
            </button>
            <button className="button small secondary" disabled={Boolean(digits) || pending || !isBoardOpen} onClick={lockDigitsForGame} type="button">
              {digits ? "Digits locked" : "Lock digits for this game"}
            </button>
            <button className="button small danger" disabled={!isBoardOpen || pending} onClick={closeBoard} type="button">
              Close game / lock board
            </button>
            <button className="button small secondary" disabled={pending} onClick={archiveBoard} type="button">
              Archive board
            </button>
          </div>
          {deleteSquaresMode ? (
            <p className="helper-text">Click the red x on a reserved square to remove that reservation.</p>
          ) : null}
          {digits ? (
            <p className="helper-text">This game&apos;s digits are saved. Hosts and users can return to this game board later.</p>
          ) : null}
          {board.winners.length === 0 && digits ? (
            <p className="helper-text">Enter or sync scores to show this game&apos;s winners.</p>
          ) : null}
          <div className="score-test host-toolbar-score">
            <div>
              <span className="label">Test winning square</span>
              <p className="helper-text">
                Enter a score to highlight the square matching the last digit of each team.
              </p>
            </div>
            <div className="score-mode-toggle" aria-label="Score source">
              <button
                className={scoreMode === "AUTO" ? "active" : ""}
                disabled={!isBoardOpen}
                onClick={() => setScoreMode("AUTO")}
                type="button"
              >
                Automatic
              </button>
              <button
                className={scoreMode === "MANUAL" ? "active" : ""}
                disabled={!isBoardOpen}
                onClick={() => setScoreMode("MANUAL")}
                type="button"
              >
                Manual
              </button>
            </div>
            {scoreMode === "MANUAL" ? (
              <div className="manual-score-panel">
                <div className="manual-score-grid manual-score-heading">
                  <span>Quarter</span>
                  <span>{board.nextGame.awayTeam.shortName}</span>
                  <span>{board.nextGame.homeTeam.shortName}</span>
                </div>
                {quarterLabels.map(({ key, label }) => (
                  <div className="manual-score-grid" key={key}>
                    <span>{label}</span>
                    <input
                      aria-label={`${board.nextGame.awayTeam.shortName} ${label} score`}
                      disabled={!isBoardOpen}
                      min="0"
                      onChange={(event) => updateManualScore(key, "away", event.target.value)}
                      type="number"
                      value={manualScores[key].away}
                    />
                    <input
                      aria-label={`${board.nextGame.homeTeam.shortName} ${label} score`}
                      disabled={!isBoardOpen}
                      min="0"
                      onChange={(event) => updateManualScore(key, "home", event.target.value)}
                      type="number"
                      value={manualScores[key].home}
                    />
                  </div>
                ))}
                <button className="button small" disabled={pending || !isBoardOpen} onClick={saveManualScores} type="button">
                  Save manual scores
                </button>
              </div>
            ) : (
              <p className="helper-text">Automatic mode uses scores from the sports API when they are available.</p>
            )}
            <div className="score-test-inputs">
              <div className="field">
                <label htmlFor={`test-away-score-${board.id}`}>{board.nextGame.awayTeam.shortName} score</label>
                <input
                  id={`test-away-score-${board.id}`}
                  min="0"
                  onChange={(event) => setTestAwayScore(event.target.value)}
                  type="number"
                  value={testAwayScore}
                />
              </div>
              <div className="field">
                <label htmlFor={`test-home-score-${board.id}`}>{board.nextGame.homeTeam.shortName} score</label>
                <input
                  id={`test-home-score-${board.id}`}
                  min="0"
                  onChange={(event) => setTestHomeScore(event.target.value)}
                  type="number"
                  value={testHomeScore}
                />
              </div>
            </div>
            {digits ? (
              testWinner ? (
                <div className="winner-result">
                  <span>
                    {board.nextGame.awayTeam.shortName} {Number(testAwayScore) % 10} /{" "}
                    {board.nextGame.homeTeam.shortName} {Number(testHomeScore) % 10}
                  </span>
                  <strong>
                    Row {testWinner.row + 1}, column {testWinner.column + 1}
                  </strong>
                  <span>{testWinnerSquare?.ownerName ?? "No square reserved yet"}</span>
                </div>
              ) : (
                <p className="helper-text">Enter whole-number scores to test a winner.</p>
              )
            ) : (
              <p className="helper-text">Lock digits before testing a winning square.</p>
            )}
          </div>
        </section>
      ) : null}
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
                  const square = ownedSquares.get(key);
                  const owned = Boolean(square);
                  const isSelected = selected.has(key);
                  const isTestWinner = testWinnerKey === key;
                  const isLockedWinner = lockedWinnerKeys.has(key);
                  const paymentClass = square?.paymentStatus === "PAID" ? "paid" : owned ? "unpaid" : "";

                  return (
                    <div className="square-cell-wrap" key={key}>
                      <button
                        className={`cell ${owned ? "owned" : ""} ${paymentClass} ${isSelected ? "selected" : ""} ${isLockedWinner ? "locked-winner" : ""} ${isTestWinner ? "test-winner" : ""}`}
                        onClick={() => toggleSquare(key)}
                        type="button"
                      >
                        {owned ? (
                          <span className="square-name">
                            <span>{square?.ownerName}</span>
                            {board.isHost ? (
                              <small>{square?.paymentStatus === "PAID" ? "Paid" : "Needs payment"}</small>
                            ) : null}
                          </span>
                        ) : isSelected ? (
                          <span className="square-name">You</span>
                        ) : (
                          ""
                        )}
                      </button>
                      {owned && deleteSquaresMode && board.isHost ? (
                        <div className="square-host-actions">
                          <button
                            aria-label={`Remove reservation for row ${cell.row + 1}, column ${cell.column + 1}`}
                            className="remove-square"
                            disabled={pending || !isBoardOpen}
                            onClick={() => releaseSquare(cell.row, cell.column)}
                            type="button"
                          >
                            x
                          </button>
                          <button
                            className="payment-toggle"
                            disabled={pending || !isBoardOpen}
                            onClick={() =>
                              updatePaymentStatus(
                                cell.row,
                                cell.column,
                                square?.paymentStatus === "PAID" ? "RESERVED" : "PAID"
                              )
                            }
                            type="button"
                          >
                            {square?.paymentStatus === "PAID" ? "Unpaid" : "Paid"}
                          </button>
                        </div>
                      ) : owned && board.isHost ? (
                        <button
                          className="payment-toggle"
                          disabled={pending || !isBoardOpen}
                          onClick={() =>
                            updatePaymentStatus(
                              cell.row,
                              cell.column,
                              square?.paymentStatus === "PAID" ? "RESERVED" : "PAID"
                            )
                          }
                          type="button"
                        >
                          {square?.paymentStatus === "PAID" ? "Unpaid" : "Paid"}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
            </Fragment>
          ))}
        </div>
        {board.isHost && board.reservations.length > 0 ? (
          <div className="reservation-ledger">
            <div>
              <span className="label">Reservations</span>
              <p className="helper-text">Track buyer squares and mark each reservation paid from this list.</p>
            </div>
            <div className="reservation-list">
              {board.reservations.map((reservation) => (
                <div className={`reservation-row ${reservation.status === "PAID" ? "paid" : "unpaid"}`} key={reservation.id}>
                  <div>
                    <strong>{reservation.name}</strong>
                    <span>
                      {reservation.squares
                        .map((square) => `R${square.row + 1} C${square.column + 1}`)
                        .join(", ")}
                    </span>
                  </div>
                  <div>
                    <strong>{formatMoney(reservation.amountDueCents)}</strong>
                    <span>{reservation.status === "PAID" ? "Paid" : "Needs payment"}</span>
                  </div>
                  <button
                    className="button small secondary"
                    disabled={pending || !isBoardOpen}
                    onClick={() =>
                      updatePurchasePaymentStatus(
                        reservation.id,
                        reservation.status === "PAID" ? "RESERVED" : "PAID"
                      )
                    }
                    type="button"
                  >
                    {reservation.status === "PAID" ? "Mark unpaid" : "Mark paid"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
      <aside className="card stack">
        <div>
          <span className="status-pill">{boardStatus}</span>
          <h2>{board.title}</h2>
          <p>{board.fundraiserName}</p>
          <p className="board-host">
            <span>Board host</span>
            <strong>{board.hostName}</strong>
          </p>
        </div>
        {board.mode === "SEASON" ? (
          <div className="season-snapshots">
            <span className="label">Season game boards</span>
            <div className="season-snapshot-list">
              {board.gameSnapshots.map((snapshot) => (
                <Link
                  className={`season-snapshot ${snapshot.gameId === board.selectedGameId ? "active" : ""}`}
                  href={`/boards/${board.boardNumber}?game=${snapshot.gameId}`}
                  key={snapshot.gameId}
                  scroll={false}
                >
                  <strong>Week {snapshot.week}</strong>
                  <span>{snapshot.matchup}</span>
                  <small>{snapshot.hasLockedDigits ? "Digits locked" : "No digits yet"}</small>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        {board.isHost && board.visibility === "CODE_PROTECTED" ? (
          <div className="access-code-box">
            <span className="label">Pool password</span>
            {accessCode ? (
              <strong>{accessCode}</strong>
            ) : (
              <p className="helper-text">No display code is saved for this older board.</p>
            )}
            <div className="field">
              <label htmlFor={`access-code-${board.id}`}>
                {accessCode ? "Update pool password" : "Set pool password"}
              </label>
              <input
                id={`access-code-${board.id}`}
                disabled={!isBoardOpen}
                maxLength={64}
                minLength={4}
                onChange={(event) => setNextAccessCode(event.target.value)}
                placeholder={accessCode ? "Enter a new password" : "Enter the pool password"}
                value={nextAccessCode}
              />
            </div>
            <button
              className="button small secondary"
              disabled={nextAccessCode.trim().length < 4 || pending || !isBoardOpen}
              onClick={saveAccessCode}
              type="button"
            >
              Save password
            </button>
          </div>
        ) : null}
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
        {board.winners.length > 0 ? (
          <div className="winner-list">
            <span className="label">Winners</span>
            {board.winners.map((winner) => (
              <div className="winner-row" key={winner.quarter}>
                <strong>
                  {winner.quarter} winner - {formatMoney(winner.payoutCents)}
                </strong>
                <span>
                  {board.nextGame.awayTeam.shortName} {winner.awayScore} /{" "}
                  {board.nextGame.homeTeam.shortName} {winner.homeScore}
                </span>
                <span>
                  Row {winner.row + 1}, column {winner.column + 1}
                  {winner.ownerName ? ` - ${winner.ownerName}` : " - Unclaimed"}
                </span>
              </div>
            ))}
          </div>
        ) : null}
        <table className="table">
          <tbody>
            {board.isHost ? (
              <>
                <tr>
                  <th>Amount received</th>
                  <td>{formatMoney(board.paymentSummary.receivedCents)}</td>
                </tr>
                <tr>
                  <th>Amount owed</th>
                  <td>{formatMoney(board.paymentSummary.owedCents)}</td>
                </tr>
              </>
            ) : null}
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
            disabled={!isBoardOpen}
            maxLength={80}
            onChange={(event) => setReservationName(event.target.value)}
            placeholder="Leave blank to use your account name"
            value={reservationName}
          />
        </div>
        {message ? <p className="helper-text">{message}</p> : null}
        <button
          className="button"
          disabled={selected.size === 0 || pending || !isBoardOpen}
          onClick={reserveSquares}
          type="button"
        >
          {pending ? "Reserving" : "Reserve squares"}
        </button>
      </aside>
    </div>
    </>
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
