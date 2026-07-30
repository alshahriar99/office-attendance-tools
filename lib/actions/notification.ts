"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper to get authenticated user session
async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function getNotificationsAction() {
  try {
    const session = await getSession();
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return { notifications };
  } catch (error) {
    return { notifications: [] };
  }
}

export async function markAsReadAction(id: string) {
  try {
    const session = await getSession();
    await prisma.notification.update({
      where: { id, userId: session.user.id },
      data: { read: true },
    });
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to mark as read" };
  }
}

export async function markAllAsReadAction() {
  try {
    const session = await getSession();
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to mark all as read" };
  }
}

// Internal function to create notifications (called by other actions)
export async function createNotification({
  userId,
  title,
  message,
  type = "SYSTEM",
  link = null,
}: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string | null;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function notifyAdmins({
  title,
  message,
  type = "SYSTEM",
  link = null,
}: {
  title: string;
  message: string;
  type?: string;
  link?: string | null;
}) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    const notifications = admins.map((admin) => ({
      userId: admin.id,
      title,
      message,
      type,
      link,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
}
