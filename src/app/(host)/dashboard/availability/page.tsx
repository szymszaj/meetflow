import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dashboardContent } from "@/content/dashboard";
import { AvailabilityForm } from "@/components/host/AvailabilityForm";

export default async function AvailabilityPage() {
  const session = await auth();

  const [availabilities, exceptions] = await Promise.all([
    prisma.availability.findMany({ where: { hostId: session!.user!.id } }),
    prisma.availabilityException.findMany({
      where: { hostId: session!.user!.id },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <AvailabilityForm
      content={dashboardContent.availability}
      initialAvailability={availabilities.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      }))}
      initialExceptions={exceptions.map((e) => ({
        id: e.id,
        date: e.date,
        type: e.type,
        customStart: e.customStart,
        customEnd: e.customEnd,
      }))}
    />
  );
}
