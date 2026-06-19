"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BoardCodeLookup() {
  const router = useRouter();
  const [boardNumber, setBoardNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const response = await fetch("/api/boards/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardNumber, password })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "No board was found for that number.");
      setPending(false);
      return;
    }

    router.push(`/boards/${payload.boardNumber}`);
  }

  return (
    <form className="code-lookup" onSubmit={submit}>
      <div className="field">
        <label htmlFor="board-number">Board number</label>
        <input
          id="board-number"
          inputMode="numeric"
          onChange={(event) => setBoardNumber(event.target.value)}
          placeholder="Enter board number"
          value={boardNumber}
        />
      </div>
      <div className="field">
        <label htmlFor="pool-password">Pool password</label>
        <input
          id="pool-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Required for private boards"
          type="password"
          value={password}
        />
      </div>
      {error ? <p className="helper-text">{error}</p> : null}
      <button className="button" disabled={pending || boardNumber.trim().length === 0} type="submit">
        {pending ? "Finding board" : "Open board"}
      </button>
    </form>
  );
}
