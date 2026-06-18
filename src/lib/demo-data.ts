import { createDigitSet } from "./board-rules";
import type { BoardDetailData } from "./board-detail-types";
import type { BoardMode, BoardVisibility, Game, League } from "./types";

export type DemoBoard = BoardDetailData & {
  id: string;
  title: string;
  fundraiserName: string;
  league: League;
  mode: BoardMode;
  visibility: BoardVisibility;
  status: "OPEN" | "CLOSED";
  teamName: string;
  pricePerSquareCents: number;
  maxSquaresPerBuyer?: number;
  soldSquares: number;
  payouts: {
    q1: number;
    q2: number;
    q3: number;
    final: number;
  };
  nextGame: Game;
  digits?: {
    homeDigits: number[];
    awayDigits: number[];
  };
};

const chiefs = { id: "nfl-kc", league: "NFL" as const, name: "Kansas City Chiefs", shortName: "KC" };
const eagles = { id: "nfl-phi", league: "NFL" as const, name: "Philadelphia Eagles", shortName: "PHI" };
const georgia = { id: "ncaa-uga", league: "NCAA" as const, name: "Georgia Bulldogs", shortName: "UGA" };
const texas = { id: "ncaa-tex", league: "NCAA" as const, name: "Texas Longhorns", shortName: "TEX" };

export const demoBoards: DemoBoard[] = [
  {
    id: "board-kc-youth",
    title: "12U Baseball Chiefs Squares",
    fundraiserName: "Northside 12U Baseball",
    league: "NFL",
    mode: "SINGLE_GAME",
    visibility: "PUBLIC",
    isHost: false,
    status: "OPEN",
    teamName: "Kansas City Chiefs",
    pricePerSquareCents: 2000,
    maxSquaresPerBuyer: 10,
    soldSquares: 63,
    payouts: { q1: 15000, q2: 25000, q3: 15000, final: 35000 },
    paymentSummary: { receivedCents: 0, owedCents: 126000 },
    ownedSquares: [
      { row: 0, column: 0, ownerName: "Jamie L.", paymentStatus: "PAID" },
      { row: 0, column: 1, ownerName: "Morgan R.", paymentStatus: "RESERVED" },
      { row: 1, column: 3, ownerName: "Taylor S.", paymentStatus: "RESERVED" },
      { row: 2, column: 2, ownerName: "Chris P.", paymentStatus: "RESERVED" },
      { row: 3, column: 6, ownerName: "Avery M.", paymentStatus: "RESERVED" },
      { row: 4, column: 4, ownerName: "Jordan K.", paymentStatus: "RESERVED" },
      { row: 5, column: 8, ownerName: "Casey D.", paymentStatus: "RESERVED" },
      { row: 7, column: 7, ownerName: "Riley T.", paymentStatus: "RESERVED" },
      { row: 8, column: 1, ownerName: "Sam N.", paymentStatus: "RESERVED" },
      { row: 9, column: 9, ownerName: "Pat W.", paymentStatus: "RESERVED" }
    ],
    nextGame: {
      id: "demo-kc-phi",
      league: "NFL",
      season: 2026,
      week: 3,
      kickoffAt: "2026-09-20T20:25:00.000Z",
      status: "SCHEDULED",
      homeTeam: chiefs,
      awayTeam: eagles
    }
  },
  {
    id: "board-uga-season",
    title: "Bulldogs Season Booster Board",
    fundraiserName: "West County Soccer Club",
    league: "NCAA",
    mode: "SEASON",
    visibility: "CODE_PROTECTED",
    isHost: false,
    status: "OPEN",
    teamName: "Georgia Bulldogs",
    pricePerSquareCents: 10000,
    maxSquaresPerBuyer: 4,
    soldSquares: 48,
    payouts: { q1: 5000, q2: 10000, q3: 5000, final: 20000 },
    paymentSummary: { receivedCents: 10000, owedCents: 470000 },
    ownedSquares: [
      { row: 0, column: 0, ownerName: "Jamie L.", paymentStatus: "PAID" },
      { row: 0, column: 1, ownerName: "Morgan R.", paymentStatus: "RESERVED" }
    ],
    nextGame: {
      id: "demo-uga-tex",
      league: "NCAA",
      season: 2026,
      week: 1,
      kickoffAt: "2026-09-05T19:30:00.000Z",
      status: "SCHEDULED",
      homeTeam: georgia,
      awayTeam: texas
    },
    digits: createDigitSet(() => 0.42)
  }
];
