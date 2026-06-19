import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in as the host to archive this board." }, { status: 401 });
  }

  const { id } = await params;
  const board = await prisma.board.findUnique({
    where: { id },
    select: {
      hostId: true,
      archivedAt: true
    }
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  if (board.hostId !== user.id) {
    return NextResponse.json({ error: "Only this board's host can archive it." }, { status: 403 });
  }

  if (board.archivedAt) {
    return NextResponse.json({ ok: true, archived: true });
  }

  await prisma.board.update({
    where: { id },
    data: { archivedAt: new Date() }
  });

  return NextResponse.json({ ok: true, archived: true });
}
