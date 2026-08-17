import Link from "next/link";
import { homeContent } from "@/content/home";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FinalCta } from "@/components/home/FinalCta";

export default function HomePage() {
  const { nav, hero, features, howItWorks, finalCta, footer } = homeContent;

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
        <span className="text-xl font-black tracking-tight text-indigo-600">
          {nav.logo}
        </span>
        <Link
          href="/login"
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          {nav.cta}
        </Link>
      </header>

      <main>
        <Hero content={hero} />
        <Features content={features} />
        <HowItWorks content={howItWorks} />
        <FinalCta content={finalCta} />
      </main>

      <footer className="border-t border-zinc-100 py-10 text-center text-sm text-zinc-400">
        <p className="font-semibold text-zinc-600">{footer.brand}</p>
        <p className="mt-1">{footer.tagline}</p>
        <nav className="mt-4 flex justify-center gap-6">
          {footer.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-zinc-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-4">{footer.copyright}</p>
      </footer>
    </div>
  );
}
