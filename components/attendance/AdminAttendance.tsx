"use client";
import { toast } from "sonner";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Trash2, Edit } from "lucide-react";
import { formatMinutes } from "@/lib/utils/time";
import { deleteAttendanceAction } from "@/lib/actions/attendance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditAttendanceDialog } from "./EditAttendanceDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function AdminAttendance({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [isPending, setIsPending] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setIsPending(true);
    const res = await deleteAttendanceAction(deleteConfirm);
    if (res.success) {
      setData(data.filter(d => d.id !== deleteConfirm));
      toast.success("Attendance record deleted successfully");
    } else {
      toast.error(res.error);
    }
    setIsPending(false);
    setDeleteConfirm(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Attendance Records" 
        description="View and manage all employee attendance records."
      >
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </PageHeader>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">All Records</CardTitle>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employee..."
                className="w-full bg-background pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t border-border rounded-b-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Working Hrs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={record.user.image} />
                            <AvatarFallback>{record.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{record.user.name}</span>
                            <span className="text-xs text-muted-foreground">{record.user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="text-sm">
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
                      <TableCell className="text-sm">
                        {formatMinutes(record.workingMinutes || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => setEditingRecord(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setDeleteConfirm(record.id)}
                            disabled={isPending}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <EditAttendanceDialog 
        record={editingRecord}
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSuccess={(updatedRecord) => {
          setData(data.map(d => d.id === updatedRecord.id ? updatedRecord : d));
        }}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this attendance record from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


