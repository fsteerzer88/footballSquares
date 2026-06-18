import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { getCurrentUser } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gridiron Giving",
  description: "Football squares boards for youth sports fundraising."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            Gridiron Giving
          </Link>
          <nav className="main-nav" aria-label="Primary navigation">
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/boards/new">Create board</Link>
            <Link href="/dashboard">Dashboard</Link>
            {user ? (
              <>
                <span className="nav-user">{user.name}</span>
                <SignOutButton />
              </>
            ) : (
              <Link className="button small" href="/auth/sign-in">
                Sign in
              </Link>
            )}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
