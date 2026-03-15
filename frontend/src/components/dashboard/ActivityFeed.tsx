import { Bell, ShieldBan, AlertTriangle, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/use-children";
import { formatActivityTime } from "@/utils/formatActivityTime";

const typeConfig: Record<string, { icon: React.ElementType; className: string }> = {
  BLOCKED_URL: { icon: ShieldBan, className: "bg-rose-500/10 text-rose-500" },
  SUPERSAFE_BLOCK: { icon: ShieldBan, className: "bg-amber-500/10 text-amber-500" },
  INCOGNITO_ALERT: { icon: AlertTriangle, className: "bg-destructive/10 text-destructive" },
  SECURITY_ALERT: { icon: Bell, className: "bg-destructive/10 text-destructive" },
  EXTENSION_DISCONNECT: { icon: Zap, className: "bg-amber-500/10 text-amber-500" },
  default: { icon: Activity, className: "bg-primary/10 text-primary" },
};

export function ActivityFeed() {
  const { data, isLoading } = useNotifications();
  const items = Array.isArray(data) ? data : (data as { notifications?: unknown[] })?.notifications ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base heading-serif flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Activity Feed
        </CardTitle>
        <p className="text-xs text-muted-foreground">Recent events across all children</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3">
                <Skeleton className="h-12 w-full" />
              </div>
            ))
          ) : items.length > 0 ? (
            items.map((item: { id?: string; text?: string; time?: string; timestamp?: string; type?: string }, i) => {
              const config = typeConfig[item.type ?? ""] ?? typeConfig.default;
              const Icon = config.icon;
              const timeStr = item.timestamp ? formatActivityTime(item.timestamp) : (item.time ?? "");
              return (
                <div
                  key={item.id ?? i}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.className}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{item.text ?? "Activity"}</p>
                    {timeStr && (
                      <p className="text-xs text-muted-foreground mt-0.5">{timeStr}</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Activity className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No recent activity</p>
              <p className="text-xs mt-1">No events yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
