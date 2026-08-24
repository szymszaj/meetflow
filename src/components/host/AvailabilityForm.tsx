"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import type { DashboardContent } from "@/content/dashboard";
import type { DayOfWeek, ExceptionType } from "@prisma/client";
import { format } from "date-fns";
import { Trash2, Plus } from "lucide-react";

type AvailRow = { dayOfWeek: DayOfWeek; startTime: string; endTime: string };
type Exception = { id: string; date: Date; type: ExceptionType; customStart: string | null; customEnd: string | null };

type Props = {
  content: DashboardContent["availability"];
  initialAvailability: AvailRow[];
  initialExceptions: Exception[];
};

const ALL_DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export function AvailabilityForm({ content, initialAvailability, initialExceptions }: Props) {
  // Build state: one entry per day (enabled + times)
  const [rows, setRows] = useState<Record<DayOfWeek, { enabled: boolean; start: string; end: string }>>(
    () => {
      const map = {} as Record<DayOfWeek, { enabled: boolean; start: string; end: string }>;
      for (const day of ALL_DAYS) {
        const existing = initialAvailability.find((a) => a.dayOfWeek === day);
        map[day] = { enabled: !!existing, start: existing?.startTime ?? "09:00", end: existing?.endTime ?? "17:00" };
      }
      return map;
    },
  );

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [exceptions, setExceptions] = useState<Exception[]>(initialExceptions);

  // New exception form state
  const [newExDate, setNewExDate] = useState<Date | undefined>();
  const [newExType, setNewExType] = useState<ExceptionType>("BLOCKED");
  const [newExStart, setNewExStart] = useState("09:00");
  const [newExEnd, setNewExEnd] = useState("17:00");
  const [showCalendar, setShowCalendar] = useState(false);

  function updateRow(day: DayOfWeek, patch: Partial<{ enabled: boolean; start: string; end: string }>) {
    setRows((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  async function saveAvailability() {
    setSaving(true);
    const payload = ALL_DAYS.filter((d) => rows[d].enabled).map((d) => ({
      dayOfWeek: d,
      startTime: rows[d].start,
      endTime: rows[d].end,
    }));
    await fetch("/api/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  }

  async function addException() {
    if (!newExDate) return;
    const res = await fetch("/api/availability-exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: format(newExDate, "yyyy-MM-dd"),
        type: newExType,
        customStart: newExType === "CUSTOM_HOURS" ? newExStart : undefined,
        customEnd: newExType === "CUSTOM_HOURS" ? newExEnd : undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setExceptions((prev) => [...prev.filter((e) => e.id !== data.id), { ...data, date: new Date(data.date) }]);
      setNewExDate(undefined);
      setShowCalendar(false);
    }
  }

  async function deleteException(id: string) {
    await fetch(`/api/availability-exceptions/${id}`, { method: "DELETE" });
    setExceptions((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{content.heading}</h1>
        <p className="mt-1 text-sm text-zinc-500">{content.subheading}</p>
      </div>

      {/* Weekly schedule */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
        <div className="flex flex-col gap-4">
          {ALL_DAYS.map((day) => (
            <div key={day} className="flex items-center gap-4">
              <Switch
                checked={rows[day].enabled}
                onCheckedChange={(v) => updateRow(day, { enabled: v })}
              />
              <span className="w-28 text-sm font-medium text-zinc-700">
                {content.days[day]}
              </span>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span>{content.fromLabel}</span>
                <Input
                  type="time"
                  value={rows[day].start}
                  onChange={(e) => updateRow(day, { start: e.target.value })}
                  disabled={!rows[day].enabled}
                  className="w-28"
                />
                <span>{content.toLabel}</span>
                <Input
                  type="time"
                  value={rows[day].end}
                  onChange={(e) => updateRow(day, { end: e.target.value })}
                  disabled={!rows[day].enabled}
                  className="w-28"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Button onClick={saveAvailability} disabled={saving}>
            {saving ? content.saving : content.saveButton}
          </Button>
          {savedMsg && <span className="text-sm text-emerald-600">{content.savedMessage}</span>}
        </div>
      </div>

      {/* Exceptions */}
      <div>
        <h2 className="mb-1 text-base font-semibold text-zinc-900">{content.exceptionsHeading}</h2>
        <p className="mb-4 text-sm text-zinc-500">{content.exceptionsSubheading}</p>

        {exceptions.length === 0 ? (
          <p className="mb-4 text-sm text-zinc-400">{content.noExceptions}</p>
        ) : (
          <ul className="mb-4 flex flex-col gap-2">
            {exceptions.map((ex) => (
              <li key={ex.id} className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-zinc-100">
                <div>
                  <span className="font-medium text-zinc-900">{format(ex.date, "dd.MM.yyyy")}</span>
                  <span className="ml-3 text-zinc-500">
                    {ex.type === "BLOCKED" ? content.exceptionTypeBlocked : `${content.exceptionTypeCustom} ${ex.customStart}–${ex.customEnd}`}
                  </span>
                </div>
                <button onClick={() => deleteException(ex.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add exception */}
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium text-zinc-700">{content.exceptionDateLabel}</label>
              <div className="mt-1">
                <Button variant="secondary" size="sm" onClick={() => setShowCalendar(!showCalendar)}>
                  {newExDate ? format(newExDate, "dd.MM.yyyy") : content.addExceptionButton}
                </Button>
                {showCalendar && (
                  <div className="mt-2 inline-block rounded-xl border border-zinc-200 bg-white shadow-lg">
                    <Calendar
                      mode="single"
                      selected={newExDate}
                      onSelect={(d) => { setNewExDate(d ?? undefined); setShowCalendar(false); }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-zinc-700">{content.exceptionTypeLabel}</label>
              <select
                value={newExType}
                onChange={(e) => setNewExType(e.target.value as ExceptionType)}
                className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BLOCKED">{content.exceptionTypeBlocked}</option>
                <option value="CUSTOM_HOURS">{content.exceptionTypeCustom}</option>
              </select>
            </div>

            {newExType === "CUSTOM_HOURS" && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-500">{content.exceptionFromLabel}</span>
                <Input type="time" value={newExStart} onChange={(e) => setNewExStart(e.target.value)} className="w-28" />
                <span className="text-zinc-500">{content.exceptionToLabel}</span>
                <Input type="time" value={newExEnd} onChange={(e) => setNewExEnd(e.target.value)} className="w-28" />
              </div>
            )}

            <Button size="sm" variant="secondary" onClick={addException} disabled={!newExDate}>
              <Plus className="h-4 w-4" />
              {content.addButton}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
