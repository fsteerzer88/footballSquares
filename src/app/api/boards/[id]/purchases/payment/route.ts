import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  purchaseId: z.string().min(1),
  status: z.enum(["RESERVED", "PAID"])
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in as the host to update payment status." }, { status: 401 });
  }

  const { id } = await params;
  const result = schema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: "Choose a valid purchase and payment status." }, { status: 400 });
  }

  const board = await prisma.board.findUnique({
    where: { id },
    select: {
      hostId: true,
      status: true
    }
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  if (board.hostId !== user.id) {
    return NextResponse.json({ error: "Only the board host can update payment status." }, { status: 403 });
  }

  if (board.status !== "OPEN") {
    return NextResponse.json({ error: "This board is locked and cannot be changed." }, { status: 409 });
  }

  const purchase = await prisma.purchase.findFirst({
    where: {
      id: result.data.purchaseId,
      boardId: id
    },
    select: {
      id: true
    }
  });

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found." }, { status: 404 });
  }

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { status: result.data.status }
  });

  return NextResponse.json({ ok: true, status: result.data.status });
}
