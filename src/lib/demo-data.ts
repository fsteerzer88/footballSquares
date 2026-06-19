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
    boardNumber: "100001",
    title: "12U Baseball Chiefs Squares",
    fundraiserName: "Northside 12U Baseball",
    league: "NFL",
    mode: "SINGLE_GAME",
    visibility: "PUBLIC",
    isHost: false,
    hostName: "Northside Booster Club",
    status: "OPEN",
    teamName: "Kansas City Chiefs",
    pricePerSquareCents: 2000,
    maxSquaresPerBuyer: 10,
    soldSquares: 63,
    payouts: { q1: 15000, q2: 25000, q3: 15000, final: 35000 },
    paymentSummary: { receivedCents: 0, owedCents: 126000 },
    reservations: [
      {
        id: "demo-reservation-1",
        name: "Jamie L.",
        amountDueCents: 2000,
        status: "PAID",
        squares: [{ row: 0, column: 0 }]
      },
      {
        id: "demo-reservation-2",
        name: "Morgan R.",
        amountDueCents: 2000,
        status: "RESERVED",
        squares: [{ row: 0, column: 1 }]
      }
    ],
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
    },
    selectedGameId: "demo-kc-phi",
    gameSnapshots: [
      {
        gameId: "demo-kc-phi",
        week: 3,
        kickoffAt: "2026-09-20T20:25:00.000Z",
        matchup: "PHI at KC",
        hasLockedDigits: false,
        isFinal: false
      }
    ],
    winners: []
  },
  {
    id: "board-uga-season",
    boardNumber: "100002",
    title: "Bulldogs Season Booster Board",
    fundraiserName: "West County Soccer Club",
    league: "NCAA",
    mode: "SEASON",
    visibility: "CODE_PROTECTED",
    isHost: false,
    hostName: "West County Soccer Club",
    status: "OPEN",
    teamName: "Georgia Bulldogs",
    pricePerSquareCents: 10000,
    maxSquaresPerBuyer: 4,
    soldSquares: 48,
    payouts: { q1: 5000, q2: 10000, q3: 5000, final: 20000 },
    paymentSummary: { receivedCents: 10000, owedCents: 470000 },
    reservations: [
      {
        id: "demo-season-reservation-1",
        name: "Jamie L.",
        amountDueCents: 10000,
        status: "PAID",
        squares: [{ row: 0, column: 0 }]
      },
      {
        id: "demo-season-reservation-2",
        name: "Morgan R.",
        amountDueCents: 10000,
        status: "RESERVED",
        squares: [{ row: 0, column: 1 }]
      }
    ],
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
    selectedGameId: "demo-uga-tex",
    gameSnapshots: [
      {
        gameId: "demo-uga-tex",
        week: 1,
        kickoffAt: "2026-09-05T19:30:00.000Z",
        matchup: "TEX at UGA",
        hasLockedDigits: true,
        isFinal: false
      }
    ],
    digits: createDigitSet(() => 0.42),
    winners: []
  }
];
