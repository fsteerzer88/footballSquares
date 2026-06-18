"use client";

import { useEffect, useMemo, useState } from "react";
import type { BoardMode, BoardVisibility, Game, League, Team } from "@/lib/types";

type CreatedBoard = {
  id: string;
  title: string;
};

const currentSeason = 2026;

export function NewBoardForm() {
  const [league, setLeague] = useState<League>("NFL");
  const [mode, setMode] = useState<BoardMode>("SINGLE_GAME");
  const [visibility, setVisibility] = useState<BoardVisibility>("PUBLIC");
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [schedule, setSchedule] = useState<Game[]>([]);
  const [gameIds, setGameIds] = useState<string[]>([]);
  const [created, setCreated] = useState<CreatedBoard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/teams?league=${league}`)
      .then((response) => response.json())
      .then((data: Team[]) => {
        setTeams(data);
        setTeamId(data[0]?.id ?? "");
      });
  }, [league]);

  useEffect(() => {
    if (!teamId) {
      return;
    }

    fetch(`/api/schedule?teamId=${teamId}&season=${currentSeason}`)
      .then((response) => response.json())
      .then((data: Game[]) => {
        setSchedule(data);
        setGameIds(data[0] ? [data[0].id] : []);
      });
  }, [teamId]);

  const selectedGames = useMemo(
    () => (mode === "SEASON" ? schedule.map((game) => game.id) : gameIds),
    [gameIds, mode, schedule]
  );

  async function submit(formData: FormData) {
    setError("");
    setCreated(null);

    const response = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        fundraiserName: formData.get("fundraiserName"),
        league,
        mode,
        visibility,
        accessCode: visibility === "CODE_PROTECTED" ? formData.get("accessCode") : undefined,
        teamId,
        gameIds: selectedGames,
        pricePerSquare: Number(formData.get("pricePerSquare")),
        maxSquaresPerBuyer: formData.get("maxSquaresPerBuyer") || undefined,
        payouts: {
          q1: Number(formData.get("payoutQ1")),
          q2: Number(formData.get("payoutQ2")),
          q3: Number(formData.get("payoutQ3")),
          final: Number(formData.get("payoutFinal"))
        }
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Check the board details and try again.");
      return;
    }

    setCreated(payload);
  }

  return (
    <div className="split">
      <form className="card form" action={submit}>
        <div className="field">
          <label htmlFor="title">Board title</label>
          <input id="title" name="title" defaultValue="Friday Night Fundraiser" required />
        </div>
        {visibility === "CODE_PROTECTED" ? (
          <div className="field">
            <label htmlFor="accessCode">Board access code</label>
            <input
              id="accessCode"
              name="accessCode"
              minLength={4}
              placeholder="Example: TIGERS2026"
              required
            />
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="fundraiserName">Fundraiser or team name</label>
          <input id="fundraiserName" name="fundraiserName" defaultValue="Central Youth Football" required />
        </div>
        <div className="field">
          <span className="label">League</span>
          <div className="segmented">
            <button
              className={league === "NFL" ? "active" : ""}
              onClick={() => setLeague("NFL")}
              type="button"
            >
              NFL
            </button>
            <button
              className={league === "NCAA" ? "active" : ""}
              onClick={() => setLeague("NCAA")}
              type="button"
            >
              College
            </button>
          </div>
        </div>
        <div className="field">
          <span className="label">Board type</span>
          <div className="segmented">
            <button
              className={mode === "SINGLE_GAME" ? "active" : ""}
              onClick={() => setMode("SINGLE_GAME")}
              type="button"
            >
              Single game
            </button>
            <button
              className={mode === "SEASON" ? "active" : ""}
              onClick={() => setMode("SEASON")}
              type="button"
            >
              Season
            </button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="team">Team</label>
          <select id="team" value={teamId} onChange={(event) => setTeamId(event.target.value)}>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        {mode === "SINGLE_GAME" ? (
          <div className="field">
            <label htmlFor="game">Game</label>
            <select
              id="game"
              value={gameIds[0] ?? ""}
              onChange={(event) => setGameIds([event.target.value])}
            >
              {schedule.map((game) => (
                <option key={game.id} value={game.id}>
                  Week {game.week}: {game.awayTeam.shortName} at {game.homeTeam.shortName},{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  }).format(new Date(game.kickoffAt))}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p>{schedule.length} regular-season games will be included for this team.</p>
        )}
        <div className="field">
          <span className="label">Visibility</span>
          <div className="segmented">
            <button
              className={visibility === "PUBLIC" ? "active" : ""}
              onClick={() => setVisibility("PUBLIC")}
              type="button"
            >
              Public
            </button>
            <button
              className={visibility === "CODE_PROTECTED" ? "active" : ""}
              onClick={() => setVisibility("CODE_PROTECTED")}
              type="button"
            >
              Code
            </button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="pricePerSquare">Cost per square</label>
          <input id="pricePerSquare" name="pricePerSquare" type="number" min="1" defaultValue="20" required />
        </div>
        <div className="field">
          <label htmlFor="maxSquaresPerBuyer">Max squares per buyer</label>
          <input id="maxSquaresPerBuyer" name="maxSquaresPerBuyer" type="number" min="1" placeholder="No max" />
        </div>
        <div className="field">
          <label htmlFor="payoutQ1">1st quarter payout</label>
          <input id="payoutQ1" name="payoutQ1" type="number" min="0" defaultValue="150" required />
        </div>
        <div className="field">
          <label htmlFor="payoutQ2">2nd quarter payout</label>
          <input id="payoutQ2" name="payoutQ2" type="number" min="0" defaultValue="250" required />
        </div>
        <div className="field">
          <label htmlFor="payoutQ3">3rd quarter payout</label>
          <input id="payoutQ3" name="payoutQ3" type="number" min="0" defaultValue="150" required />
        </div>
        <div className="field">
          <label htmlFor="payoutFinal">Final payout</label>
          <input id="payoutFinal" name="payoutFinal" type="number" min="0" defaultValue="350" required />
        </div>
        <label className="field">
          <span className="label">Compliance acknowledgement</span>
          <span>
            <input type="checkbox" required /> I am responsible for local fundraising and gaming
            compliance before publishing this board.
          </span>
        </label>
        {error ? <p>{error}</p> : null}
        {created ? <p>Created {created.title}. It now appears in your dashboard.</p> : null}
        <button className="button" type="submit">
          Create board
        </button>
      </form>
      <aside className="card stack">
        <h3>Schedule preview</h3>
        {schedule.slice(0, mode === "SEASON" ? 8 : 4).map((game) => (
          <p key={game.id}>
            Week {game.week}: {game.awayTeam.name} at {game.homeTeam.name}
          </p>
        ))}
      </aside>
    </div>
  );
}
