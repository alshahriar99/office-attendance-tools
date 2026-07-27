import { ReportViewer } from "@/components/reports/ReportViewer";
import { PageHeader } from "@/components/shared/PageHeader";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export default async function ReportsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (dbUser?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Reports" 
        description="Generate and export comprehensive attendance reports."
      />
      
      <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
        <ReportViewer />
      </div>
    </div>
  );
}
