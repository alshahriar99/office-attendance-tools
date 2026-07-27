"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { endOfMonth, startOfMonth, startOfDay, endOfDay } from "date-fns";

export async function getReportData(type: string, month: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (dbUser?.role !== "ADMIN") return { error: "Unauthorized" };

  const targetDate = new Date(month);
  const start = startOfMonth(targetDate);
  const end = endOfMonth(targetDate);

  try {
    if (type === "MONTHLY_ATTENDANCE") {
      const attendance = await prisma.attendance.findMany({
        where: {
          date: { gte: start, lte: end }
        },
        include: {
          user: {
            include: { department: true }
          }
        },
        orderBy: { date: "asc" }
      });
      return { data: attendance };
    }

    if (type === "LATE_REPORT") {
      const attendance = await prisma.attendance.findMany({
        where: {
          date: { gte: start, lte: end },
          status: "LATE"
        },
        include: {
          user: {
            include: { department: true }
          }
        },
        orderBy: { date: "asc" }
      });
      return { data: attendance };
    }

    // Default empty array if type unknown
    return { data: [] };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch report data" };
  }
}
