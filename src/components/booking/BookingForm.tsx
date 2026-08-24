"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BookingContent } from "@/content/booking";

type Props = {
  content: BookingContent["form"];
  errorContent: BookingContent["errors"];
  hostSlug: string;
  eventTypeSlug: string;
  selectedSlotUtc: string; // ISO UTC
  selectedSlotLocal: string; // "HH:MM"
  onSuccess: (token: string) => void;
  onBack: () => void;
};

export function BookingForm({
  content,
  errorContent,
  hostSlug,
  eventTypeSlug,
  selectedSlotUtc,
  selectedSlotLocal,
  onSuccess,
  onBack,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const guestTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostSlug,
        eventTypeSlug,
        startTime: selectedSlotUtc,
        guestName: name,
        guestEmail: email,
        guestTimezone,
        notes: notes || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(res.status === 409 ? errorContent.slotTaken : errorContent.generic);
      return;
    }

    onSuccess(data.token);
  }

  return (
    <div>
      <div className="mb-6 rounded-lg bg-indigo-50 px-4 py-3">
        <p className="text-sm font-medium text-indigo-700">{selectedSlotLocal}</p>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-zinc-900">{content.heading}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">{content.nameLabel}</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={content.namePlaceholder}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{content.emailLabel}</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={content.emailPlaceholder}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">{content.notesLabel}</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={content.notesPlaceholder}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-2 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? content.submitting : content.submit}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            {content.back}
          </Button>
        </div>
      </form>
    </div>
  );
}
