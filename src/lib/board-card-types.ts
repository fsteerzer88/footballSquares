import type { BoardMode, BoardStatus, BoardVisibility, League } from "./types";

export type BoardCardData = {
  id: string;
  boardNumber: string;
  title: string;
  fundraiserName: string;
  league: League;
  mode: BoardMode;
  visibility?: BoardVisibility;
  status: BoardStatus;
  teamName: string;
  accessCode?: string;
  pricePerSquareCents: number;
  soldSquares: number;
};
