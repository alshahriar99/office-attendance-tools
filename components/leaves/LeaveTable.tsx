"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApplyLeaveDialog } from "./ApplyLeaveDialog";
import { cancelLeaveAction, updateLeaveStatusAction } from "@/lib/actions/leave";
import { format } from "date-fns";
import { CheckCircle, XCircle, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface LeaveTableProps {
  data: any[];
  isAdmin: boolean;
}

export function LeaveTable({ data, isAdmin }: LeaveTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  
  const [actionDialog, setActionDialog] = useState<{ open: boolean, type: 'APPROVE' | 'REJECT', id: string | null }>({
    open: false, type: 'APPROVE', id: null
  });
  const [adminNote, setAdminNote] = useState("");

  const handleStatusUpdate = async () => {
    if (!actionDialog.id) return;
    await updateLeaveStatusAction(actionDialog.id, actionDialog.type === 'APPROVE' ? 'APPROVED' : 'REJECTED', adminNote);
    setActionDialog({ open: false, type: 'APPROVE', id: null });
    setAdminNote("");
  };

  const handleCancel = async (id: string) => {
    if (confirm("Cancel this pending leave request?")) {
      await cancelLeaveAction(id);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => row.getValue("type")?.toString().replace("_", " "),
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => format(new Date(row.getValue("startDate")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => format(new Date(row.getValue("endDate")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <span className="truncate max-w-[200px] inline-block" title={row.getValue("reason")}>
          {row.getValue("reason")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={
            status === "APPROVED" ? "default" :
            status === "REJECTED" ? "destructive" :
            status === "CANCELLED" ? "secondary" : "outline"
          } className={status === "APPROVED" ? "bg-success hover:bg-success/90" : status === "PENDING" ? "text-amber-500 border-amber-500" : ""}>
            {status}
          </Badge>
        )
      },
    },
  ];

  if (isAdmin) {
    columns.unshift({
      accessorKey: "user.name",
      header: "Employee",
    });
    
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const leave = row.original;
        if (leave.status !== "PENDING") return "-";
        
        return (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-success border-success hover:bg-success/10" 
              onClick={() => setActionDialog({ open: true, type: 'APPROVE', id: leave.id })}>
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => setActionDialog({ open: true, type: 'REJECT', id: leave.id })}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    });
  } else {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const leave = row.original;
        if (leave.status !== "PENDING") return "-";
        
        return (
          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => handleCancel(leave.id)}>
            <X className="mr-1 h-4 w-4" /> Cancel
          </Button>
        )
      }
    });
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Leave Requests</h3>
        {!isAdmin && (
          <Button onClick={() => setIsApplyOpen(true)}>Apply for Leave</Button>
        )}
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No leave requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>

      <ApplyLeaveDialog open={isApplyOpen} onOpenChange={setIsApplyOpen} />

      <Dialog open={actionDialog.open} onOpenChange={(o) => setActionDialog(prev => ({ ...prev, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialog.type === 'APPROVE' ? 'Approve Leave' : 'Reject Leave'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Note (Optional)</label>
              <Textarea 
                placeholder="E.g., Approved, enjoy your time off!" 
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button 
              variant={actionDialog.type === 'APPROVE' ? 'default' : 'destructive'} 
              className={actionDialog.type === 'APPROVE' ? 'bg-success hover:bg-success/90' : ''}
              onClick={handleStatusUpdate}
            >
              Confirm {actionDialog.type === 'APPROVE' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
