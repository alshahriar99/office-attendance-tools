import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminAttendance } from "@/components/attendance/AdminAttendance";
import { EmployeeAttendance } from "@/components/attendance/EmployeeAttendance";
import { getAllAttendance, getEmployeeAttendanceHistory } from "@/lib/actions/attendance";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export default async function AttendancePage() {
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
  const role = dbUser?.role || "EMPLOYEE";

  if (role === "ADMIN") {
    const { records } = await getAllAttendance();
    return <AdminAttendance initialData={records || []} />;
  } else {
    const { history } = await getEmployeeAttendanceHistory(session.user.id);
    return <EmployeeAttendance history={history || []} />;
  }
}
