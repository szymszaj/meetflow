"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DashboardContent } from "@/content/dashboard";

type Props = {
  content: DashboardContent["settings"];
  initial: {
    slug: string;
    timezone: string;
    bufferMinutes: number;
    bookingWindowDays: number;
  };
};

export function SettingsForm({ content, initial }: Props) {
  const [slug, setSlug] = useState(initial.slug);
  const [timezone, setTimezone] = useState(initial.timezone);
  const [buffer, setBuffer] = useState(initial.bufferMinutes);
  const [window, setWindow] = useState(initial.bookingWindowDays);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, timezone, bufferMinutes: buffer, bookingWindowDays: window }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(typeof d.error === "string" ? d.error : "Błąd zapisu");
      return;
    }
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">{content.heading}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">{content.slugLabel}</Label>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-zinc-400">{content.slugPrefix}</span>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1"
              pattern="[a-z0-9-]+"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tz">{content.timezoneLabel}</Label>
          <Input id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="buffer">{content.bufferLabel}</Label>
          <p className="text-xs text-zinc-400">{content.bufferHelp}</p>
          <Input id="buffer" type="number" min={0} max={120} value={buffer} onChange={(e) => setBuffer(Number(e.target.value))} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="window">{content.windowLabel}</Label>
          <p className="text-xs text-zinc-400">{content.windowHelp}</p>
          <Input id="window" type="number" min={1} max={365} value={window} onChange={(e) => setWindow(Number(e.target.value))} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? content.saving : content.saveButton}
          </Button>
          {savedMsg && <span className="text-sm text-emerald-600">{content.savedMessage}</span>}
        </div>
      </form>
    </div>
  );
}
