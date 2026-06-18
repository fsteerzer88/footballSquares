import { NextResponse } from "next/server";
import { getCachedTeams } from "@/lib/team-cache";
import type { League } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = (searchParams.get("league") ?? "NFL") as League;

  return NextResponse.json(await getCachedTeams(league));
}
