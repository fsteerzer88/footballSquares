export type League = "NFL" | "NCAA";
export type BoardMode = "SINGLE_GAME" | "SEASON";
export type BoardVisibility = "PUBLIC" | "CODE_PROTECTED";
export type BoardStatus = "DRAFT" | "OPEN" | "CLOSED" | "FINAL";

export type Team = {
  id: string;
  league: League;
  name: string;
  shortName: string;
  logoUrl?: string;
};

export type Game = {
  id: string;
  league: League;
  season: number;
  week: number;
  kickoffAt: string;
  status: "SCHEDULED" | "LIVE" | "FINAL";
  homeTeam: Team;
  awayTeam: Team;
  scores?: {
    q1?: [number, number];
    q2?: [number, number];
    q3?: [number, number];
    final?: [number, number];
  };
};

export type BoardFormInput = {
  title: string;
  fundraiserName: string;
  league: League;
  mode: BoardMode;
  visibility: BoardVisibility;
  teamId: string;
  gameIds: string[];
  pricePerSquare: number;
  maxSquaresPerBuyer?: number;
  payouts: {
    q1: number;
    q2: number;
    q3: number;
    final: number;
  };
};
