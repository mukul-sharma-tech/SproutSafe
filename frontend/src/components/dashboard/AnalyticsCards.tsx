import { AlertTriangle, Clock, Eye, Shield, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebUsageStats, useAlerts, useBlockedStats, useWebUsageStatsFull } from "@/hooks/use-children";

interface AnalyticsCardsProps {
  childEmail: string | null;
  onNavigateToSettings?: () => void;
}

export function AnalyticsCards({ childEmail, onNavigateToSettings }: AnalyticsCardsProps) {
  const { data: usage, isLoading: usageLoading } = useWebUsageStats(childEmail);
  const { data: usageFull } = useWebUsageStatsFull(childEmail);
  const { data: alertsData, isLoading: alertsLoading } = useAlerts(childEmail);
  const { data: blocked, isLoading: blockedLoading } = useBlockedStats(childEmail);

  const searchCount = usageFull?.usageDetails?.reduce((acc, u) => acc + (u.searchQueries?.length ?? 0), 0) ?? 0;

  const stats = [
    {
      icon: Clock,
      label: "Screen Time",
      value: usage?.totalTime ?? "0m",
      loading: usageLoading,
      accent: "primary",
    },
    {
      icon: Shield,
      label: "Searches",
      value: String(searchCount),
      loading: usageLoading,
      accent: "emerald",
    },
    {
      icon: AlertTriangle,
      label: "Alerts",
      value: String(alertsData?.alerts?.length ?? 0),
      loading: alertsLoading,
      accent: "amber",
    },
    {
      icon: Eye,
      label: "Blocked",
      value: String(blocked?.count ?? 0),
      loading: blockedLoading,
      accent: "rose",
    },
  ];

  const accentClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
    rose: "bg-rose-500/10 text-rose-500",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden transition-colors hover:border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClasses[stat.accent]}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            {stat.loading ? (
              <Skeleton className="h-9 w-16 mt-1.5" />
            ) : (
              <p className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</p>
            )}
          </CardContent>
        </Card>
      ))}

      <Card
        className="overflow-hidden cursor-pointer group relative border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
        onClick={onNavigateToSettings}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-5 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow-md shadow-primary/25 group-hover:shadow-lg group-hover:shadow-primary/40 transition-shadow">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </div>
          <p className="text-sm font-semibold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">SafeSearch Mode</p>
          <p className="text-xs text-muted-foreground mt-1">Configure protection</p>
        </CardContent>
      </Card>
    </div>
  );
}
