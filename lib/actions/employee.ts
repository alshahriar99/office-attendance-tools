"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Temporary placeholder implementation until we build full Better Auth wrapper
// In a real production system, user creation should use auth.api.signUpEmail on the server,
// but server-side Better Auth SDK has specific requirements. 
// For now, we will interact with Prisma directly, noting the password won't be hashed properly unless we import bcrypt.
import bcrypt from "bcryptjs";

export async function getEmployees() {
  const users = await prisma.user.findMany({
    include: {
      department: true,
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return { employees: users };
}

export async function getDepartments() {
  return await prisma.department.findMany({ orderBy: { name: "asc" } });
}

export async function createEmployeeAction(data: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized" };
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  if (dbUser?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    // Let Better Auth handle user creation and password hashing
    const res = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password || 'Password123!',
        name: data.name
      }
    });

    if (!res || !res.user) {
      return { error: "Failed to create authentication user." };
    }

    // Now update the additional fields for this user
    const employee = await prisma.user.update({
      where: { id: res.user.id },
      data: {
        role: data.role || "EMPLOYEE",
        employeeId: data.employeeId,
        phone: data.phone,
        designation: data.designation,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        departmentId: data.departmentId || null,
        status: data.status || "ACTIVE",
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_EMPLOYEE",
        entityType: "USER",
        entityId: employee.id,
        details: `Created employee ${employee.email}`,
      }
    });

    revalidatePath("/employees");
    return { success: true, employee };
  } catch (error: any) {
    console.error("Failed to create employee:", error);
    return { error: error.message || "Failed to create employee" };
  }
}

export async function updateEmployeeAction(id: string, data: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized" };
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  if (dbUser?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const employee = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        employeeId: data.employeeId,
        phone: data.phone,
        designation: data.designation,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
        departmentId: data.departmentId || null,
        status: data.status,
      }
    });

    if (data.password) {
      // Use Better Auth's signUp to generate a properly hashed password
      const tempEmail = 'temp_pw_' + Date.now() + '@example.com';
      try {
        const tempResult = await auth.api.signUpEmail({
          body: { name: 'Temp', email: tempEmail, password: data.password },
          asResponse: false
        });
        
        const tempAccount = await prisma.account.findFirst({
          where: { userId: tempResult.user.id }
        });
        
        // Delete the temporary user
        await prisma.account.deleteMany({ where: { userId: tempResult.user.id } });
        await prisma.session.deleteMany({ where: { userId: tempResult.user.id } });
        await prisma.user.delete({ where: { id: tempResult.user.id } });

        if (tempAccount?.password) {
          await prisma.account.updateMany({
            where: { userId: id, providerId: 'credential' },
            data: { password: tempAccount.password }
          });
        }
      } catch (pwErr: any) {
        console.error("Password update failed:", pwErr.message);
      }
    }

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_EMPLOYEE",
        entityType: "USER",
        entityId: employee.id,
        details: `Updated employee ${employee.email}`,
      }
    });

    revalidatePath("/employees");
    return { success: true, employee };
  } catch (error: any) {
    return { error: error.message || "Failed to update employee" };
  }
}

export async function deleteEmployeeAction(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized" };
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  if (dbUser?.role !== "ADMIN") return { error: "Unauthorized" };

  if (id === session.user.id) {
    return { error: "You cannot delete your own account." };
  }

  try {
    try {
      await prisma.user.delete({
        where: { id }
      });
    } catch (e: any) {
      if (e.code !== 'P2025') {
        throw e;
      }
    }

    await prisma.auditLog.create({
      data: {
        action: "DELETE_EMPLOYEE",
        entityType: "USER",
        entityId: id,
        details: `Deleted employee with ID ${id}`,
      }
    });

    revalidatePath("/employees");
    return { success: true };
  } catch (error: any) {
    console.error("Delete error:", error);
    return { error: error.message || "Failed to delete employee" };
  }
}
