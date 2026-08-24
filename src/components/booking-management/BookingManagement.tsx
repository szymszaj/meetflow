"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlotList, type Slot } from "@/components/booking/SlotList";
import type { BookingManagementContent } from "@/content/booking-management";
import type { DayOfWeek } from "@prisma/client";
import { addDays, startOfToday } from "date-fns";

type Tab = "reschedule" | "cancel";

type BookingDetail = {
  token: string;
  eventName: string;
  hostName: string | null;
  guestName: string;
  startTime: string; // ISO string (serialized from server)
  endTime: string;
  status: string;
};

type HostMeta = {
  timezone: string;
  bookingWindowDays: number;
  availabilities: { dayOfWeek: DayOfWeek }[];
};

type Props = {
  content: Omit<BookingManagementContent, "notFound">;
  booking: BookingDetail;
  hostMeta: HostMeta;
  hostSlug: string;
  eventTypeSlug: string;
};

export function BookingManagement({
  content,
  booking,
  hostMeta,
  hostSlug,
  eventTypeSlug,
}: Props) {
  const [tab, setTab] = useState<Tab>("reschedule");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startDate = new Date(booking.startTime);
  const localDate = format(startDate, "EEEE, d MMMM yyyy 'o' HH:mm", { locale: pl });

  // Load slots when date is selected
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSlots([]);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const params = new URLSearchParams({ eventTypeSlug, date: dateStr, timezone });
    fetch(`/api/hosts/${hostSlug}/slots?${params}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, eventTypeSlug, hostSlug, timezone]);

  async function handleReschedule(slot: Slot) {
    setActionLoading(true);
    setError(null);
    const res = await fetch(`/api/bookings/${booking.token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime: slot.startUtc }),
    });
    setActionLoading(false);
    if (!res.ok) {
      setError(res.status === 409 ? content.errors.slotTaken : content.errors.generic);
      return;
    }
    setMessage(content.reschedule.successMessage);
    setDone(true);
  }

  async function handleCancel() {
    if (!confirm(content.cancel.warning)) return;
    setActionLoading(true);
    setError(null);
    const res = await fetch(`/api/bookings/${booking.token}`, { method: "DELETE" });
    setActionLoading(false);
    if (!res.ok) {
      setError(content.errors.generic);
      return;
    }
    setMessage(content.cancel.successMessage);
    setDone(true);
  }

  const availableJsDays = new Set(
    hostMeta.availabilities.map((a) => {
      const map: Record<DayOfWeek, number> = {
        SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
        THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
      };
      return map[a.dayOfWeek];
    }),
  );

  const today = startOfToday();
  const maxDate = addDays(today, hostMeta.bookingWindowDays);

  if (done && message) {
    return (
      <div className="py-10 text-center">
        <p className="text-lg font-semibold text-emerald-600">{message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Booking summary */}
      <div className="mb-6 rounded-xl bg-zinc-50 p-5">
        <p className="text-sm text-zinc-500">{content.detail.heading}</p>
        <p className="mt-1 font-semibold text-zinc-900">{booking.eventName}</p>
        <p className="text-sm text-zinc-600">
          {content.detail.withLabel} {booking.hostName}
        </p>
        <p className="mt-1 text-sm text-zinc-700">{localDate}</p>
        <Badge variant="success" className="mt-2">
          {content.detail.statusConfirmed}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex rounded-lg bg-zinc-100 p-1">
        {(["reschedule", "cancel"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); }}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t === "reschedule"
              ? content.reschedule.tabLabel
              : content.cancel.tabLabel}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Reschedule tab */}
      {tab === "reschedule" && (
        <div>
          {!selectedDate ? (
            <>
              <p className="mb-3 text-sm font-medium text-zinc-700">
                {content.reschedule.calendarHeading}
              </p>
              <Calendar
                mode="single"
                onSelect={(d) => d && setSelectedDate(d)}
                disabled={(d) =>
                  d < today || d > maxDate || !availableJsDays.has(d.getDay())
                }
              />
            </>
          ) : (
            <SlotList
              content={{
                heading: content.reschedule.slotHeading,
                selectPrompt: "",
                noSlots: content.reschedule.noSlots,
                loadingSlots: content.reschedule.loading,
                back: "← Zmień datę",
              }}
              slots={slots}
              loading={loadingSlots || actionLoading}
              onSelect={handleReschedule}
              onBack={() => setSelectedDate(null)}
            />
          )}
        </div>
      )}

      {/* Cancel tab */}
      {tab === "cancel" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600">{content.cancel.warning}</p>
          <Button variant="destructive" disabled={actionLoading} onClick={handleCancel}>
            {actionLoading ? content.cancel.cancelling : content.cancel.confirmButton}
          </Button>
        </div>
      )}
    </div>
  );
}
