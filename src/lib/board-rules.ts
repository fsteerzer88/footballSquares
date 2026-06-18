export const BOARD_SIZE = 10;
export const TOTAL_SQUARES = BOARD_SIZE * BOARD_SIZE;

export type SquareCoordinate = {
  row: number;
  column: number;
};

export type ScoreTuple = [home: number, away: number];

export function buildEmptySquares(): SquareCoordinate[] {
  return Array.from({ length: TOTAL_SQUARES }, (_, index) => ({
    row: Math.floor(index / BOARD_SIZE),
    column: index % BOARD_SIZE
  }));
}

export function validateSquareSelection(
  selected: SquareCoordinate[],
  ownedByBuyer: number,
  maxSquaresPerBuyer?: number
) {
  const unique = new Set(selected.map((square) => `${square.row}:${square.column}`));

  if (unique.size !== selected.length) {
    throw new Error("Duplicate squares are not allowed.");
  }

  for (const square of selected) {
    if (
      square.row < 0 ||
      square.row >= BOARD_SIZE ||
      square.column < 0 ||
      square.column >= BOARD_SIZE
    ) {
      throw new Error("Square coordinates must be inside the 10 by 10 board.");
    }
  }

  if (maxSquaresPerBuyer && ownedByBuyer + selected.length > maxSquaresPerBuyer) {
    throw new Error(`This board allows a maximum of ${maxSquaresPerBuyer} squares per buyer.`);
  }
}

export function shuffledDigits(random = Math.random): number[] {
  const digits = Array.from({ length: BOARD_SIZE }, (_, index) => index);

  for (let index = digits.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [digits[index], digits[swapIndex]] = [digits[swapIndex], digits[index]];
  }

  return digits;
}

export function createDigitSet(random = Math.random) {
  return {
    homeDigits: shuffledDigits(random),
    awayDigits: shuffledDigits(random)
  };
}

export function getWinningCoordinate(
  score: ScoreTuple,
  homeDigits: number[],
  awayDigits: number[]
): SquareCoordinate {
  const [homeScore, awayScore] = score;
  const homeLastDigit = homeScore % 10;
  const awayLastDigit = awayScore % 10;

  return {
    row: awayDigits.findIndex((digit) => digit === awayLastDigit),
    column: homeDigits.findIndex((digit) => digit === homeLastDigit)
  };
}
