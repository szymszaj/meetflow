import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { bookingManagementContent } from "@/content/booking-management";
import { BookingManagement } from "@/components/booking-management/BookingManagement";
import { BookingStatus } from "@prisma/client";

type Props = { params: Promise<{ token: string }> };

export default async function BookingManagementPage({ params }: Props) {
  const { token } = await params;
  const { notFound: nf, ...rest } = bookingManagementContent;

  const booking = await prisma.booking.findFirst({
    where: { token, status: BookingStatus.CONFIRMED },
    include: {
      eventType: { select: { slug: true, name: true, durationMinutes: true } },
      host: {
        select: {
          slug: true,
          name: true,
          timezone: true,
          bookingWindowDays: true,
          availabilities: { select: { dayOfWeek: true } },
        },
      },
    },
  });

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-900">{nf.heading}</h1>
          <p className="mt-2 text-sm text-zinc-500">{nf.description}</p>
          <Link href="/" className="mt-6 inline-block text-sm text-indigo-600 hover:underline">
            {nf.homeLink}
          </Link>
        </div>
      </div>
    );
  }

  // Serialize dates for client component
  const bookingData = {
    token: booking.token,
    eventName: booking.eventType.name,
    hostName: booking.host.name,
    guestName: booking.guestName,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    status: booking.status,
  };

  const hostMeta = {
    timezone: booking.host.timezone,
    bookingWindowDays: booking.host.bookingWindowDays,
    availabilities: booking.host.availabilities,
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          {/* Page receives full parser — all strings come from content */}
          <BookingManagement
            content={rest}
            booking={bookingData}
            hostMeta={hostMeta}
            hostSlug={booking.host.slug}
            eventTypeSlug={booking.eventType.slug}
          />
        </div>
      </div>
    </div>
  );
}
