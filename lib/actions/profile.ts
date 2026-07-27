"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateProfileAction(data: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
      }
    });

    if (data.password) {
      // Hack to generate a better-auth compatible password hash
      const tempEmail = 'temp' + Date.now() + '@example.com';
      const result = await auth.api.signUpEmail({
        body: { name: 'Temp', email: tempEmail, password: data.password },
        asResponse: false
      });
      
      const tempAccount = await prisma.account.findFirst({
        where: { userId: result.user.id }
      });
      
      await prisma.user.delete({ where: { id: result.user.id } });

      if (tempAccount?.password) {
        await prisma.account.updateMany({
          where: { userId: session.user.id, providerId: 'credential' },
          data: { password: tempAccount.password }
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_PROFILE",
        entityType: "USER",
        entityId: user.id,
        actorId: user.id,
        details: "User updated their profile",
      }
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update profile" };
  }
}

export async function uploadProfileImageAction(imageUrl: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_PROFILE_IMAGE",
        entityType: "USER",
        entityId: session.user.id,
        actorId: session.user.id,
        details: "User updated their profile photo",
      }
    });

    revalidatePath("/", "layout"); // Revalidate layout to update sidebar and navbar
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update profile photo" };
  }
}
