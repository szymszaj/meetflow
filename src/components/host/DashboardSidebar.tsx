"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, CalendarDays, ListChecks, Clock, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardContent } from "@/content/dashboard";

type Props = {
  nav: DashboardContent["nav"];
};

const links = (nav: DashboardContent["nav"]) => [
  { href: "/dashboard", label: nav.overview, icon: LayoutDashboard, exact: true },
  { href: "/dashboard/bookings", label: nav.bookings, icon: CalendarDays, exact: false },
  { href: "/dashboard/event-types", label: nav.eventTypes, icon: ListChecks, exact: false },
  { href: "/dashboard/availability", label: nav.availability, icon: Clock, exact: false },
  { href: "/dashboard/settings", label: nav.settings, icon: Settings, exact: false },
];

export function DashboardSidebar({ nav }: Props) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-100 bg-white px-3 py-6">
      <Link href="/dashboard" className="mb-8 px-3 text-lg font-black tracking-tight text-indigo-600">
        {nav.brand}
      </Link>

      <nav className="flex flex-col gap-1">
        {links(nav).map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-auto flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
      >
        <LogOut className="h-4 w-4" />
        {nav.signOut}
      </button>
    </aside>
  );
}
