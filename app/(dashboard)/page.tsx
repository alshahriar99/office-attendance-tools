import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  let role = "EMPLOYEE";
  if (session?.user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    role = dbUser?.role || "EMPLOYEE";
  }

  if (role === "ADMIN") {
    return <AdminDashboard />;
  }
  return <EmployeeDashboard user={session?.user || {}} />;
}
