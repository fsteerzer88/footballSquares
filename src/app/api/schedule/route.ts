import { NextResponse } from "next/server";
import { getSportsProvider } from "@/lib/sports-provider";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const season = Number(searchParams.get("season") ?? new Date().getFullYear());

  if (!teamId) {
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });
  }

  const provider = getSportsProvider();

  return NextResponse.json(await provider.getTeamSchedule(teamId, season));
}
