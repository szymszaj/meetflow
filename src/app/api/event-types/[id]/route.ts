import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).nullable().optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  isActive: z.boolean().optional(),
});

async function getOwned(id: string, userId: string) {
  return prisma.eventType.findFirst({ where: { id, hostId: userId } });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const et = await getOwned(id, session.user.id);
  if (!et) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const updated = await prisma.eventType.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const et = await getOwned(id, session.user.id);
  if (!et) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.eventType.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
