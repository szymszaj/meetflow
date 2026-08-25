import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dashboardContent } from "@/content/dashboard";
import { DashboardSidebar } from "@/components/host/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <DashboardSidebar nav={dashboardContent.nav} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
