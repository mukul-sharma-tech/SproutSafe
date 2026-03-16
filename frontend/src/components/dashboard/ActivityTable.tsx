import { useState } from "react";
import { Activity, Clock, Search, AlertTriangle, ExternalLink, ArrowDownCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivities } from "@/hooks/use-children";
import { formatActivityTableTime } from "@/utils/formatActivityTime";

interface ActivityTableProps {
  childEmail: string | null;
}

const activityIcons: Record<string, React.ElementType> = {
  search: Search,
  website: ExternalLink,
  app: Activity,
  alert: AlertTriangle,
  download: ArrowDownCircle,
};

export function ActivityTable({ childEmail }: ActivityTableProps) {
  const [timeFrame, setTimeFrame] = useState("today");
  const { data, isLoading } = useActivities(childEmail, timeFrame);
  const activities = data?.activities ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base heading-serif">Activity Monitor</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t">
          <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-medium text-muted-foreground bg-muted/30">
            <div className="col-span-8 sm:col-span-9">Activity</div>
            <div className="col-span-4 sm:col-span-3">Time</div>
          </div>
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-3">
                  <Skeleton className="h-5 w-full" />
                </div>
              ))
            ) : activities.length > 0 ? (
              activities.map((activity, index) => {
                const Icon = activityIcons[activity.type] || Activity;
                return (
                  <div key={index} className="grid grid-cols-12 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="col-span-8 sm:col-span-9 flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm truncate">{activity.content}</span>
                    </div>
                    <div className="col-span-4 sm:col-span-3 flex items-center text-xs text-muted-foreground gap-1.5">
                      <Clock className="h-3 w-3 shrink-0" />
                      {formatActivityTableTime(activity.timestamp)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Activity className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">No activities found</p>
                <p className="text-xs mt-1">No activity for this time range</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
