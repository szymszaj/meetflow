import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { bookingContent } from "@/content/booking";
import { Clock } from "lucide-react";

type Props = { params: Promise<{ hostSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { hostSlug } = await params;
  const host = await prisma.user.findUnique({ where: { slug: hostSlug } });
  if (!host) return {};
  return { title: `${host.name ?? hostSlug} · meetflow` };
}

export default async function HostPage({ params }: Props) {
  const { hostSlug } = await params;
  const { hostPage } = bookingContent;

  const host = await prisma.user.findUnique({
    where: { slug: hostSlug },
    include: {
      eventTypes: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!host) notFound();

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-xl px-4 py-16">
        {/* Host header */}
        <div className="mb-10 text-center">
          {host.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={host.image}
              alt={host.name ?? ""}
              className="mx-auto mb-4 h-16 w-16 rounded-full object-cover"
            />
          )}
          <h1 className="text-2xl font-bold text-zinc-900">{host.name}</h1>
        </div>

        {/* Event types */}
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          {hostPage.eventTypesHeading}
        </h2>

        <ul className="flex flex-col gap-3">
          {host.eventTypes.map((et) => (
            <li key={et.id}>
              <Link
                href={`/${hostSlug}/${et.slug}`}
                className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 transition hover:shadow-md hover:ring-indigo-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: et.color }}
                  />
                  <div>
                    <p className="font-semibold text-zinc-900">{et.name}</p>
                    {et.description && (
                      <p className="mt-0.5 text-sm text-zinc-500">{et.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <Clock className="h-4 w-4" />
                  <span>{et.durationMinutes} {hostPage.minutesLabel}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
