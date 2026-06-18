"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  redirectTo?: string;
};

export function AuthForm({ mode, redirectTo = "/dashboard" }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const isSignUp = mode === "sign-up";

  async function submit(formData: FormData) {
    setError("");

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password")
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Unable to authenticate.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form className="card form" action={submit}>
      {isSignUp ? (
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required />
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" minLength={isSignUp ? 8 : 1} required />
      </div>
      {error ? <p>{error}</p> : null}
      <button className="button" type="submit">
        {isSignUp ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
