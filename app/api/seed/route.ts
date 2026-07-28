import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const results: string[] = [];
  const errors: string[] = [];

  try {
    const adminEmail = "admin@example.com";
    const adminPassword = "Password123!";

    const employees = [
      { email: "employee1@example.com", name: "Employee One" },
      { email: "employee2@example.com", name: "Employee Two" },
      { email: "employee3@example.com", name: "Employee Three" },
      { email: "employee4@example.com", name: "Employee Four" },
      { email: "employee5@example.com", name: "Employee Five" },
    ];

    // 1. Delete existing seed accounts/users to ensure fresh clean state
    const seedEmails = [adminEmail, ...employees.map((e) => e.email)];
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: seedEmails } },
    });
    if (existingUsers.length > 0) {
      const userIds = existingUsers.map((u) => u.id);
      await prisma.account.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      results.push(`Cleaned up ${existingUsers.length} previous seed users`);
    }

    // 2. Create Admin user using auth.api.signUpEmail
    try {
      const adminRes = await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: "Admin User",
        },
      });
      if (adminRes && adminRes.user) {
        await prisma.user.update({
          where: { id: adminRes.user.id },
          data: { role: "ADMIN" },
        });
        results.push(`Created admin: ${adminEmail}`);
      } else {
        errors.push(`Admin signUpEmail returned empty response`);
      }
    } catch (err: any) {
      errors.push(`Admin creation error: ${err.message || String(err)}`);
    }

    // 3. Create Employee users
    for (const emp of employees) {
      try {
        const empRes = await auth.api.signUpEmail({
          body: {
            email: emp.email,
            password: adminPassword,
            name: emp.name,
          },
        });
        if (empRes && empRes.user) {
          results.push(`Created employee: ${emp.email}`);
        } else {
          errors.push(`Employee ${emp.email} signUpEmail returned empty response`);
        }
      } catch (err: any) {
        errors.push(`Employee ${emp.email} creation error: ${err.message || String(err)}`);
      }
    }

    // 4. Create default Settings if missing
    const settingsCount = await prisma.settings.count();
    if (settingsCount === 0) {
      await prisma.settings.create({
        data: {
          companyName: "Acme Corp",
          officeStartTime: "09:00",
          officeEndTime: "18:00",
          lateThreshold: 15,
          timezone: "UTC",
          theme: "system",
        },
      });
      results.push("Created default settings");
    }

    return NextResponse.json({
      success: errors.length === 0,
      results,
      errors,
      credentials: {
        admin: { email: adminEmail, password: adminPassword },
        employee: { email: "employee1@example.com", password: adminPassword },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to seed database",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
