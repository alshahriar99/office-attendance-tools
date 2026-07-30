import { StatsCard } from "./StatsCard";
import { ActivityCard } from "./ActivityCard";
import { mockStats } from "@/lib/mock-data";
import { Users, CalendarCheck, Clock, AlertTriangle, Briefcase, Activity, UserMinus, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/actions/attendance";
import { getSettings } from "@/lib/actions/settings";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { AttendanceChart } from "./AttendanceChart";

import { PageHeader } from "@/components/shared/PageHeader";
import { formatMinutes } from "@/lib/utils/time";

export async function AdminDashboard() {
  const sevenDaysAgo = startOfDay(subDays(new Date(), 6));

  const [
    { settings },
    { stats, recentActivity },
    totalEmployees,
    pendingLeaves,
    nextHoliday,
    rawChartAttendances
  ] = await Promise.all([
    getSettings(),
    getDashboardStats(),
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.leave.count({ where: { status: "PENDING" } }),
    prisma.holiday.findFirst({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" }
    }),
    prisma.attendance.findMany({
      where: {
        date: { gte: sevenDaysAgo }
      }
    })
  ]);

  const tz = settings?.timezone || "Asia/Dhaka";
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: tz });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: tz }); 

  const safeStats = stats || {
    totalEmployees: 0, presentToday: 0, absentToday: 0, lateToday: 0, onLeave: 0, averageWorkingMinutes: 0
  };

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const start = startOfDay(d).getTime();
    const end = endOfDay(d).getTime();

    const attendances = rawChartAttendances.filter(a => {
      const t = new Date(a.date).getTime();
      return t >= start && t <= end;
    });

    const present = attendances.filter(a => a.status === "PRESENT").length;
    const late = attendances.filter(a => a.status === "LATE").length;
    const absent = Math.max(0, totalEmployees - (present + late));

    return {
      date: format(d, "MMM dd"),
      present,
      late,
      absent
    };
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Admin Dashboard" 
        description={`Welcome back to Acme Corp. Today is ${currentDate}.`}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md shadow-sm">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium">{currentTime}</span>
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Total Employees"
          value={safeStats.totalEmployees}
          icon={Users}
          className="xl:col-span-1"
        />
        <StatsCard
          title="Present Today"
          value={safeStats.presentToday}
          icon={CalendarCheck}
          iconColor="text-success"
          className="xl:col-span-1"
        />
        <StatsCard
          title="Absent Today"
          value={safeStats.absentToday}
          icon={AlertTriangle}
          iconColor="text-destructive"
          className="xl:col-span-1"
        />
        <StatsCard
          title="Late Today"
          value={safeStats.lateToday}
          icon={Clock}
          iconColor="text-warning"
          className="xl:col-span-1"
        />
        <StatsCard
          title="On Leave"
          value={safeStats.onLeave}
          icon={Briefcase}
          iconColor="text-primary"
          className="xl:col-span-1"
        />
        <StatsCard
          title="Avg Hours"
          value={formatMinutes(safeStats.averageWorkingMinutes)}
          icon={Activity}
          className="xl:col-span-1"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7 xl:grid-cols-3">
        <Card className="col-span-full lg:col-span-4 xl:col-span-2 border-border shadow-sm flex flex-col h-fit">
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>
              Overview of attendance for the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] w-full border-t border-border bg-muted/5 rounded-b-xl p-4 sm:p-6 pb-2">
            <AttendanceChart data={chartData} />
          </CardContent>
        </Card>

        <div className="col-span-full lg:col-span-3 xl:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground mt-1 text-success">
                Active accounts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <UserMinus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingLeaves}</div>
              <p className="text-xs text-muted-foreground mt-1 text-amber-500">
                Requires action
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Holiday</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate" title={nextHoliday?.name || "None"}>
                {nextHoliday?.name || "None"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {nextHoliday ? new Date(nextHoliday.date).toLocaleDateString() : "No upcoming holidays"}
              </p>
            </CardContent>
          </Card>
          <ActivityCard activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}
