import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { bookingContent } from "@/content/booking";
import { BookingPage } from "@/components/booking/BookingPage";

type Props = { params: Promise<{ hostSlug: string; eventTypeSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { hostSlug, eventTypeSlug } = await params;
  const host = await prisma.user.findUnique({ where: { slug: hostSlug } });
  const et = host
    ? await prisma.eventType.findFirst({
        where: { hostId: host.id, slug: eventTypeSlug, isActive: true },
      })
    : null;
  if (!host || !et) return {};
  return { title: `${et.name} · ${host.name ?? hostSlug} · meetflow` };
}

export default async function BookingPageRoute({ params }: Props) {
  const { hostSlug, eventTypeSlug } = await params;

  const host = await prisma.user.findUnique({
    where: { slug: hostSlug },
    include: {
      availabilities: true,
      eventTypes: {
        where: { slug: eventTypeSlug, isActive: true },
        take: 1,
      },
    },
  });

  if (!host || !host.eventTypes[0]) notFound();

  const eventType = host.eventTypes[0];

  // Serialize: strip DB-only fields, keep only what the client needs
  const hostData = {
    slug: host.slug,
    timezone: host.timezone,
    bufferMinutes: host.bufferMinutes,
    bookingWindowDays: host.bookingWindowDays,
    availabilities: host.availabilities.map((a) => ({ dayOfWeek: a.dayOfWeek })),
  };

  const eventTypeData = {
    slug: eventType.slug,
    name: eventType.name,
    durationMinutes: eventType.durationMinutes,
    description: eventType.description,
    color: eventType.color,
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-xl px-4 py-12">
        {/* Event type header */}
        <div className="mb-8">
          <p className="text-sm text-zinc-500">{host.name}</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">{eventType.name}</h1>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
            <Clock className="h-4 w-4" />
            <span>{eventType.durationMinutes} min</span>
          </div>
          {eventType.description && (
            <p className="mt-2 text-sm text-zinc-500">{eventType.description}</p>
          )}
        </div>

        {/* Client booking flow — receives full content parser as prop */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <BookingPage
            content={bookingContent}
            host={hostData}
            eventType={eventTypeData}
          />
        </div>
      </div>
    </div>
  );
}
