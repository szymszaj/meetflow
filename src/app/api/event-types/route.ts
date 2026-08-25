import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  durationMinutes: z.number().int().min(5).max(480),
  color: z.string().regex(/^#[0-9a-f]{6}$/i).default("#6366f1"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const eventTypes = await prisma.eventType.findMany({
    where: { hostId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(eventTypes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const existing = await prisma.eventType.findUnique({
    where: { hostId_slug: { hostId: session.user.id, slug: parsed.data.slug } },
  });
  if (existing) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });

  const et = await prisma.eventType.create({
    data: { ...parsed.data, hostId: session.user.id },
  });

  return NextResponse.json(et, { status: 201 });
}
