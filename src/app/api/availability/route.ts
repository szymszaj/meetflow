import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DayOfWeek } from "@prisma/client";

const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;

const rowSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: z.string().regex(timeRe),
  endTime: z.string().regex(timeRe),
});

const bodySchema = z.array(rowSchema);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const availabilities = await prisma.availability.findMany({
    where: { hostId: session.user.id },
  });
  return NextResponse.json(availabilities);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const hostId = session.user.id;

  // Replace all availability rows atomically
  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { hostId } }),
    ...parsed.data.map((row) =>
      prisma.availability.create({ data: { ...row, hostId } }),
    ),
  ]);

  const updated = await prisma.availability.findMany({ where: { hostId } });
  return NextResponse.json(updated);
}
