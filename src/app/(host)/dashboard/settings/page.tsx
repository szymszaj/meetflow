import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dashboardContent } from "@/content/dashboard";
import { SettingsForm } from "@/components/host/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: { slug: true, timezone: true, bufferMinutes: true, bookingWindowDays: true },
  });

  return (
    <SettingsForm
      content={dashboardContent.settings}
      initial={{
        slug: user!.slug,
        timezone: user!.timezone,
        bufferMinutes: user!.bufferMinutes,
        bookingWindowDays: user!.bookingWindowDays,
      }}
    />
  );
}
