import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: "Enter a valid name, email, and password." }, { status: 400 });
  }

  try {
    const { name, email, password } = result.data;
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash
      }
    });

    await setSessionCookie(user.id);

    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Account database is not available. Check DATABASE_URL and run Prisma migrations." },
      { status: 503 }
    );
  }
}
