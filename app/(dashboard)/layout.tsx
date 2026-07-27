import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getSettings } from "@/lib/actions/settings";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = await getSettings();
  const companyName = settings?.companyName || "Acme Corp";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar companyName={companyName} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNavbar companyName={companyName} />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
