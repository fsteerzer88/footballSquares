import { prisma } from "./db";
import { getSportsProvider } from "./sports-provider";
import { withNormalizedShortName } from "./team-abbreviations";
import type { League, Team } from "./types";

function sourcePrefix(league: League) {
  if (process.env.SPORTS_PROVIDER === "api-sports") {
    return `api-sports-${league.toLowerCase()}-`;
  }

  return `${league.toLowerCase()}-`;
}

function dbTeamToTeam(team: {
  id: string;
  externalId: string | null;
  league: League;
  name: string;
  shortName: string;
  logoUrl: string | null;
}): Team {
  return withNormalizedShortName({
    id: team.externalId ?? team.id,
    league: team.league,
    name: team.name,
    shortName: team.shortName,
    logoUrl: team.logoUrl ?? undefined
  });
}

export async function getCachedTeams(league: League): Promise<Team[]> {
  const prefix = sourcePrefix(league);
  const cachedTeams = await prisma.team.findMany({
    where: {
      league,
      externalId: {
        startsWith: prefix
      }
    },
    orderBy: { name: "asc" }
  });

  if (cachedTeams.length > 0) {
    return cachedTeams.map(dbTeamToTeam).filter(isPlayableTeam);
  }

  const provider = getSportsProvider();
  const providerTeams = (await provider.getTeams(league)).map(withNormalizedShortName);

  await prisma.$transaction(
    providerTeams.map((team) =>
      prisma.team.upsert({
        where: { externalId: team.id },
        update: {
          league: team.league,
          name: team.name,
          shortName: team.shortName,
          logoUrl: team.logoUrl
        },
        create: {
          externalId: team.id,
          league: team.league,
          name: team.name,
          shortName: team.shortName,
          logoUrl: team.logoUrl
        }
      })
    )
  );

  return providerTeams.filter(isPlayableTeam);
}

function isPlayableTeam(team: Team) {
  return !["AFC", "NFC"].includes(team.name);
}
