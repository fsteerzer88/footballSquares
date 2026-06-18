import type { BoardMode, BoardStatus, League } from "./types";

export type BoardCardData = {
  id: string;
  title: string;
  fundraiserName: string;
  league: League;
  mode: BoardMode;
  status: BoardStatus;
  teamName: string;
  pricePerSquareCents: number;
  soldSquares: number;
};
