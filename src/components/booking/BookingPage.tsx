"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarPicker } from "./CalendarPicker";
import { SlotList, type Slot } from "./SlotList";
import { BookingForm } from "./BookingForm";
import { BookingSuccess } from "./BookingSuccess";
import type { BookingContent } from "@/content/booking";
import type { DayOfWeek } from "@prisma/client";

type Step = "calendar" | "slots" | "form" | "success";

type HostData = {
  slug: string;
  timezone: string;
  bufferMinutes: number;
  bookingWindowDays: number;
  availabilities: { dayOfWeek: DayOfWeek }[];
};

type EventTypeData = {
  slug: string;
  name: string;
  durationMinutes: number;
  description: string | null;
  color: string;
};

type Props = {
  content: BookingContent;
  host: HostData;
  eventType: EventTypeData;
};

export function BookingPage({ content, host, eventType }: Props) {
  const [step, setStep] = useState<Step>("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingToken, setBookingToken] = useState<string | null>(null);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSlots([]);

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const params = new URLSearchParams({
      eventTypeSlug: eventType.slug,
      date: dateStr,
      timezone,
    });

    fetch(`/api/hosts/${host.slug}/slots?${params}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, eventType.slug, host.slug, timezone]);

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setStep("slots");
  }

  function handleSlotSelect(slot: Slot) {
    setSelectedSlot(slot);
    setStep("form");
  }

  function handleBookingSuccess(token: string) {
    setBookingToken(token);
    setStep("success");
  }

  const selectedDateLabel = selectedDate
    ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: pl })
    : "";

  return (
    <div>
      {step === "calendar" && (
        <CalendarPicker
          content={content.calendar}
          availableDays={host.availabilities.map((a) => a.dayOfWeek)}
          bookingWindowDays={host.bookingWindowDays}
          timezone={timezone}
          onDateSelect={handleDateSelect}
        />
      )}

      {step === "slots" && (
        <div>
          <p className="mb-4 text-sm font-medium text-indigo-600">{selectedDateLabel}</p>
          <SlotList
            content={{
              ...content.slotList,
              noSlots: content.calendar.noSlots,
              loadingSlots: content.calendar.loadingSlots,
              back: content.calendar.back,
            }}
            slots={slots}
            loading={loadingSlots}
            onSelect={handleSlotSelect}
            onBack={() => setStep("calendar")}
          />
        </div>
      )}

      {step === "form" && selectedSlot && (
        <BookingForm
          content={content.form}
          errorContent={content.errors}
          hostSlug={host.slug}
          eventTypeSlug={eventType.slug}
          selectedSlotUtc={selectedSlot.startUtc}
          selectedSlotLocal={`${selectedDateLabel} · ${selectedSlot.startLocal}–${selectedSlot.endLocal}`}
          onSuccess={handleBookingSuccess}
          onBack={() => setStep("slots")}
        />
      )}

      {step === "success" && bookingToken && (
        <BookingSuccess
          content={content.success}
          token={bookingToken}
          hostSlug={host.slug}
          eventTypeSlug={eventType.slug}
        />
      )}
    </div>
  );
}
