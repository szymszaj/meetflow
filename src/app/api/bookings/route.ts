import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes, subMinutes, isAfter, addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/slots";
import { sendBookingConfirmations } from "@/lib/mail";
import { BookingStatus } from "@prisma/client";

const bodySchema = z.object({
  hostSlug: z.string().min(1),
  eventTypeSlug: z.string().min(1),
  startTime: z.string().datetime(), // ISO-8601 UTC
  guestName: z.string().min(1).max(100),
  guestEmail: z.string().email(),
  guestTimezone: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (!isValidTimezone(parsed.data.guestTimezone)) {
    return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
  }

  const {
    hostSlug,
    eventTypeSlug,
    startTime: startIso,
    guestName,
    guestEmail,
    guestTimezone,
    notes,
  } = parsed.data;
  const startTime = new Date(startIso);

  if (!isAfter(startTime, new Date())) {
    return NextResponse.json({ error: "Slot is in the past" }, { status: 409 });
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

  const endTime = addMinutes(startTime, eventType.durationMinutes);

  if (isAfter(startTime, addDays(new Date(), host.bookingWindowDays))) {
    return NextResponse.json(
      { error: "Slot is outside booking window" },
      { status: 409 },
    );
  }

  const existingBookings = await prisma.booking.findMany({
    where: {
      hostId: host.id,
      status: BookingStatus.CONFIRMED,
      startTime: {
        gte: subMinutes(startTime, 14 * 60),
        lte: addDays(startTime, 1),
      },
    },
    select: { startTime: true, endTime: true },
  });

  const dateStr = startTime.toISOString().slice(0, 10);
  const availableSlots = generateAvailableSlots({
    host: {
      timezone: host.timezone,
      bufferMinutes: host.bufferMinutes,
      bookingWindowDays: host.bookingWindowDays,
      availabilities: host.availabilities,
      availabilityExceptions: host.availabilityExceptions,
    },
    durationMinutes: eventType.durationMinutes,
    dateStr,
    guestTimezone,
    existingBookings,
  });

  const isValidSlot = availableSlots.some(
    (s) => new Date(s.startUtc).getTime() === startTime.getTime(),
  );

  if (!isValidSlot) {
    return NextResponse.json({ error: "Slot not available" }, { status: 409 });
  }

  let booking;
  try {
    booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          hostId: host.id,
          status: BookingStatus.CONFIRMED,
          // Overlap condition including buffer on both sides
          startTime: { lt: addMinutes(endTime, host.bufferMinutes) },
          endTime: { gt: subMinutes(startTime, host.bufferMinutes) },
        },
      });

      if (conflict) {
        throw new SlotTakenError();
      }

      return tx.booking.create({
        data: {
          hostId: host.id,
          eventTypeId: eventType.id,
          guestName,
          guestEmail,
          guestTimezone,
          notes,
          startTime,
          endTime,
        },
      });
    });
  } catch (err) {
    if (err instanceof SlotTakenError || isPrismaUnique(err)) {
      return NextResponse.json(
        { error: "Slot is no longer available" },
        { status: 409 },
      );
    }
    throw err;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  sendBookingConfirmations({
    guestName,
    guestEmail,
    hostName: host.name ?? host.email,
    hostEmail: host.email,
    eventName: eventType.name,
    startTime,
    endTime,
    guestTimezone,
    hostTimezone: host.timezone,
    durationMinutes: eventType.durationMinutes,
    cancelUrl: `${appUrl}/booking/${booking.token}?action=cancel`,
    rescheduleUrl: `${appUrl}/booking/${booking.token}`,
  }).catch(console.error);

  return NextResponse.json(
    {
      token: booking.token,
      startTime: booking.startTime,
      endTime: booking.endTime,
    },
    { status: 201 },
  );
}

class SlotTakenError extends Error {}

function isPrismaUnique(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  );
}

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
