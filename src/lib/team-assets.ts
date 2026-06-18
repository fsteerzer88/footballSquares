import type { League, Team } from "./types";

const nflLogoCodes: Record<string, string> = {
  "nfl-ari": "ari",
  "nfl-atl": "atl",
  "nfl-bal": "bal",
  "nfl-buf": "buf",
  "nfl-car": "car",
  "nfl-chi": "chi",
  "nfl-cin": "cin",
  "nfl-cle": "cle",
  "nfl-dal": "dal",
  "nfl-den": "den",
  "nfl-det": "det",
  "nfl-gb": "gb",
  "nfl-hou": "hou",
  "nfl-ind": "ind",
  "nfl-jax": "jax",
  "nfl-kc": "kc",
  "nfl-lac": "lac",
  "nfl-lar": "lar",
  "nfl-lv": "lv",
  "nfl-mia": "mia",
  "nfl-min": "min",
  "nfl-ne": "ne",
  "nfl-no": "no",
  "nfl-nyg": "nyg",
  "nfl-nyj": "nyj",
  "nfl-phi": "phi",
  "nfl-pit": "pit",
  "nfl-sea": "sea",
  "nfl-sf": "sf",
  "nfl-tb": "tb",
  "nfl-ten": "ten",
  "nfl-was": "wsh"
};

export function logoUrlForTeam(teamId: string, league: League) {
  if (league !== "NFL") {
    return undefined;
  }

  const logoCode = nflLogoCodes[teamId];
  return logoCode ? `https://a.espncdn.com/i/teamlogos/nfl/500/${logoCode}.png` : undefined;
}

export function withTeamLogo(team: Team): Team {
  return {
    ...team,
    logoUrl: team.logoUrl ?? logoUrlForTeam(team.id, team.league)
  };
}
