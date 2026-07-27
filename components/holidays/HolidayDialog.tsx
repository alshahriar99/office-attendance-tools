"use client";
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createHolidayAction, updateHolidayAction } from "@/lib/actions/holiday";
import { Loader2 } from "lucide-react";

const holidaySchema = z.object({
  name: z.string().min(1, "Holiday name is required"),
  date: z.string().min(1, "Date is required"),
  type: z.string(),
});

type HolidayFormValues = z.infer<typeof holidaySchema>;

interface HolidayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: any | null;
}

export function HolidayDialog({ open, onOpenChange, holiday }: HolidayDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      name: "",
      date: "",
      type: "COMPANY",
    },
  });

  useEffect(() => {
    if (holiday) {
      form.reset({
        name: holiday.name,
        date: new Date(holiday.date).toISOString().split('T')[0],
        type: holiday.type,
      });
    } else {
      form.reset({
        name: "",
        date: "",
        type: "COMPANY",
      });
    }
  }, [holiday, form, open]);

  const onSubmit = async (data: HolidayFormValues) => {
    setIsLoading(true);
    try {
      if (holiday) {
        await updateHolidayAction(holiday.id, data);
      } else {
        await createHolidayAction(data);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save holiday");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{holiday ? "Edit Holiday" : "Add Holiday"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holiday Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. New Year's Day" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holiday Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NATIONAL">National Holiday</SelectItem>
                      <SelectItem value="COMPANY">Company Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Holiday
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


