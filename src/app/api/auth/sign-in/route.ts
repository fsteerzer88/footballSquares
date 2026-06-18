import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email.toLowerCase() }
    });

    if (!user || !(await verifyPassword(result.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await setSessionCookie(user.id);

    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch {
    return NextResponse.json(
      { error: "Account database is not available. Check DATABASE_URL and run Prisma migrations." },
      { status: 503 }
    );
  }
}
