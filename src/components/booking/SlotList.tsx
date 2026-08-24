import { Button } from "@/components/ui/button";

export type Slot = {
  startUtc: string;
  endUtc: string;
  startLocal: string;
  endLocal: string;
};

// Plain string types — not derived from `as const` — so any caller can pass arbitrary strings.
type SlotListContent = {
  heading: string;
  selectPrompt: string;
  noSlots: string;
  loadingSlots: string;
  back: string;
};

type Props = {
  content: SlotListContent;
  slots: Slot[];
  loading: boolean;
  onSelect: (slot: Slot) => void;
  onBack: () => void;
};

export function SlotList({ content, slots, loading, onSelect, onBack }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-zinc-400">
        {content.loadingSlots}
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">{content.heading}</h2>

      {slots.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">{content.noSlots}</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.map((slot) => (
            <button
              key={slot.startUtc}
              onClick={() => onSelect(slot)}
              className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {slot.startLocal}
            </button>
          ))}
        </div>
      )}

      <Button variant="ghost" size="sm" className="mt-6" onClick={onBack}>
        {content.back}
      </Button>
    </div>
  );
}
