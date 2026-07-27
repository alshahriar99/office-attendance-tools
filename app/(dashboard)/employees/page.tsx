import { getEmployees, getDepartments } from "@/lib/actions/employee";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export default async function EmployeesPage() {
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

  const { employees } = await getEmployees();
  const departments = await getDepartments();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Employees" 
        description="Manage your workforce, departments, and roles."
      />
      
      <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
        <EmployeeTable data={employees || []} departments={departments || []} />
      </div>
    </div>
  );
}
