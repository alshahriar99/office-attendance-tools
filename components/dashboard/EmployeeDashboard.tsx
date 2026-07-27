import { Clock, Calendar, CheckCircle2, PlaneTakeoff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getTodayAttendance, getEmployeeAttendanceHistory, getEmployeeStats } from "@/lib/actions/attendance";
import { getSettings } from "@/lib/actions/settings";
import { CheckInButton, CheckOutButton } from "./AttendanceButtons";
import { formatMinutes } from "@/lib/utils/time";
import { prisma } from "@/lib/prisma";

export async function EmployeeDashboard({ user }: { user: any }) {
  const { settings } = await getSettings();
  const tz = settings?.timezone || "Asia/Dhaka";
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: tz });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: tz });

  const { stats, recentActivity, todayAttendance } = await getEmployeeStats();

  const nextHoliday = await prisma.holiday.findFirst({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" }
  });

  const pendingLeaves = await prisma.leave.count({
    where: { userId: user.id, status: "PENDING" }
  });

  const safeStats = stats || { leavesRemaining: 0, totalHours: 0, daysPresent: 0 };

  const attendance = todayAttendance;
  const history = recentActivity;

  const hasCheckedIn = !!attendance;
  const hasCheckedOut = !!attendance?.checkOut;

  const totalHoursThisMonth = safeStats.totalHours;
  const presentCount = safeStats.daysPresent;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="My Dashboard" 
        description={`Welcome back! Today is ${currentDate}.`}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md shadow-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{currentTime}</span>
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Status Card */}
        <Card className="border-border shadow-sm flex flex-col bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Today's Status</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              {attendance ? attendance.status : "NOT CHECKED IN"}
            </div>
            <p className="text-sm opacity-80 mt-2">Make sure to check in on time!</p>
          </CardContent>
        </Card>

        {/* Check In Action */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Check In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendance ? new Date(attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <CheckInButton disabled={hasCheckedIn} />
          </CardFooter>
        </Card>

        {/* Check Out Action */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Check Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendance?.checkOut ? new Date(attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <CheckOutButton disabled={!hasCheckedIn || hasCheckedOut} />
          </CardFooter>
        </Card>

        {/* Working Hours */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Working Hours (Today)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="text-3xl font-bold text-primary">
              {formatMinutes(attendance?.workingMinutes || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Updates on checkout</p>
          </CardContent>
        </Card>

        {/* Leave Status */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PlaneTakeoff className="h-4 w-4" />
              Leave Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="text-2xl font-bold">
              {pendingLeaves} Pending
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-success">
              Available: {safeStats.leavesRemaining} days
            </p>
          </CardContent>
        </Card>

        {/* Next Holiday */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next Holiday
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="text-xl font-bold truncate" title={nextHoliday?.name || "None"}>
              {nextHoliday?.name || "None"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {nextHoliday ? new Date(nextHoliday.date).toLocaleDateString() : "No upcoming holidays"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Your check-in history for the past week.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="border-t border-border">
              {history.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No recent attendance</div>
              ) : (
                history.slice(0, 5).map((record: any, i: number) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${record.status === 'PRESENT' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{new Date(record.date).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">{record.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatMinutes(record.workingMinutes || 0)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>Your performance this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Total Hours</span>
                <span className="font-bold">{formatMinutes(totalHoursThisMonth)}</span>
              </div>
              <div className="h-px bg-border w-full" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Days Present</span>
                <span className="font-bold">{presentCount} days</span>
              </div>
              <div className="h-px bg-border w-full" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <span className="font-bold text-success">Good</span>
              </div>
              
              <div className="pt-4">
                <Button variant="secondary" className="w-full">View Full Report</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
