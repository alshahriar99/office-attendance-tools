"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateAttendanceAction } from "@/lib/actions/attendance";
import { Loader2 } from "lucide-react";

interface EditAttendanceDialogProps {
  record: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRecord: any) => void;
}

// Helper to format Date to YYYY-MM-DDThh:mm for datetime-local input
const toDatetimeLocal = (dateString: string | null) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function EditAttendanceDialog({ record, isOpen, onClose, onSuccess }: EditAttendanceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [status, setStatus] = useState("PRESENT");

  // Reset state when opened
  if (record && isOpen && checkIn === "") {
    setCheckIn(toDatetimeLocal(record.checkIn));
    setCheckOut(toDatetimeLocal(record.checkOut));
    setStatus(record.status || "PRESENT");
  }

  const handleClose = () => {
    setCheckIn("");
    setCheckOut("");
    setStatus("PRESENT");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    setIsSubmitting(true);
    try {
      const parsedCheckIn = new Date(checkIn);
      const parsedCheckOut = checkOut ? new Date(checkOut) : undefined;
      
      if (parsedCheckOut && parsedCheckOut < parsedCheckIn) {
        toast.error("Check out time cannot be earlier than check in time");
        setIsSubmitting(false);
        return;
      }

      const res = await updateAttendanceAction(record.id, {
        checkIn: parsedCheckIn,
        checkOut: parsedCheckOut,
        status,
      });

      if (res.success) {
        toast.success("Attendance updated successfully");
        onSuccess({
          ...record,
          checkIn: parsedCheckIn.toISOString(),
          checkOut: parsedCheckOut?.toISOString() || null,
          status,
        });
        handleClose();
      } else {
        toast.error(res.error || "Failed to update attendance");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Attendance</DialogTitle>
          <DialogDescription>
            Update check-in/out times or status for {record?.user?.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="checkIn">Check In Time</Label>
            <Input 
              id="checkIn" 
              type="datetime-local" 
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOut">Check Out Time</Label>
            <Input 
              id="checkOut" 
              type="datetime-local" 
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
                <SelectItem value="HALF_DAY">Half Day</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
