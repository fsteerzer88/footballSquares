import { NextResponse } from "next/server";
import { z } from "zod";
import { validateSquareSelection } from "@/lib/board-rules";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  reservationName: z.string().trim().min(1).max(80).optional().or(z.literal("").transform(() => undefined)),
  squares: z.array(
    z.object({
      row: z.number().int(),
      column: z.number().int()
    })
  ).min(1)
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to reserve squares." }, { status: 401 });
  }

  const { id } = await params;
  const result = schema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: "Select at least one valid square." }, { status: 400 });
  }

  const selected = result.data.squares;
  const reservationName = result.data.reservationName ?? user.name;

  try {
    const purchase = await prisma.$transaction(async (tx) => {
      const board = await tx.board.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          pricePerSquareCents: true,
          maxSquaresPerBuyer: true
        }
      });

      if (!board) {
        throw new Error("BOARD_NOT_FOUND");
      }

      if (board.status !== "OPEN") {
        throw new Error("BOARD_NOT_OPEN");
      }

      const ownedByBuyer = await tx.square.count({
        where: {
          boardId: id,
          ownerId: user.id
        }
      });

      validateSquareSelection(selected, ownedByBuyer, board.maxSquaresPerBuyer ?? undefined);

      const selectedSquares = await tx.square.findMany({
        where: {
          boardId: id,
          OR: selected.map((square) => ({
            row: square.row,
            column: square.column
          }))
        },
        select: {
          id: true,
          ownerId: true
        }
      });

      if (selectedSquares.length !== selected.length) {
        throw new Error("SQUARE_NOT_FOUND");
      }

      if (selectedSquares.some((square) => square.ownerId)) {
        throw new Error("SQUARE_TAKEN");
      }

      const createdPurchase = await tx.purchase.create({
        data: {
          boardId: id,
          buyerId: user.id,
          amountDueCents: selected.length * board.pricePerSquareCents,
          reservedName: reservationName,
          squares: {
            connect: selectedSquares.map((square) => ({ id: square.id }))
          }
        }
      });

      await tx.square.updateMany({
        where: {
          id: { in: selectedSquares.map((square) => square.id) }
        },
        data: {
          ownerId: user.id,
          reservedName: reservationName,
          purchaseId: createdPurchase.id
        }
      });

      return createdPurchase;
    });

    return NextResponse.json({
      id: purchase.id,
      amountDueCents: purchase.amountDueCents,
      reservedName: purchase.reservedName,
      status: purchase.status
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "RESERVATION_FAILED";

    if (message === "BOARD_NOT_FOUND") {
      return NextResponse.json({ error: "Board not found." }, { status: 404 });
    }

    if (message === "BOARD_NOT_OPEN") {
      return NextResponse.json({ error: "This board is not open for reservations." }, { status: 409 });
    }

    if (message === "SQUARE_TAKEN") {
      return NextResponse.json({ error: "One or more selected squares were already reserved." }, { status: 409 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
