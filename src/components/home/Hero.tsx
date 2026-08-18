import Link from "next/link";
import type { HomeContent } from "@/content/home";

type Props = {
  content: HomeContent["hero"];
};

export function Hero({ content }: Props) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <span className="inline-block rounded-full bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-600 ring-1 ring-inset ring-indigo-200">
        {content.badge}
      </span>

      <h1 className="mt-6 text-5xl font-bold tracking-tight text-zinc-900">
        {content.heading}
      </h1>

      <p className="mt-6 text-xl leading-8 text-zinc-500">
        {content.subheading}
      </p>

      <div className="mt-10 flex justify-center gap-4">
        <Link
          href="/login"
          className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
        >
          {content.ctaPrimary}
        </Link>
        <Link
          href="#how-it-works"
          className="rounded-full px-6 py-3 text-sm font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 transition-colors"
        >
          {content.ctaSecondary}
        </Link>
      </div>
    </section>
  );
}
