"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button className="nav-button" disabled={pending} onClick={signOut} type="button">
      {pending ? "Signing out" : "Sign out"}
    </button>
  );
}
