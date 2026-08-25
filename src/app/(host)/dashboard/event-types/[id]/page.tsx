import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dashboardContent } from "@/content/dashboard";
import { EventTypeForm } from "@/components/host/EventTypeForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditEventTypePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const et = await prisma.eventType.findFirst({
    where: { id, hostId: session!.user!.id },
  });

  if (!et) notFound();

  return (
    <EventTypeForm
      content={dashboardContent.eventTypeForm}
      existing={{
        id: et.id,
        name: et.name,
        slug: et.slug,
        description: et.description,
        durationMinutes: et.durationMinutes,
        color: et.color,
      }}
    />
  );
}
