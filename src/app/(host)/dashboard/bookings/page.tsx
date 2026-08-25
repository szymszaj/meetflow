import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dashboardContent } from "@/content/dashboard";
import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@prisma/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default async function BookingsPage() {
  const session = await auth();
  const { bookings: c } = dashboardContent;

  const allBookings = await prisma.booking.findMany({
    where: { hostId: session!.user!.id },
    orderBy: { startTime: "desc" },
    include: { eventType: { select: { name: true } } },
  });

  const statusVariant = {
    [BookingStatus.CONFIRMED]: "success",
    [BookingStatus.CANCELLED]: "destructive",
    [BookingStatus.RESCHEDULED]: "warning",
  } as const;

  const statusLabel = {
    [BookingStatus.CONFIRMED]: c.statusConfirmed,
    [BookingStatus.CANCELLED]: c.statusCancelled,
    [BookingStatus.RESCHEDULED]: c.statusRescheduled,
  };

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">{c.heading}</h1>

      {allBookings.length === 0 ? (
        <p className="text-sm text-zinc-400">{c.empty}</p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-100">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                {[c.columns.guest, c.columns.event, c.columns.date, c.columns.status].map((h) => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {allBookings.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{b.guestName}</p>
                    <p className="text-xs text-zinc-400">{b.guestEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{b.eventType.name}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {format(b.startTime, "d MMM yyyy, HH:mm", { locale: pl })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[b.status]}>
                      {statusLabel[b.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
