"use client";

import { addDays, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import type { BookingContent } from "@/content/booking";
import type { DayOfWeek } from "@prisma/client";

const PRISMA_TO_JS: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

type Props = {
  content: BookingContent["calendar"];
  availableDays: DayOfWeek[];
  bookingWindowDays: number;
  timezone: string;
  onDateSelect: (date: Date) => void;
};

export function CalendarPicker({
  content,
  availableDays,
  bookingWindowDays,
  timezone,
  onDateSelect,
}: Props) {
  const today = startOfToday();
  const maxDate = addDays(today, bookingWindowDays);

  const availableJsDays = new Set(availableDays.map((d) => PRISMA_TO_JS[d]));

  function isDisabled(date: Date): boolean {
    if (date < today) return true;
    if (date > maxDate) return true;
    return !availableJsDays.has(date.getDay());
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">{content.heading}</h2>
        <span className="text-xs text-zinc-400">{timezone}</span>
      </div>

      <Calendar
        mode="single"
        onSelect={(date) => date && onDateSelect(date)}
        disabled={isDisabled}
      />
    </div>
  );
}
