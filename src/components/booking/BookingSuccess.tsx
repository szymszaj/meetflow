import Link from "next/link";
import type { BookingContent } from "@/content/booking";

type Props = {
  content: BookingContent["success"];
  token: string;
  hostSlug: string;
  eventTypeSlug: string;
};

export function BookingSuccess({ content, token, hostSlug, eventTypeSlug }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
        {content.icon}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-zinc-900">{content.heading}</h2>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">{content.subheading}</p>
      </div>

      <div className="w-full max-w-sm rounded-xl bg-zinc-50 p-5 text-left">
        <p className="text-sm font-semibold text-zinc-900">{content.manageHeading}</p>
        <p className="mt-1 text-sm text-zinc-500">{content.manageDescription}</p>
        <Link
          href={`/booking/${token}`}
          className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          {content.cancelLink}
        </Link>
      </div>

      <Link
        href={`/${hostSlug}/${eventTypeSlug}`}
        className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        {content.newBooking}
      </Link>
    </div>
  );
}
