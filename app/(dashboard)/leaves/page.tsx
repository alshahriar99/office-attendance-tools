import { getLeaves } from "@/lib/actions/leave";
import { LeaveTable } from "@/components/leaves/LeaveTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export default async function LeavesPage() {
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
  const { leaves } = await getLeaves();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
      <PageHeader 
        title={isAdmin ? "Leave Requests" : "My Leaves"} 
        description={isAdmin ? "Manage and review employee leave requests." : "Apply for leave and track your requests."}
      />
      
      <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
        <LeaveTable data={leaves || []} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
