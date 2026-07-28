import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
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

    const results: string[] = [];

    // Delete existing seed accounts/users to ensure fresh valid password hashes
    const seedEmails = [adminEmail, ...employees.map(e => e.email)];
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: seedEmails } }
    });
    if (existingUsers.length > 0) {
      const userIds = existingUsers.map(u => u.id);
      await prisma.account.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      results.push("Cleaned up previous seed users");
    }

    // 1. Create Admin user
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
      results.push(`Created admin: ${adminEmail} (password: ${adminPassword})`);
    }

    // 2. Create Employees
    for (const emp of employees) {
      await auth.api.signUpEmail({
        body: {
          email: emp.email,
          password: adminPassword,
          name: emp.name,
        },
      });
      results.push(`Created employee: ${emp.email} (password: ${adminPassword})`);
    }

    // 3. Ensure Settings exist
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
      success: true,
      message: "Database seed completed successfully!",
      logs: results,
      credentials: {
        admin: { email: adminEmail, password: adminPassword },
        employees: employees.map((e) => ({ email: e.email, password: adminPassword })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to seed database",
    }, { status: 500 });
  }
}
