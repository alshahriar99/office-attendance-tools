"use client";
import { toast } from "sonner";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getReportData } from "@/lib/actions/reports";
import { generateCSV } from "@/lib/utils/export";
import { Loader2, Download, Printer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function ReportViewer() {
  const [reportType, setReportType] = useState("MONTHLY_ATTENDANCE");
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runReport = async () => {
    setIsLoading(true);
    setHasRun(true);
    try {
      const res = await getReportData(reportType, month);
      if (res.error) {
        toast.error(res.error);
      } else {
        setData(res.data || []);
      }
    } catch {
      toast.error("Failed to load report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data.length) return;
    
    let headers: string[] = [];
    let rows: any[][] = [];

    if (reportType === "MONTHLY_ATTENDANCE" || reportType === "LATE_REPORT") {
      headers = ["Date", "Employee ID", "Name", "Department", "Check In", "Check Out", "Status", "Working Minutes"];
      rows = data.map(record => [
        format(new Date(record.date), "yyyy-MM-dd"),
        record.user.employeeId || "N/A",
        record.user.name,
        record.user.department?.name || "N/A",
        format(new Date(record.checkIn), "HH:mm"),
        record.checkOut ? format(new Date(record.checkOut), "HH:mm") : "N/A",
        record.status,
        record.workingMinutes || 0
      ]);
    }

    generateCSV(`${reportType.toLowerCase()}`, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end bg-muted/30 p-4 rounded-lg border border-border print:hidden">
        <div className="space-y-2 w-full md:w-64">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={reportType} onValueChange={(val) => { if (val) setReportType(val); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY_ATTENDANCE">Monthly Attendance</SelectItem>
              <SelectItem value="LATE_REPORT">Late Arrivals</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 w-full md:w-48">
          <label className="text-sm font-medium">Month</label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>

        <Button onClick={runReport} disabled={isLoading} className="w-full md:w-auto">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Report
        </Button>
      </div>

      {hasRun && (
        <div className="space-y-4">
          <div className="flex justify-between items-center print:hidden">
            <h3 className="text-lg font-medium">
              {reportType === "MONTHLY_ATTENDANCE" ? "Monthly Attendance Report" : "Late Arrivals Report"} - {format(new Date(month), "MMMM yyyy")}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} disabled={!data.length}>
                <Printer className="mr-2 h-4 w-4" /> Print / PDF
              </Button>
              <Button variant="outline" onClick={handleExportCSV} disabled={!data.length}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </div>
          </div>
          
          <div className="print:block hidden mb-4">
            <h2 className="text-2xl font-bold">Acme Corp - Report</h2>
            <p className="text-muted-foreground">{reportType.replace("_", " ")} for {format(new Date(month), "MMMM yyyy")}</p>
          </div>

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length ? (
                  data.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <div className="font-medium">{record.user.name}</div>
                        <div className="text-xs text-muted-foreground">{record.user.employeeId || record.user.email}</div>
                      </TableCell>
                      <TableCell>{record.user.department?.name || "-"}</TableCell>
                      <TableCell>{format(new Date(record.checkIn), "hh:mm a")}</TableCell>
                      <TableCell>{record.checkOut ? format(new Date(record.checkOut), "hh:mm a") : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === "PRESENT" ? "outline" : record.status === "LATE" ? "secondary" : "destructive"} className="print:border-black print:text-black">
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No records found for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}


