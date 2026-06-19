import type { Game, League, Team } from "./types";
import { withNormalizedShortName } from "./team-abbreviations";
import { withTeamLogo } from "./team-assets";

export interface SportsProvider {
  getTeams(league: League): Promise<Team[]>;
  getTeamSchedule(teamId: string, season: number): Promise<Game[]>;
  getGame(gameId: string): Promise<Game | null>;
}

function team(id: string, league: League, name: string, shortName: string): Team {
  return withTeamLogo({ id, league, name, shortName });
}

const nflTeams: Team[] = [
  team("nfl-ari", "NFL", "Arizona Cardinals", "ARI"),
  team("nfl-atl", "NFL", "Atlanta Falcons", "ATL"),
  team("nfl-bal", "NFL", "Baltimore Ravens", "BAL"),
  team("nfl-buf", "NFL", "Buffalo Bills", "BUF"),
  team("nfl-car", "NFL", "Carolina Panthers", "CAR"),
  team("nfl-chi", "NFL", "Chicago Bears", "CHI"),
  team("nfl-cin", "NFL", "Cincinnati Bengals", "CIN"),
  team("nfl-cle", "NFL", "Cleveland Browns", "CLE"),
  team("nfl-dal", "NFL", "Dallas Cowboys", "DAL"),
  team("nfl-den", "NFL", "Denver Broncos", "DEN"),
  team("nfl-det", "NFL", "Detroit Lions", "DET"),
  team("nfl-gb", "NFL", "Green Bay Packers", "GB"),
  team("nfl-hou", "NFL", "Houston Texans", "HOU"),
  team("nfl-ind", "NFL", "Indianapolis Colts", "IND"),
  team("nfl-jax", "NFL", "Jacksonville Jaguars", "JAX"),
  team("nfl-kc", "NFL", "Kansas City Chiefs", "KC"),
  team("nfl-lac", "NFL", "Los Angeles Chargers", "LAC"),
  team("nfl-lar", "NFL", "Los Angeles Rams", "LAR"),
  team("nfl-lv", "NFL", "Las Vegas Raiders", "LV"),
  team("nfl-mia", "NFL", "Miami Dolphins", "MIA"),
  team("nfl-min", "NFL", "Minnesota Vikings", "MIN"),
  team("nfl-ne", "NFL", "New England Patriots", "NE"),
  team("nfl-no", "NFL", "New Orleans Saints", "NO"),
  team("nfl-nyg", "NFL", "New York Giants", "NYG"),
  team("nfl-nyj", "NFL", "New York Jets", "NYJ"),
  team("nfl-phi", "NFL", "Philadelphia Eagles", "PHI"),
  team("nfl-pit", "NFL", "Pittsburgh Steelers", "PIT"),
  team("nfl-sea", "NFL", "Seattle Seahawks", "SEA"),
  team("nfl-sf", "NFL", "San Francisco 49ers", "SF"),
  team("nfl-tb", "NFL", "Tampa Bay Buccaneers", "TB"),
  team("nfl-ten", "NFL", "Tennessee Titans", "TEN"),
  team("nfl-was", "NFL", "Washington Commanders", "WAS")
];

const ncaaTeams: Team[] = [
  team("ncaa-air-force", "NCAA", "Air Force Falcons", "AFA"),
  team("ncaa-akron", "NCAA", "Akron Zips", "AKR"),
  team("ncaa-alabama", "NCAA", "Alabama Crimson Tide", "ALA"),
  team("ncaa-app-state", "NCAA", "Appalachian State Mountaineers", "APP"),
  team("ncaa-arizona", "NCAA", "Arizona Wildcats", "ARIZ"),
  team("ncaa-arizona-state", "NCAA", "Arizona State Sun Devils", "ASU"),
  team("ncaa-arkansas", "NCAA", "Arkansas Razorbacks", "ARK"),
  team("ncaa-arkansas-state", "NCAA", "Arkansas State Red Wolves", "ARKST"),
  team("ncaa-army", "NCAA", "Army Black Knights", "ARMY"),
  team("ncaa-auburn", "NCAA", "Auburn Tigers", "AUB"),
  team("ncaa-ball-state", "NCAA", "Ball State Cardinals", "BALL"),
  team("ncaa-baylor", "NCAA", "Baylor Bears", "BAY"),
  team("ncaa-boise-state", "NCAA", "Boise State Broncos", "BSU"),
  team("ncaa-boston-college", "NCAA", "Boston College Eagles", "BC"),
  team("ncaa-bowling-green", "NCAA", "Bowling Green Falcons", "BGSU"),
  team("ncaa-buffalo", "NCAA", "Buffalo Bulls", "BUFF"),
  team("ncaa-byu", "NCAA", "BYU Cougars", "BYU"),
  team("ncaa-california", "NCAA", "California Golden Bears", "CAL"),
  team("ncaa-central-michigan", "NCAA", "Central Michigan Chippewas", "CMU"),
  team("ncaa-charlotte", "NCAA", "Charlotte 49ers", "CLT"),
  team("ncaa-cincinnati", "NCAA", "Cincinnati Bearcats", "CIN"),
  team("ncaa-clemson", "NCAA", "Clemson Tigers", "CLEM"),
  team("ncaa-coastal-carolina", "NCAA", "Coastal Carolina Chanticleers", "CCU"),
  team("ncaa-colorado", "NCAA", "Colorado Buffaloes", "COLO"),
  team("ncaa-colorado-state", "NCAA", "Colorado State Rams", "CSU"),
  team("ncaa-delaware", "NCAA", "Delaware Fightin' Blue Hens", "DEL"),
  team("ncaa-duke", "NCAA", "Duke Blue Devils", "DUKE"),
  team("ncaa-east-carolina", "NCAA", "East Carolina Pirates", "ECU"),
  team("ncaa-eastern-michigan", "NCAA", "Eastern Michigan Eagles", "EMU"),
  team("ncaa-fiu", "NCAA", "FIU Panthers", "FIU"),
  team("ncaa-florida", "NCAA", "Florida Gators", "FLA"),
  team("ncaa-florida-atlantic", "NCAA", "Florida Atlantic Owls", "FAU"),
  team("ncaa-florida-state", "NCAA", "Florida State Seminoles", "FSU"),
  team("ncaa-fresno-state", "NCAA", "Fresno State Bulldogs", "FRES"),
  team("ncaa-georgia", "NCAA", "Georgia Bulldogs", "UGA"),
  team("ncaa-georgia-southern", "NCAA", "Georgia Southern Eagles", "GASO"),
  team("ncaa-georgia-state", "NCAA", "Georgia State Panthers", "GSU"),
  team("ncaa-georgia-tech", "NCAA", "Georgia Tech Yellow Jackets", "GT"),
  team("ncaa-hawaii", "NCAA", "Hawaii Rainbow Warriors", "HAW"),
  team("ncaa-houston", "NCAA", "Houston Cougars", "HOU"),
  team("ncaa-illinois", "NCAA", "Illinois Fighting Illini", "ILL"),
  team("ncaa-indiana", "NCAA", "Indiana Hoosiers", "IND"),
  team("ncaa-iowa", "NCAA", "Iowa Hawkeyes", "IOWA"),
  team("ncaa-iowa-state", "NCAA", "Iowa State Cyclones", "ISU"),
  team("ncaa-jacksonville-state", "NCAA", "Jacksonville State Gamecocks", "JVST"),
  team("ncaa-james-madison", "NCAA", "James Madison Dukes", "JMU"),
  team("ncaa-kansas", "NCAA", "Kansas Jayhawks", "KU"),
  team("ncaa-kansas-state", "NCAA", "Kansas State Wildcats", "KSU"),
  team("ncaa-kennesaw-state", "NCAA", "Kennesaw State Owls", "KENN"),
  team("ncaa-kent-state", "NCAA", "Kent State Golden Flashes", "KENT"),
  team("ncaa-kentucky", "NCAA", "Kentucky Wildcats", "UK"),
  team("ncaa-liberty", "NCAA", "Liberty Flames", "LIB"),
  team("ncaa-louisiana", "NCAA", "Louisiana Ragin' Cajuns", "UL"),
  team("ncaa-louisiana-tech", "NCAA", "Louisiana Tech Bulldogs", "LT"),
  team("ncaa-louisiana-monroe", "NCAA", "Louisiana Monroe Warhawks", "ULM"),
  team("ncaa-louisville", "NCAA", "Louisville Cardinals", "LOU"),
  team("ncaa-lsu", "NCAA", "LSU Tigers", "LSU"),
  team("ncaa-marshall", "NCAA", "Marshall Thundering Herd", "MRSH"),
  team("ncaa-maryland", "NCAA", "Maryland Terrapins", "MD"),
  team("ncaa-memphis", "NCAA", "Memphis Tigers", "MEM"),
  team("ncaa-miami-fl", "NCAA", "Miami Hurricanes", "MIA"),
  team("ncaa-miami-oh", "NCAA", "Miami RedHawks", "M-OH"),
  team("ncaa-michigan", "NCAA", "Michigan Wolverines", "MICH"),
  team("ncaa-michigan-state", "NCAA", "Michigan State Spartans", "MSU"),
  team("ncaa-middle-tennessee", "NCAA", "Middle Tennessee Blue Raiders", "MTSU"),
  team("ncaa-minnesota", "NCAA", "Minnesota Golden Gophers", "MINN"),
  team("ncaa-mississippi-state", "NCAA", "Mississippi State Bulldogs", "MSST"),
  team("ncaa-missouri", "NCAA", "Missouri Tigers", "MIZ"),
  team("ncaa-missouri-state", "NCAA", "Missouri State Bears", "MOST"),
  team("ncaa-navy", "NCAA", "Navy Midshipmen", "NAVY"),
  team("ncaa-nebraska", "NCAA", "Nebraska Cornhuskers", "NEB"),
  team("ncaa-nevada", "NCAA", "Nevada Wolf Pack", "NEV"),
  team("ncaa-new-mexico", "NCAA", "New Mexico Lobos", "UNM"),
  team("ncaa-new-mexico-state", "NCAA", "New Mexico State Aggies", "NMSU"),
  team("ncaa-north-carolina", "NCAA", "North Carolina Tar Heels", "UNC"),
  team("ncaa-nc-state", "NCAA", "NC State Wolfpack", "NCSU"),
  team("ncaa-north-texas", "NCAA", "North Texas Mean Green", "UNT"),
  team("ncaa-north-dakota-state", "NCAA", "North Dakota State Bison", "NDSU"),
  team("ncaa-northern-illinois", "NCAA", "Northern Illinois Huskies", "NIU"),
  team("ncaa-northwestern", "NCAA", "Northwestern Wildcats", "NW"),
  team("ncaa-notre-dame", "NCAA", "Notre Dame Fighting Irish", "ND"),
  team("ncaa-ohio", "NCAA", "Ohio Bobcats", "OHIO"),
  team("ncaa-ohio-state", "NCAA", "Ohio State Buckeyes", "OSU"),
  team("ncaa-oklahoma", "NCAA", "Oklahoma Sooners", "OU"),
  team("ncaa-oklahoma-state", "NCAA", "Oklahoma State Cowboys", "OKST"),
  team("ncaa-old-dominion", "NCAA", "Old Dominion Monarchs", "ODU"),
  team("ncaa-ole-miss", "NCAA", "Ole Miss Rebels", "MISS"),
  team("ncaa-oregon", "NCAA", "Oregon Ducks", "ORE"),
  team("ncaa-oregon-state", "NCAA", "Oregon State Beavers", "ORST"),
  team("ncaa-penn-state", "NCAA", "Penn State Nittany Lions", "PSU"),
  team("ncaa-pittsburgh", "NCAA", "Pittsburgh Panthers", "PITT"),
  team("ncaa-purdue", "NCAA", "Purdue Boilermakers", "PUR"),
  team("ncaa-rice", "NCAA", "Rice Owls", "RICE"),
  team("ncaa-rutgers", "NCAA", "Rutgers Scarlet Knights", "RUTG"),
  team("ncaa-sacramento-state", "NCAA", "Sacramento State Hornets", "SAC"),
  team("ncaa-sam-houston", "NCAA", "Sam Houston Bearkats", "SHSU"),
  team("ncaa-san-diego-state", "NCAA", "San Diego State Aztecs", "SDSU"),
  team("ncaa-san-jose-state", "NCAA", "San Jose State Spartans", "SJSU"),
  team("ncaa-smu", "NCAA", "SMU Mustangs", "SMU"),
  team("ncaa-south-alabama", "NCAA", "South Alabama Jaguars", "USA"),
  team("ncaa-south-carolina", "NCAA", "South Carolina Gamecocks", "SC"),
  team("ncaa-south-florida", "NCAA", "South Florida Bulls", "USF"),
  team("ncaa-southern-miss", "NCAA", "Southern Miss Golden Eagles", "USM"),
  team("ncaa-stanford", "NCAA", "Stanford Cardinal", "STAN"),
  team("ncaa-syracuse", "NCAA", "Syracuse Orange", "SYR"),
  team("ncaa-tcu", "NCAA", "TCU Horned Frogs", "TCU"),
  team("ncaa-temple", "NCAA", "Temple Owls", "TEM"),
  team("ncaa-tennessee", "NCAA", "Tennessee Volunteers", "TENN"),
  team("ncaa-texas", "NCAA", "Texas Longhorns", "TEX"),
  team("ncaa-texas-am", "NCAA", "Texas A&M Aggies", "TAMU"),
  team("ncaa-texas-state", "NCAA", "Texas State Bobcats", "TXST"),
  team("ncaa-texas-tech", "NCAA", "Texas Tech Red Raiders", "TTU"),
  team("ncaa-toledo", "NCAA", "Toledo Rockets", "TOL"),
  team("ncaa-troy", "NCAA", "Troy Trojans", "TROY"),
  team("ncaa-tulane", "NCAA", "Tulane Green Wave", "TULN"),
  team("ncaa-tulsa", "NCAA", "Tulsa Golden Hurricane", "TLSA"),
  team("ncaa-uab", "NCAA", "UAB Blazers", "UAB"),
  team("ncaa-ucf", "NCAA", "UCF Knights", "UCF"),
  team("ncaa-ucla", "NCAA", "UCLA Bruins", "UCLA"),
  team("ncaa-uconn", "NCAA", "UConn Huskies", "CONN"),
  team("ncaa-umass", "NCAA", "UMass Minutemen", "UMASS"),
  team("ncaa-unlv", "NCAA", "UNLV Rebels", "UNLV"),
  team("ncaa-usc", "NCAA", "USC Trojans", "USC"),
  team("ncaa-utah", "NCAA", "Utah Utes", "UTAH"),
  team("ncaa-utah-state", "NCAA", "Utah State Aggies", "USU"),
  team("ncaa-utep", "NCAA", "UTEP Miners", "UTEP"),
  team("ncaa-utsa", "NCAA", "UTSA Roadrunners", "UTSA"),
  team("ncaa-vanderbilt", "NCAA", "Vanderbilt Commodores", "VAN"),
  team("ncaa-virginia", "NCAA", "Virginia Cavaliers", "UVA"),
  team("ncaa-virginia-tech", "NCAA", "Virginia Tech Hokies", "VT"),
  team("ncaa-wake-forest", "NCAA", "Wake Forest Demon Deacons", "WAKE"),
  team("ncaa-washington", "NCAA", "Washington Huskies", "WASH"),
  team("ncaa-washington-state", "NCAA", "Washington State Cougars", "WSU"),
  team("ncaa-western-kentucky", "NCAA", "Western Kentucky Hilltoppers", "WKU"),
  team("ncaa-western-michigan", "NCAA", "Western Michigan Broncos", "WMU"),
  team("ncaa-west-virginia", "NCAA", "West Virginia Mountaineers", "WVU"),
  team("ncaa-wisconsin", "NCAA", "Wisconsin Badgers", "WIS"),
  team("ncaa-wyoming", "NCAA", "Wyoming Cowboys", "WYO")
];

export function teamsForLeague(league: League) {
  return league === "NFL" ? nflTeams : ncaaTeams;
}

function opponentFor(team: Team, index: number) {
  const teams = teamsForLeague(team.league).filter((candidate) => candidate.id !== team.id);
  return teams[index % teams.length];
}

export class MockSportsProvider implements SportsProvider {
  async getTeams(league: League): Promise<Team[]> {
    return teamsForLeague(league);
  }

  async getTeamSchedule(teamId: string, season: number): Promise<Game[]> {
    const team = [...nflTeams, ...ncaaTeams].find((candidate) => candidate.id === teamId);

    if (!team) {
      return [];
    }

    return Array.from({ length: team.league === "NFL" ? 17 : 12 }, (_, index) => {
      const opponent = opponentFor(team, index);
      const isHome = index % 2 === 0;
      const kickoff = new Date(Date.UTC(season, 8, 7 + index * 7, 18, 30));

      return {
        id: `${team.id}-${season}-${index + 1}`,
        league: team.league,
        season,
        week: index + 1,
        kickoffAt: kickoff.toISOString(),
        status: "SCHEDULED",
        homeTeam: isHome ? team : opponent,
        awayTeam: isHome ? opponent : team
      };
    });
  }

  async getGame(gameId: string): Promise<Game | null> {
    const [leagueKey, teamKey, seasonText] = gameId.split("-");
    const teamId = `${leagueKey}-${teamKey}`;
    const schedule = await this.getTeamSchedule(teamId, Number(seasonText));

    return schedule.find((game) => game.id === gameId) ?? null;
  }
}

type ApiSportsTeam = {
  id: number;
  name: string;
  code?: string | null;
  logo?: string | null;
};

type ApiSportsGame = {
  game: {
    id: number;
    week?: string;
    date: {
      timestamp?: number;
      date?: string;
      time?: string;
    };
    status: {
      short: string;
    };
  };
  league: {
    season: string | number;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo?: string | null;
    };
    away: {
      id: number;
      name: string;
      logo?: string | null;
    };
  };
  scores?: {
    home?: {
      quarter_1?: number | null;
      quarter_2?: number | null;
      quarter_3?: number | null;
      total?: number | null;
    };
    away?: {
      quarter_1?: number | null;
      quarter_2?: number | null;
      quarter_3?: number | null;
      total?: number | null;
    };
  };
};

class ApiSportsProvider implements SportsProvider {
  private readonly baseUrl = "https://v1.american-football.api-sports.io";
  private readonly mock = new MockSportsProvider();

  async getTeams(league: League): Promise<Team[]> {
    const season = league === "NFL" ? 2024 : 2024;
    const response = await this.request<{ response: ApiSportsTeam[] }>(
      `/teams?league=${this.leagueId(league)}&season=${season}`
    );

    if (!response.response?.length) {
      return this.mock.getTeams(league);
    }

    return response.response
      .map((team) => this.mapTeam(team, league))
      .filter((team) => !["AFC", "NFC"].includes(team.name));
  }

  async getTeamSchedule(teamId: string, season: number): Promise<Game[]> {
    const parsed = this.parseTeamId(teamId);

    if (!parsed) {
      return this.mock.getTeamSchedule(teamId, season);
    }

    const apiSeason = season >= 2022 && season <= 2024 ? season : 2024;
    const response = await this.request<{
      errors?: unknown;
      response: ApiSportsGame[];
    }>(`/games?league=${this.leagueId(parsed.league)}&season=${apiSeason}&team=${parsed.id}`);

    if (!response.response?.length) {
      return this.syntheticSchedule(teamId, season, parsed.league);
    }

    return response.response
      .filter((game) => game.game.week?.toLowerCase().includes("week"))
      .map((game) => this.mapGame(game, parsed.league, season));
  }

  async getGame(gameId: string): Promise<Game | null> {
    const id = gameId.replace("api-sports-game-", "");
    const response = await this.request<{ response: ApiSportsGame[] }>(`/games?id=${id}`);
    const game = response.response?.[0];

    if (!game) {
      return null;
    }

    const league = Number(game.league.season) ? this.leagueFromGame(game) : "NFL";
    return this.mapGame(game, league, Number(game.league.season));
  }

  private async request<T>(path: string): Promise<T> {
    const key = process.env.API_SPORTS_KEY;

    if (!key) {
      throw new Error("API_SPORTS_KEY is not configured.");
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "x-apisports-key": key
      },
      next: { revalidate: 60 * 60 }
    });

    if (!response.ok) {
      throw new Error(`API-SPORTS request failed with ${response.status}.`);
    }

    return response.json() as Promise<T>;
  }

  private leagueId(league: League) {
    return league === "NFL" ? 1 : 2;
  }

  private leaguePrefix(league: League) {
    return league.toLowerCase();
  }

  private mapTeam(team: ApiSportsTeam, league: League): Team {
    return withNormalizedShortName({
      id: `api-sports-${this.leaguePrefix(league)}-${team.id}`,
      league,
      name: team.name,
      shortName: team.code || team.name.split(" ").map((part) => part[0]).join("").slice(0, 4),
      logoUrl: team.logo ?? undefined
    });
  }

  private mapGame(game: ApiSportsGame, league: League, requestedSeason: number): Game {
    const kickoffAt = game.game.date.timestamp
      ? new Date(game.game.date.timestamp * 1000).toISOString()
      : new Date(`${game.game.date.date}T${game.game.date.time ?? "12:00"}:00Z`).toISOString();

    return {
      id: `api-sports-game-${game.game.id}`,
      league,
      season: requestedSeason,
      week: this.weekNumber(game.game.week),
      kickoffAt,
      status: game.game.status.short === "FT" ? "FINAL" : game.game.status.short === "NS" ? "SCHEDULED" : "LIVE",
      homeTeam: withNormalizedShortName({
        id: `api-sports-${this.leaguePrefix(league)}-${game.teams.home.id}`,
        league,
        name: game.teams.home.name,
        shortName: this.shortName(game.teams.home.name),
        logoUrl: game.teams.home.logo ?? undefined
      }),
      awayTeam: withNormalizedShortName({
        id: `api-sports-${this.leaguePrefix(league)}-${game.teams.away.id}`,
        league,
        name: game.teams.away.name,
        shortName: this.shortName(game.teams.away.name),
        logoUrl: game.teams.away.logo ?? undefined
      }),
      scores: game.scores
        ? {
            q1: this.scorePair(game.scores.home?.quarter_1, game.scores.away?.quarter_1),
            q2: this.scorePair(game.scores.home?.quarter_2, game.scores.away?.quarter_2),
            q3: this.scorePair(game.scores.home?.quarter_3, game.scores.away?.quarter_3),
            final: this.scorePair(game.scores.home?.total, game.scores.away?.total)
          }
        : undefined
    };
  }

  private async syntheticSchedule(teamId: string, season: number, league: League): Promise<Game[]> {
    const teams = await this.getTeams(league);
    const team = teams.find((candidate) => candidate.id === teamId);

    if (!team) {
      return [];
    }

    const opponents = teams.filter((candidate) => candidate.id !== teamId);
    const gameCount = league === "NFL" ? 17 : 12;

    return Array.from({ length: gameCount }, (_, index) => {
      const opponent = opponents[index % opponents.length];
      const isHome = index % 2 === 0;
      const kickoff = new Date(Date.UTC(season, 8, 7 + index * 7, 18, 30));

      return {
        id: `synthetic-${team.id}-${season}-${index + 1}`,
        league,
        season,
        week: index + 1,
        kickoffAt: kickoff.toISOString(),
        status: "SCHEDULED",
        homeTeam: isHome ? team : opponent,
        awayTeam: isHome ? opponent : team
      };
    });
  }

  private parseTeamId(teamId: string) {
    const match = teamId.match(/^api-sports-(nfl|ncaa)-(\d+)$/);

    if (!match) {
      return null;
    }

    return {
      league: match[1] === "nfl" ? ("NFL" as const) : ("NCAA" as const),
      id: Number(match[2])
    };
  }

  private weekNumber(value?: string) {
    const match = value?.match(/(\d+)/);
    return match ? Number(match[1]) : 1;
  }

  private shortName(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 4)
      .toUpperCase();
  }

  private scorePair(home?: number | null, away?: number | null): [number, number] | undefined {
    return typeof home === "number" && typeof away === "number" ? [home, away] : undefined;
  }

  private leagueFromGame(game: ApiSportsGame): League {
    return game.league.season ? "NFL" : "NFL";
  }
}

export function getSportsProvider(): SportsProvider {
  if (process.env.SPORTS_PROVIDER === "api-sports") {
    return new ApiSportsProvider();
  }

  return new MockSportsProvider();
}
