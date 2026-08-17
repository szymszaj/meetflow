import type { HomeContent } from "@/content/home";

type Props = {
  content: HomeContent["features"];
};

export function Features({ content }: Props) {
  return (
    <section className="bg-zinc-50 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            {content.heading}
          </h2>
          <p className="mt-4 text-lg text-zinc-500">{content.subheading}</p>
        </div>

        <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {content.items.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100"
            >
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                {item.icon}
              </p>
              <h3 className="mt-3 text-base font-semibold text-zinc-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
