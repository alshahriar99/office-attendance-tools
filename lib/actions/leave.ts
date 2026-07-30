"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { notifyAdmins, createNotification } from "./notification";

export async function getLeaves() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  const role = dbUser?.role || "EMPLOYEE";

  let leaves;
  if (role === "ADMIN") {
    leaves = await prisma.leave.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });
  } else {
    leaves = await prisma.leave.findMany({
      where: { userId: session.user.id },
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });
  }

  return { leaves };
}

export async function applyLeaveAction(data: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };

  try {
    const leave = await prisma.leave.create({
      data: {
        userId: session.user.id,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        status: "PENDING",
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "APPLY_LEAVE",
        entityType: "LEAVE",
        entityId: leave.id,
        actorId: session.user.id,
        details: `Applied for ${data.type} leave`,
      }
    });

    await notifyAdmins({
      title: "New Leave Request",
      message: `${session.user.name || "An employee"} applied for ${data.type} leave from ${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()}.`,
      type: "LEAVE_REQUEST",
      link: "/leaves"
    });

    revalidatePath("/leaves");
    return { success: true, leave };
  } catch (error: any) {
    return { error: error.message || "Failed to apply for leave" };
  }
}

export async function cancelLeaveAction(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };

  try {
    const leave = await prisma.leave.findUnique({ where: { id } });
    if (leave?.userId !== session.user.id) return { error: "Unauthorized" };
    if (leave?.status !== "PENDING") return { error: "Can only cancel pending leaves" };

    await prisma.leave.update({
      where: { id },
      data: { status: "CANCELLED" }
    });

    revalidatePath("/leaves");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to cancel leave" };
  }
}

export async function updateLeaveStatusAction(id: string, status: string, adminNote?: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  if (dbUser?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const leave = await prisma.leave.update({
      where: { id },
      data: { status, adminNote }
    });

    await prisma.auditLog.create({
      data: {
        action: `LEAVE_${status}`,
        entityType: "LEAVE",
        entityId: leave.id,
        actorId: session.user.id,
        details: `Leave request ${status.toLowerCase()}`,
      }
    });

    await createNotification({
      userId: leave.userId,
      title: `Leave Request ${status}`,
      message: `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been ${status.toLowerCase()}.${adminNote ? ' Note: ' + adminNote : ''}`,
      type: "LEAVE_REQUEST",
      link: "/leaves"
    });

    revalidatePath("/leaves");
    return { success: true, leave };
  } catch (error: any) {
    return { error: error.message || "Failed to update leave status" };
  }
}
