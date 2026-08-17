import Link from "next/link";
import type { HomeContent } from "@/content/home";

type Props = {
  content: HomeContent["finalCta"];
};

export function FinalCta({ content }: Props) {
  return (
    <section className="bg-indigo-600 py-20 text-center text-white">
      <div className="mx-auto max-w-xl px-6">
        <h2 className="text-3xl font-bold">{content.heading}</h2>
        <p className="mt-4 text-indigo-200">{content.subheading}</p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          {content.button}
        </Link>
      </div>
    </section>
  );
}
