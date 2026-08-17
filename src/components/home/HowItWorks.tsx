import type { HomeContent } from "@/content/home";

type Props = {
  content: HomeContent["howItWorks"];
};

export function HowItWorks({ content }: Props) {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900">
          {content.heading}
        </h2>

        <ol className="mt-16 grid gap-8 sm:grid-cols-3">
          {content.steps.map((step) => (
            <li key={step.number} className="flex flex-col gap-3">
              <span className="text-4xl font-black text-indigo-100">
                {step.number}
              </span>
              <h3 className="text-lg font-semibold text-zinc-900">
                {step.title}
              </h3>
              <p className="text-sm leading-6 text-zinc-500">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
