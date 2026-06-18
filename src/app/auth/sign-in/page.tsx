import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = next?.startsWith("/") ? next : "/dashboard";

  return (
    <div className="page">
      <div className="split">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Sign in.</h1>
          <p>Use one account to host boards, reserve squares, and track manual payment status.</p>
        </div>
        <div className="stack">
          <AuthForm mode="sign-in" redirectTo={redirectTo} />
          <p>
            Need an account? <Link href="/auth/sign-up">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
