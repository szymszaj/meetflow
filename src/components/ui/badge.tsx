import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "destructive" | "outline";

const variants: Record<Variant, string> = {
  default: "bg-zinc-100 text-zinc-700",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  destructive: "bg-red-50 text-red-700 ring-1 ring-red-200",
  outline: "ring-1 ring-zinc-200 text-zinc-600",
};

type Props = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export function Badge({ variant = "default", className, children }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
