import { redirect } from "next/navigation";
import { NewBoardForm } from "@/components/NewBoardForm";
import { getCurrentUser } from "@/lib/session";

export default async function NewBoardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in?next=/boards/new");
  }

  return (
    <div className="page stack">
      <div>
        <p className="eyebrow">Create board</p>
        <h1>Set up a fundraiser board.</h1>
        <p>
          Choose NFL or college, select a game or season, set square price and payouts, then share
          the board with supporters.
        </p>
      </div>
      <NewBoardForm />
    </div>
  );
}
