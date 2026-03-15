import { Activity, AlertTriangle, Clock, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useWebUsageStats, useAlerts, useBlockedStats } from "@/hooks/use-children";

interface StatsCardsProps {
  childEmail: string | null;
}

export function StatsCards({ childEmail }: StatsCardsProps) {
  const { data: usage, isLoading: usageLoading } = useWebUsageStats(childEmail);
  const { data: alertsData, isLoading: alertsLoading } = useAlerts(childEmail);
  const { data: blocked, isLoading: blockedLoading } = useBlockedStats(childEmail);

  const isLoading = usageLoading || alertsLoading || blockedLoading;

  const stats = [
    {
      icon: Clock,
      label: "Screen Time",
      value: usage?.totalTime ?? "0m",
      loading: usageLoading,
    },
    {
      icon: AlertTriangle,
      label: "Alerts",
      value: String(alertsData?.alerts?.length ?? 0),
      loading: alertsLoading,
    },
    {
      icon: Eye,
      label: "Blocked Content",
      value: String(blocked?.count ?? 0),
      loading: blockedLoading,
    },
    {
      icon: Activity,
      label: "Active Sessions",
      value: "1",
      loading: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="transition-shadow hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            {stat.loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-semibold mt-0.5">{stat.value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
