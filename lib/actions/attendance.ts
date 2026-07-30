"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { determineAttendanceStatus, calculateWorkingMinutes } from "@/lib/utils/time";
import { notifyAdmins } from "./notification";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Helper to get authenticated user session
async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

// Get today's start of day in UTC
function getStartOfDay() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function checkInAction() {
  try {
    const session = await getSession();
    const userId = session.user.id;
    const now = new Date();
    const today = getStartOfDay();

    // Check if already checked in
    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    });

    if (existing) {
      return { error: "Already checked in today." };
    }

    // Get Settings
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      return { error: "System settings not configured." };
    }

    const status = determineAttendanceStatus(now, settings.officeStartTime, settings.lateThreshold);

    await prisma.attendance.create({
      data: {
        userId,
        date: today,
        checkIn: now,
        status,
      }
    });

    await notifyAdmins({
      title: "Check-in Alert",
      message: `${session.user.name || "An employee"} checked in at ${now.toLocaleTimeString()}`,
      type: "ATTENDANCE",
      link: "/attendance"
    });

    revalidatePath("/attendance");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to check in." };
  }
}

export async function checkOutAction() {
  try {
    const session = await getSession();
    const userId = session.user.id;
    const now = new Date();
    const today = getStartOfDay();

    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    });

    if (!existing) {
      return { error: "You haven't checked in today." };
    }

    if (existing.checkOut) {
      return { error: "Already checked out today." };
    }

    const workingMinutes = calculateWorkingMinutes(existing.checkIn, now);

    await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOut: now,
        workingMinutes,
      }
    });

    await notifyAdmins({
      title: "Check-out Alert",
      message: `${session.user.name || "An employee"} checked out at ${now.toLocaleTimeString()}`,
      type: "ATTENDANCE",
      link: "/attendance"
    });

    revalidatePath("/attendance");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to check out." };
  }
}

export async function getTodayAttendance() {
  try {
    const session = await getSession();
    const today = getStartOfDay();
    
    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    });
    
    return { attendance };
  } catch (error) {
    return { attendance: null };
  }
}

export async function getEmployeeAttendanceHistory(userId: string) {
  try {
    await getSession(); // Verify auth
    const history = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30
    });
    
    return { history };
  } catch (error) {
    return { history: [] };
  }
}

export async function getDashboardStats() {
  try {
    const session = await getSession();
    // Only admins should ideally call this, but we'll fetch anyway for demo
    
    const today = getStartOfDay();
    
    const [totalUsers, attendancesToday] = await Promise.all([
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.attendance.findMany({
        where: { date: today },
        include: {
          user: { select: { name: true, image: true, employeeId: true } }
        }
      })
    ]);
    
    const present = attendancesToday.filter(a => a.status === 'PRESENT').length;
    const late = attendancesToday.filter(a => a.status === 'LATE').length;
    const halfDay = attendancesToday.filter(a => a.status === 'HALF_DAY').length;
    const onLeave = 0; // Leave module not implemented
    
    const totalPresent = present + late + halfDay;
    const absent = totalUsers - totalPresent - onLeave;
    
    // Average working hours (for completed checkouts today)
    const completed = attendancesToday.filter(a => a.checkOut && a.workingMinutes);
    const avgMins = completed.length > 0 
      ? Math.floor(completed.reduce((acc, a) => acc + (a.workingMinutes || 0), 0) / completed.length)
      : 0;
      
    return {
      stats: {
        totalEmployees: totalUsers,
        presentToday: totalPresent, // count late/half as present
        absentToday: Math.max(0, absent),
        lateToday: late,
        onLeave: onLeave,
        averageWorkingMinutes: avgMins
      },
      recentActivity: attendancesToday.map(a => ({
        id: a.id,
        userId: a.userId,
        userName: a.user.name,
        userImage: a.user.image,
        employeeId: a.user.employeeId,
        checkIn: a.checkIn,
        checkOut: a.checkOut,
        status: a.status
      })).slice(0, 10)
    };
  } catch (error) {
    return { stats: null, recentActivity: [] };
  }
}

export async function getAllAttendance() {
  try {
    const session = await getSession();
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }});
    if (dbUser?.role !== 'ADMIN') throw new Error("Unauthorized");
    
    const records = await prisma.attendance.findMany({
      include: {
        user: {
          select: { name: true, email: true, image: true }
        }
      },
      orderBy: { date: 'desc' }
    });
    
    return { records };
  } catch (error) {
    return { records: [] };
  }
}

export async function deleteAttendanceAction(id: string) {
  try {
    const session = await getSession();
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }});
    if (dbUser?.role !== 'ADMIN') throw new Error("Unauthorized");
    
    await prisma.attendance.delete({ where: { id } });
    revalidatePath("/attendance");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete" };
  }
}

export async function updateAttendanceAction(id: string, data: { checkIn: Date; checkOut?: Date; status: string }) {
  try {
    const session = await getSession();
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }});
    if (dbUser?.role !== 'ADMIN') throw new Error("Unauthorized");

    const workingMinutes = data.checkOut ? calculateWorkingMinutes(data.checkIn, data.checkOut) : null;

    await prisma.attendance.update({
      where: { id },
      data: {
        checkIn: data.checkIn,
        checkOut: data.checkOut || null,
        status: data.status,
        workingMinutes
      }
    });

    revalidatePath("/attendance");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update attendance" };
  }
}

export async function getEmployeeStats() {
  try {
    const session = await getSession();
    const userId = session.user.id;
    const today = getStartOfDay();

    const [todayAttendance, recentActivity] = await Promise.all([
      prisma.attendance.findUnique({
        where: {
          userId_date: {
            userId,
            date: today
          }
        }
      }),
      prisma.attendance.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 7
      })
    ]);

    const totalHours = recentActivity.reduce((acc, a) => acc + (a.workingMinutes || 0), 0);
    const daysPresent = recentActivity.filter(a => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'HALF_DAY').length;

    // A placeholder for remaining leaves if we want to expand
    const leavesRemaining = 14; 

    return {
      stats: {
        leavesRemaining,
        totalHours,
        daysPresent
      },
      recentActivity,
      todayAttendance
    };
  } catch (error) {
    return { stats: null, recentActivity: [], todayAttendance: null };
  }
}
