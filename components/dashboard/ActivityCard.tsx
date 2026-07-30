import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ActivityCard({ activities = [], tz = "UTC" }: { activities?: any[], tz?: string }) {
  return (
    <Card className="border-border shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest check-ins and check-outs across the team.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="flex flex-col">
            {activities.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No recent activity</div>
            ) : (
              activities.map((activity, i) => (
                <div 
                  key={activity.id} 
                  className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors ${i !== activities.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={activity.userImage || ""} />
                    <AvatarFallback>{activity.userName?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {activity.userName || `User ${activity.userId.substring(0,4)}`}
                        {activity.employeeId && <span className="text-muted-foreground font-normal ml-1 text-xs">({activity.employeeId})</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: tz })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${activity.status === 'PRESENT' ? 'bg-success' : 'bg-warning'}`}></span>
                      {activity.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
