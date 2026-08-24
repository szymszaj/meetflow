"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = DayPickerProps;

export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        // react-day-picker v9 class name API
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center relative items-center h-7",
        caption_label: "text-sm font-semibold text-zinc-900",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-1 h-7 w-7 flex items-center justify-center rounded-md hover:bg-zinc-100 transition-colors text-zinc-600 disabled:opacity-30",
        button_next:
          "absolute right-1 h-7 w-7 flex items-center justify-center rounded-md hover:bg-zinc-100 transition-colors text-zinc-600 disabled:opacity-30",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-zinc-400 rounded-md w-9 font-normal text-xs text-center",
        week: "flex w-full mt-2",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button:
          "h-9 w-9 rounded-md text-sm transition-colors hover:bg-zinc-100 flex items-center justify-center w-full",
        selected:
          "bg-indigo-600 text-white hover:bg-indigo-500 font-semibold rounded-md",
        today: "font-bold text-indigo-600",
        outside: "text-zinc-300",
        disabled: "text-zinc-300 pointer-events-none opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        // v9 uses a single Chevron component with orientation prop
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" {...rest} />
          ) : (
            <ChevronRight className="h-4 w-4" {...rest} />
          ),
      }}
      {...props}
    />
  );
}
