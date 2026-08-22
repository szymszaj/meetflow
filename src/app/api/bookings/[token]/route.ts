import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes, subMinutes, isAfter, addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/slots";
import { sendCancellationEmail } from "@/lib/mail";
import { BookingStatus } from "@prisma/client";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const booking = await findActiveBooking(token);
  if (!booking) return notFound();

  return NextResponse.json(serializeBooking(booking));
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const booking = await findActiveBooking(token);
  if (!booking) return notFound();

  const cancelled = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
  });

  sendCancellationEmail({
    guestName: cancelled.guestName,
    guestEmail: cancelled.guestEmail,
    eventName: booking.eventType.name,
    hostName: booking.host.name ?? booking.host.email,
    startTime: cancelled.startTime,
    guestTimezone: cancelled.guestTimezone,
  }).catch(console.error);

  return NextResponse.json({ status: "cancelled" });
}

const rescheduleSchema = z.object({
  startTime: z.string().datetime(),
});

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { token } = await params;

  const parsed = rescheduleSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const booking = await findActiveBooking(token);
  if (!booking) return notFound();

  const newStartTime = new Date(parsed.data.startTime);
  const { host, eventType } = booking;

  if (!isAfter(newStartTime, new Date())) {
    return NextResponse.json(
      { error: "New slot is in the past" },
      { status: 409 },
    );
  }

  if (isAfter(newStartTime, addDays(new Date(), host.bookingWindowDays))) {
    return NextResponse.json(
      { error: "Slot is outside booking window" },
      { status: 409 },
    );
  }

  const newEndTime = addMinutes(newStartTime, eventType.durationMinutes);

  const existingBookings = await prisma.booking.findMany({
    where: {
      hostId: host.id,
      status: BookingStatus.CONFIRMED,
      id: { not: booking.id },
      startTime: {
        gte: subMinutes(newStartTime, 14 * 60),
        lte: addDays(newStartTime, 1),
      },
    },
    select: { startTime: true, endTime: true },
  });

  const dateStr = newStartTime.toISOString().slice(0, 10);
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
    guestTimezone: booking.guestTimezone,
    existingBookings,
  });

  const isValidSlot = availableSlots.some(
    (s) => new Date(s.startUtc).getTime() === newStartTime.getTime(),
  );

  if (!isValidSlot) {
    return NextResponse.json({ error: "Slot not available" }, { status: 409 });
  }

  let updated;
  try {
    updated = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          hostId: host.id,
          status: BookingStatus.CONFIRMED,
          id: { not: booking.id },
          startTime: { lt: addMinutes(newEndTime, host.bufferMinutes) },
          endTime: { gt: subMinutes(newStartTime, host.bufferMinutes) },
        },
      });

      if (conflict) throw new SlotTakenError();

      return tx.booking.update({
        where: { id: booking.id },
        data: { startTime: newStartTime, endTime: newEndTime },
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

  return NextResponse.json(serializeBooking({ ...booking, ...updated }));
}

async function findActiveBooking(token: string) {
  return prisma.booking.findFirst({
    where: { token, status: BookingStatus.CONFIRMED },
    include: {
      eventType: { select: { name: true, durationMinutes: true } },
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          timezone: true,
          bufferMinutes: true,
          bookingWindowDays: true,
          availabilities: true,
          availabilityExceptions: true,
        },
      },
    },
  });
}

function serializeBooking(
  booking: NonNullable<Awaited<ReturnType<typeof findActiveBooking>>>,
) {
  return {
    token: booking.token,
    eventName: booking.eventType.name,
    hostName: booking.host.name,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
  };
}

function notFound() {
  return NextResponse.json({ error: "Booking not found" }, { status: 404 });
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
