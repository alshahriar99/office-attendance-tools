"use client";
import { toast } from "sonner";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Globe, Clock, Loader2 } from "lucide-react";
import { updateSettingsAction } from "@/lib/actions/settings";

const settingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  officeStartTime: z.string(),
  officeEndTime: z.string(),
  halfDayTime: z.string(),
  lateThreshold: z.coerce.number().min(0),
  timezone: z.string(),
  language: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsForm({ initialData }: { initialData: any }) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      companyName: initialData?.companyName || "Acme Corp",
      officeStartTime: initialData?.officeStartTime || "09:00",
      officeEndTime: initialData?.officeEndTime || "18:00",
      halfDayTime: initialData?.halfDayTime || "14:00",
      lateThreshold: initialData?.lateThreshold || 15,
      timezone: initialData?.timezone || "UTC",
      language: initialData?.language || "en",
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setIsLoading(true);
    try {
      const res = await updateSettingsAction(data);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Settings saved successfully!"); // Fallback if sonner is not installed
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Company Information
            </CardTitle>
            <CardDescription>Update your company details and core branding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Office Hours & Policies
            </CardTitle>
            <CardDescription>Configure attendance rules, late thresholds, and timing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-xl">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="officeStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="officeEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="halfDayTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Half Day Time (Checkout before)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lateThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Late Threshold (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              Localization
            </CardTitle>
            <CardDescription>Set system timezone and language.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md">
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">GMT/BST</SelectItem>
                      <SelectItem value="Asia/Tokyo">Japan Standard Time</SelectItem>
                      <SelectItem value="Asia/Dhaka">Bangladesh Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t border-border py-4 bg-muted/20">
            <Button type="submit" disabled={isLoading} className="ml-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Configuration
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}


