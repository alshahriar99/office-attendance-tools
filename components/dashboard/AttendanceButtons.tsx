"use client";
import { toast } from "sonner";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { checkInAction, checkOutAction } from "@/lib/actions/attendance";

export function CheckInButton({ disabled }: { disabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleCheckIn = () => {
    startTransition(async () => {
      const res = await checkInAction();
      if (res.error) {
        toast.error(res.error);
      }
    });
  };

  return (
    <Button 
      className="w-full gap-2" 
      variant={disabled ? "outline" : "default"} 
      onClick={handleCheckIn}
      disabled={disabled || isPending}
    >
      <LogIn className="h-4 w-4" /> 
      {disabled ? "Already Checked In" : (isPending ? "Checking in..." : "Check In Now")}
    </Button>
  );
}

export function CheckOutButton({ disabled }: { disabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleCheckOut = () => {
    startTransition(async () => {
      const res = await checkOutAction();
      if (res.error) {
        toast.error(res.error);
      }
    });
  };

  return (
    <Button 
      className="w-full gap-2" 
      variant={disabled ? "outline" : "default"} 
      onClick={handleCheckOut}
      disabled={disabled || isPending}
    >
      <LogOut className="h-4 w-4" /> 
      {disabled ? "Not Available" : (isPending ? "Checking out..." : "Check Out Now")}
    </Button>
  );
}


