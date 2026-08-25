import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExceptionType } from "@prisma/client";

const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.nativeEnum(ExceptionType),
  customStart: z.string().regex(timeRe).optional(),
  customEnd: z.string().regex(timeRe).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exceptions = await prisma.availabilityException.findMany({
    where: { hostId: session.user.id },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(exceptions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { date, type, customStart, customEnd } = parsed.data;

  if (type === ExceptionType.CUSTOM_HOURS && (!customStart || !customEnd)) {
    return NextResponse.json({ error: "customStart and customEnd required for CUSTOM_HOURS" }, { status: 400 });
  }

  const exception = await prisma.availabilityException.upsert({
    where: { hostId_date: { hostId: session.user.id, date: new Date(date) } },
    create: { hostId: session.user.id, date: new Date(date), type, customStart, customEnd },
    update: { type, customStart, customEnd },
  });

  return NextResponse.json(exception, { status: 201 });
}
