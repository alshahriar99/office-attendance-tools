"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatMinutes } from "@/lib/utils/time";

export function EmployeeAttendance({ history }: { history: any[] }) {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate monthly stats
  const presentCount = history.filter(h => h.status === 'PRESENT' || h.status === 'LATE').length;
  const lateCount = history.filter(h => h.status === 'LATE').length;
  const totalHours = history.reduce((acc, h) => acc + (h.workingMinutes || 0), 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="My Attendance" 
        description={`View your attendance records and statistics for ${currentMonth}.`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Days Present</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lateCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Working Hours</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMinutes(totalHours)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-border shadow-sm flex flex-col h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Calendar View
            </CardTitle>
            <CardDescription>Visual overview of your attendance.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center border-t border-border bg-muted/10">
             {/* Note: In a real app we'd use a react-calendar component here. */}
             <div className="text-center text-muted-foreground space-y-2">
                <Calendar className="h-10 w-10 mx-auto opacity-20" />
                <p className="text-sm">Calendar Visualization</p>
             </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border shadow-sm overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>Your check-in and check-out logs for the past 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <div className="border-t border-border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                        No attendance history found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          {record.checkOut 
                            ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : "--:--"}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                            ${record.status === 'PRESENT' ? 'bg-success/10 text-success' : 
                              record.status === 'LATE' ? 'bg-warning/10 text-warning' : 
                              'bg-destructive/10 text-destructive'}`}>
                            {record.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatMinutes(record.workingMinutes || 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
