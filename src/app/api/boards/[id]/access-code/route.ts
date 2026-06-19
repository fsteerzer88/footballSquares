import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { normalizeBoardCode } from "@/lib/board-access";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  accessCode: z.string().trim().min(4).max(64)
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to update a board code." }, { status: 401 });
  }

  const { id } = await params;
  const result = schema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: "Enter an access code with at least 4 characters." }, { status: 400 });
  }

  const board = await prisma.board.findUnique({
    where: { id },
    select: {
      hostId: true,
      status: true
    }
  });

  if (!board) {
    return NextResponse.json({ error: "Board was not found." }, { status: 404 });
  }

  if (board.hostId !== user.id) {
    return NextResponse.json({ error: "Only this board's host can update the access code." }, { status: 403 });
  }

  if (board.status !== "OPEN") {
    return NextResponse.json({ error: "This board is locked and cannot be changed." }, { status: 409 });
  }

  const accessCode = normalizeBoardCode(result.data.accessCode);

  try {
    await prisma.board.update({
      where: { id },
      data: {
        visibility: "CODE_PROTECTED",
        accessCodeLookup: accessCode,
        accessCodeHash: await hashPassword(result.data.accessCode)
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That access code is already being used by another board." }, { status: 409 });
    }

    throw error;
  }

  return NextResponse.json({ accessCode });
}
