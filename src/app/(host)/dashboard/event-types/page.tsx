import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dashboardContent } from "@/content/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, ExternalLink } from "lucide-react";

export default async function EventTypesPage() {
  const session = await auth();
  const { eventTypes: c } = dashboardContent;

  const host = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: { slug: true },
  });

  const eventTypes = await prisma.eventType.findMany({
    where: { hostId: session!.user!.id },
    orderBy: { createdAt: "asc" },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">{c.heading}</h1>
        <Link href="/dashboard/event-types/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            {c.newButton}
          </Button>
        </Link>
      </div>

      {eventTypes.length === 0 ? (
        <p className="text-sm text-zinc-400">{c.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {eventTypes.map((et) => (
            <li key={et.id} className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-zinc-100">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: et.color }} />
                <div>
                  <p className="font-semibold text-zinc-900">{et.name}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{et.durationMinutes} {c.minutesSuffix}</span>
                    <a
                      href={`${appUrl}/${host?.slug}/${et.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-indigo-600"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {c.publicLinkLabel}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={et.isActive ? "success" : "outline"}>
                  {et.isActive ? c.activeLabel : c.inactiveLabel}
                </Badge>
                <Link href={`/dashboard/event-types/${et.id}`} className="text-sm text-indigo-600 hover:underline">
                  {c.editButton}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
