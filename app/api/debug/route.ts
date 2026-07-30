import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const timings: Record<string, number> = {};
  const logs: string[] = [];

  // 1. Test raw database connection speed
  const t0 = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    timings["1_db_ping"] = Date.now() - t0;
    logs.push(`✅ DB ping: ${timings["1_db_ping"]}ms`);
  } catch (e: any) {
    timings["1_db_ping"] = Date.now() - t0;
    logs.push(`❌ DB ping FAILED (${timings["1_db_ping"]}ms): ${e.message}`);
  }

  // 2. Test a simple findFirst
  const t1 = Date.now();
  try {
    await prisma.user.findFirst();
    timings["2_user_findFirst"] = Date.now() - t1;
    logs.push(`✅ User findFirst: ${timings["2_user_findFirst"]}ms`);
  } catch (e: any) {
    timings["2_user_findFirst"] = Date.now() - t1;
    logs.push(`❌ User findFirst FAILED (${timings["2_user_findFirst"]}ms): ${e.message}`);
  }

  // 3. Test settings findFirst (used in layout)
  const t2 = Date.now();
  try {
    await prisma.settings.findFirst();
    timings["3_settings_findFirst"] = Date.now() - t2;
    logs.push(`✅ Settings findFirst: ${timings["3_settings_findFirst"]}ms`);
  } catch (e: any) {
    timings["3_settings_findFirst"] = Date.now() - t2;
    logs.push(`❌ Settings findFirst FAILED (${timings["3_settings_findFirst"]}ms): ${e.message}`);
  }

  // 4. Test user count
  const t3 = Date.now();
  try {
    const count = await prisma.user.count();
    timings["4_user_count"] = Date.now() - t3;
    logs.push(`✅ User count (${count}): ${timings["4_user_count"]}ms`);
  } catch (e: any) {
    timings["4_user_count"] = Date.now() - t3;
    logs.push(`❌ User count FAILED (${timings["4_user_count"]}ms): ${e.message}`);
  }

  // 5. Test attendance query
  const t4 = Date.now();
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const records = await prisma.attendance.findMany({
      where: { date: today },
      include: { user: { select: { name: true } } }
    });
    timings["5_attendance_today"] = Date.now() - t4;
    logs.push(`✅ Attendance today (${records.length} records): ${timings["5_attendance_today"]}ms`);
  } catch (e: any) {
    timings["5_attendance_today"] = Date.now() - t4;
    logs.push(`❌ Attendance today FAILED (${timings["5_attendance_today"]}ms): ${e.message}`);
  }

  // 6. Second DB ping (to test if connection is cached)
  const t5 = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    timings["6_db_ping_cached"] = Date.now() - t5;
    logs.push(`✅ DB ping (cached): ${timings["6_db_ping_cached"]}ms`);
  } catch (e: any) {
    timings["6_db_ping_cached"] = Date.now() - t5;
    logs.push(`❌ DB ping cached FAILED (${timings["6_db_ping_cached"]}ms): ${e.message}`);
  }

  const totalTime = Object.values(timings).reduce((a, b) => a + b, 0);

  return NextResponse.json({
    totalTime: `${totalTime}ms`,
    databaseUrl: process.env.DATABASE_URL
      ? `${process.env.DATABASE_URL.substring(0, 30)}...`
      : "NOT SET",
    directUrl: process.env.DIRECT_URL
      ? `${process.env.DIRECT_URL.substring(0, 30)}...`
      : "NOT SET",
    vercelRegion: process.env.VERCEL_REGION || "unknown",
    nodeEnv: process.env.NODE_ENV,
    timings,
    logs,
  });
}
