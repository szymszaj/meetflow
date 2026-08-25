import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/).optional(),
  timezone: z.string().min(1).optional(),
  bufferMinutes: z.number().int().min(0).max(120).optional(),
  bookingWindowDays: z.number().int().min(1).max(365).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { slug: true, timezone: true, bufferMinutes: true, bookingWindowDays: true },
  });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  if (parsed.data.slug) {
    const taken = await prisma.user.findFirst({
      where: { slug: parsed.data.slug, id: { not: session.user.id } },
    });
    if (taken) return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { slug: true, timezone: true, bufferMinutes: true, bookingWindowDays: true },
  });
  return NextResponse.json(updated);
}
