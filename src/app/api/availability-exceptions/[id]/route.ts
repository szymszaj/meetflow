import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ex = await prisma.availabilityException.findFirst({
    where: { id, hostId: session.user.id },
  });
  if (!ex) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.availabilityException.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
