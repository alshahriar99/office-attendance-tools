import { getHolidays } from "@/lib/actions/holiday";
import { HolidayTable } from "@/components/holidays/HolidayTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export default async function HolidaysPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  const isAdmin = dbUser?.role === "ADMIN";
  const { holidays } = await getHolidays();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Holidays" 
        description="Company and national holiday calendar."
      />
      
      <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
        <HolidayTable data={holidays || []} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
