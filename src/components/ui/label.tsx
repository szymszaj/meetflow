import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

type Props = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

export function Label({ className, ...props }: Props) {
  return (
    <LabelPrimitive.Root
      className={cn("text-sm font-medium text-zinc-700", className)}
      {...props}
    />
  );
}
