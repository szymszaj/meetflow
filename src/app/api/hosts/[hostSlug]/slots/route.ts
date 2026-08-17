import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/slots";
import { BookingStatus } from "@prisma/client";
import { addDays, subMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

const querySchema = z.object({
  eventTypeSlug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  timezone: z.string().min(1),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hostSlug: string }> },
) {
  const { hostSlug } = await params;

  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { eventTypeSlug, date, timezone } = parsed.data;

  if (!isValidTimezone(timezone)) {
    return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
  }

  const host = await prisma.user.findUnique({
    where: { slug: hostSlug },
    include: {
      availabilities: true,
      availabilityExceptions: true,
      eventTypes: {
        where: { slug: eventTypeSlug, isActive: true },
        take: 1,
      },
    },
  });

  if (!host) {
    return NextResponse.json({ error: "Host not found" }, { status: 404 });
  }

  const eventType = host.eventTypes[0];
  if (!eventType) {
    return NextResponse.json(
      { error: "Event type not found" },
      { status: 404 },
    );
  }

  const guestDayStart = fromZonedTime(`${date}T00:00:00`, timezone);
  const searchStart = subMinutes(guestDayStart, 14 * 60); // 14 h before
  const searchEnd = addDays(guestDayStart, 2); // 2 days after

  const existingBookings = await prisma.booking.findMany({
    where: {
      hostId: host.id,
      status: BookingStatus.CONFIRMED,
      startTime: { gte: searchStart, lte: searchEnd },
    },
    select: { startTime: true, endTime: true },
  });

  const slots = generateAvailableSlots({
    host: {
      timezone: host.timezone,
      bufferMinutes: host.bufferMinutes,
      bookingWindowDays: host.bookingWindowDays,
      availabilities: host.availabilities,
      availabilityExceptions: host.availabilityExceptions,
    },
    durationMinutes: eventType.durationMinutes,
    dateStr: date,
    guestTimezone: timezone,
    existingBookings,
  });

  return NextResponse.json({
    hostTimezone: host.timezone,
    durationMinutes: eventType.durationMinutes,
    bufferMinutes: host.bufferMinutes,
    slots,
  });
}

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
