import type { BoardCardData } from "./board-card-types";
import type { BoardVisibility, Game } from "./types";

export type BoardDetailData = BoardCardData & {
  visibility: BoardVisibility;
  isHost: boolean;
  hostName: string;
  maxSquaresPerBuyer?: number;
  payouts: {
    q1: number;
    q2: number;
    q3: number;
    final: number;
  };
  paymentSummary: {
    receivedCents: number;
    owedCents: number;
  };
  nextGame: Game;
  selectedGameId: string;
  gameSnapshots: Array<{
    gameId: string;
    week: number;
    kickoffAt: string;
    matchup: string;
    hasLockedDigits: boolean;
    isFinal: boolean;
  }>;
  digits?: {
    homeDigits: number[];
    awayDigits: number[];
  };
  winners: Array<{
    quarter: "Q1" | "Q2" | "Q3" | "Final";
    payoutCents: number;
    homeScore: number;
    awayScore: number;
    row: number;
    column: number;
    ownerName?: string;
  }>;
  ownedSquares: Array<{
    row: number;
    column: number;
    ownerName: string;
    paymentStatus: "RESERVED" | "PAID" | "CANCELED" | "REFUNDED";
  }>;
  reservations: Array<{
    id: string;
    name: string;
    amountDueCents: number;
    status: "RESERVED" | "PAID" | "CANCELED" | "REFUNDED";
    squares: Array<{
      row: number;
      column: number;
    }>;
  }>;
};
