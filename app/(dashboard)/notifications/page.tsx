import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell, CheckCircle2, AlertCircle, Info, Clock, Check } from "lucide-react";
import { mockNotifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const hasNotifications = mockNotifications.length > 0;

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "warning": return <AlertCircle className="h-5 w-5 text-warning" />;
      case "error": return <AlertCircle className="h-5 w-5 text-destructive" />;
      default: return <Info className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Notifications" 
        description="Stay updated with your latest alerts and system messages."
      >
        {hasNotifications && (
          <Button variant="outline" size="sm" className="gap-2">
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </PageHeader>

      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {!hasNotifications ? (
            <EmptyState
              icon={<Bell />}
              title="All caught up!"
              description="You don't have any new notifications at the moment. Check back later."
              className="border-0 bg-transparent py-16"
            />
          ) : (
            <div className="divide-y divide-border">
              {mockNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={cn(
                    "flex gap-4 p-4 sm:p-6 transition-colors hover:bg-muted/30",
                    !notif.read && "bg-primary/5"
                  )}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                      <h4 className={cn("text-sm font-semibold", !notif.read && "text-primary")}>
                        {notif.title}
                      </h4>
                      <span className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="mr-1 h-3 w-3" />
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
