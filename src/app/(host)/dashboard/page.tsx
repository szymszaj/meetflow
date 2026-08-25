import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dashboardContent } from "@/content/dashboard";
import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@prisma/client";
import { addDays, startOfWeek, endOfWeek } from "date-fns";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await auth();
  const { overview } = dashboardContent;

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [upcoming, thisWeekCount, totalCount] = await Promise.all([
    prisma.booking.findMany({
      where: {
        hostId: session!.user!.id,
        status: BookingStatus.CONFIRMED,
        startTime: { gte: now },
      },
      orderBy: { startTime: "asc" },
      take: 5,
      include: { eventType: { select: { name: true } } },
    }),
    prisma.booking.count({
      where: {
        hostId: session!.user!.id,
        status: BookingStatus.CONFIRMED,
        startTime: { gte: weekStart, lte: weekEnd },
      },
    }),
    prisma.booking.count({
      where: { hostId: session!.user!.id, status: BookingStatus.CONFIRMED },
    }),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: { name: true },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-zinc-900">
        {overview.heading}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
      </h1>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: overview.stats.upcoming, value: upcoming.length },
          { label: overview.stats.thisWeek, value: thisWeekCount },
          { label: overview.stats.total, value: totalCount },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">{overview.upcomingHeading}</h2>
          <Link href="/dashboard/bookings" className="text-sm text-indigo-600 hover:underline">
            {overview.viewAll}
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="text-sm text-zinc-400">{overview.emptyUpcoming}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-zinc-100">
                <div>
                  <p className="font-medium text-zinc-900">{b.guestName}</p>
                  <p className="text-sm text-zinc-500">{b.eventType.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-700">
                    {format(b.startTime, "d MMM", { locale: pl })}
                  </p>
                  <p className="text-xs text-zinc-400">{format(b.startTime, "HH:mm")}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
