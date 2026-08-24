"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DashboardContent } from "@/content/dashboard";

type Props = {
  content: DashboardContent["eventTypeForm"];
  existing?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    durationMinutes: number;
    color: string;
  };
};

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export function EventTypeForm({ content, existing }: Props) {
  const router = useRouter();
  const isNew = !existing;

  const [name, setName] = useState(existing?.name ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [duration, setDuration] = useState(existing?.durationMinutes ?? 30);
  const [color, setColor] = useState(existing?.color ?? COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from name for new event types
  useEffect(() => {
    if (!isNew) return;
    setSlug(
      name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60),
    );
  }, [name, isNew]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = { name, slug, description: description || undefined, durationMinutes: duration, color };
    const url = isNew ? "/api/event-types" : `/api/event-types/${existing!.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : content.saving);
      return;
    }

    router.push("/dashboard/event-types");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5">
      <h1 className="text-xl font-bold text-zinc-900">
        {isNew ? content.headingNew : content.headingEdit}
      </h1>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{content.nameLabel}</Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder={content.namePlaceholder} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">{content.slugLabel}</Label>
        <Input id="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={content.slugPlaceholder} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="desc">{content.descriptionLabel}</Label>
        <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={content.descriptionPlaceholder} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="duration">{content.durationLabel}</Label>
        <Input id="duration" type="number" min={5} max={480} required value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{content.colorLabel}</Label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full transition ${color === c ? "ring-2 ring-offset-2 ring-indigo-500" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? content.saving : content.saveButton}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          {content.cancelButton}
        </Button>
      </div>
    </form>
  );
}
