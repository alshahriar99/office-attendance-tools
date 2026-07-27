"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  try {
    const settings = await prisma.settings.findFirst();
    return { settings };
  } catch {
    return { settings: null };
  }
}

export async function updateSettingsAction(data: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (dbUser?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const existing = await prisma.settings.findFirst();
    let settings;
    
    if (existing) {
      settings = await prisma.settings.update({
        where: { id: existing.id },
        data
      });
    } else {
      settings = await prisma.settings.create({
        data
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_SETTINGS",
        entityType: "SETTINGS",
        entityId: settings.id,
        actorId: session.user.id,
        details: "Updated company settings",
      }
    });

    revalidatePath("/settings");
    return { success: true, settings };
  } catch (error: any) {
    return { error: error.message || "Failed to update settings" };
  }
}
