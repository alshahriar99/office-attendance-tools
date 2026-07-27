"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getHolidays() {
  const holidays = await prisma.holiday.findMany({
    orderBy: { date: "asc" }
  });
  return { holidays };
}

export async function createHolidayAction(data: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  if (dbUser?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const holiday = await prisma.holiday.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        type: data.type || "COMPANY",
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_HOLIDAY",
        entityType: "HOLIDAY",
        entityId: holiday.id,
        actorId: session.user.id,
        details: `Created holiday ${holiday.name}`,
      }
    });

    revalidatePath("/holidays");
    return { success: true, holiday };
  } catch (error: any) {
    return { error: error.message || "Failed to create holiday" };
  }
}

export async function updateHolidayAction(id: string, data: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  if (dbUser?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const holiday = await prisma.holiday.update({
      where: { id },
      data: {
        name: data.name,
        date: new Date(data.date),
        type: data.type,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_HOLIDAY",
        entityType: "HOLIDAY",
        entityId: holiday.id,
        actorId: session.user.id,
        details: `Updated holiday ${holiday.name}`,
      }
    });

    revalidatePath("/holidays");
    return { success: true, holiday };
  } catch (error: any) {
    return { error: error.message || "Failed to update holiday" };
  }
}

export async function deleteHolidayAction(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  if (dbUser?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const holiday = await prisma.holiday.delete({
      where: { id }
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_HOLIDAY",
        entityType: "HOLIDAY",
        entityId: id,
        actorId: session.user.id,
        details: `Deleted holiday ${holiday.name}`,
      }
    });

    revalidatePath("/holidays");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete holiday" };
  }
}
