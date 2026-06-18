import type { BoardCardData } from "./board-card-types";
import type { BoardVisibility, Game } from "./types";

export type BoardDetailData = BoardCardData & {
  visibility: BoardVisibility;
  isHost: boolean;
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
  digits?: {
    homeDigits: number[];
    awayDigits: number[];
  };
  ownedSquares: Array<{
    row: number;
    column: number;
    ownerName: string;
    paymentStatus: "RESERVED" | "PAID" | "CANCELED" | "REFUNDED";
  }>;
};
