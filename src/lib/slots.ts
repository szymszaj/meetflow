import { DayOfWeek, ExceptionType } from "@prisma/client";
import {
  addDays,
  addMinutes,
  areIntervalsOverlapping,
  isAfter,
} from "date-fns";
import { format as tzFormat, fromZonedTime } from "date-fns-tz";

export type HostForSlots = {
  timezone: string;
  bufferMinutes: number;
  bookingWindowDays: number;
  availabilities: Array<{
    dayOfWeek: DayOfWeek;
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
  }>;
  availabilityExceptions: Array<{
    date: Date;
    type: ExceptionType;
    customStart: string | null;
    customEnd: string | null;
  }>;
};

export type ExistingBooking = {
  startTime: Date; // UTC
  endTime: Date; // UTC
};

export type TimeSlot = {
  startUtc: string; // ISO-8601 UTC
  endUtc: string;
  startLocal: string; // "HH:MM" in guest timezone
  endLocal: string;
};

export function generateAvailableSlots({
  host,
  durationMinutes,
  dateStr,
  guestTimezone,
  existingBookings,
}: {
  host: HostForSlots;
  durationMinutes: number;
  dateStr: string;
  guestTimezone: string;
  existingBookings: ExistingBooking[];
}): TimeSlot[] {
  const now = new Date();

  const guestDayStart = fromZonedTime(`${dateStr}T00:00:00`, guestTimezone);
  const nextDateStr = formatDateStr(addDays(guestDayStart, 1));
  const guestDayEnd = fromZonedTime(`${nextDateStr}T00:00:00`, guestTimezone);

  if (isAfter(guestDayStart, addDays(now, host.bookingWindowDays))) {
    return [];
  }

  const hostDateAtDayStart = tzFormat(guestDayStart, "yyyy-MM-dd", {
    timeZone: host.timezone,
  });
  const hostDateAtDayEnd = tzFormat(
    new Date(guestDayEnd.getTime() - 1),
    "yyyy-MM-dd",
    { timeZone: host.timezone },
  );

  const hostDatesToCheck = Array.from(
    new Set([hostDateAtDayStart, hostDateAtDayEnd]),
  );

  const candidates: Array<{ start: Date; end: Date }> = [];

  for (const hostDateStr of hostDatesToCheck) {
    const window = resolveAvailabilityWindow(host, hostDateStr);
    if (!window) continue;

    const windowStart = fromZonedTime(
      `${hostDateStr}T${window.startTime}:00`,
      host.timezone,
    );
    const windowEnd = fromZonedTime(
      `${hostDateStr}T${window.endTime}:00`,
      host.timezone,
    );

    let cursor = windowStart;
    while (addMinutes(cursor, durationMinutes) <= windowEnd) {
      candidates.push({
        start: cursor,
        end: addMinutes(cursor, durationMinutes),
      });
      cursor = addMinutes(cursor, durationMinutes);
    }
  }

  return candidates
    .filter((slot) => {
      if (slot.start < guestDayStart || slot.start >= guestDayEnd) return false;
      if (!isAfter(slot.start, now)) return false;
      return !existingBookings.some((booking) =>
        areIntervalsOverlapping(
          { start: slot.start, end: slot.end },
          {
            start: booking.startTime,
            end: addMinutes(booking.endTime, host.bufferMinutes),
          },
          { inclusive: false },
        ),
      );
    })
    .map((slot) => ({
      startUtc: slot.start.toISOString(),
      endUtc: slot.end.toISOString(),
      startLocal: tzFormat(slot.start, "HH:mm", { timeZone: guestTimezone }),
      endLocal: tzFormat(slot.end, "HH:mm", { timeZone: guestTimezone }),
    }));
}

const JS_DAY_TO_ENUM: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

function resolveAvailabilityWindow(
  host: HostForSlots,
  hostDateStr: string, // "YYYY-MM-DD" in host's timezone
): { startTime: string; endTime: string } | null {
  const exception = host.availabilityExceptions.find((e) => {
    const exceptionDateStr = tzFormat(e.date, "yyyy-MM-dd", {
      timeZone: host.timezone,
    });
    return exceptionDateStr === hostDateStr;
  });

  if (!exception) {
  } else if (exception.type === ExceptionType.BLOCKED) {
    return null;
  } else if (
    exception.type === ExceptionType.CUSTOM_HOURS &&
    exception.customStart &&
    exception.customEnd
  ) {
    return { startTime: exception.customStart, endTime: exception.customEnd };
  }

  const [year, month, day] = hostDateStr.split("-").map(Number);
  const dayOfWeek =
    JS_DAY_TO_ENUM[new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay()];
  const avail = host.availabilities.find((a) => a.dayOfWeek === dayOfWeek);
  if (!avail) return null;

  return { startTime: avail.startTime, endTime: avail.endTime };
}

function formatDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}
