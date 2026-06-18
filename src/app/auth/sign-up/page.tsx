import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default async function SignUpPage({
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
          <p className="eyebrow">Create account</p>
          <h1>Start hosting or buying squares.</h1>
          <p>Any signed-in user can create fundraising boards and manage their own dashboard.</p>
        </div>
        <div className="stack">
          <AuthForm mode="sign-up" redirectTo={redirectTo} />
          <p>
            Already registered? <Link href="/auth/sign-in">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
