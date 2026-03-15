import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Activity,
  Clock,
  Bell,
  CheckCircle,
  XCircle,
  Globe,
  ShieldBan,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  useAlertsFull,
  useWebUsageStatsFull,
  useBlockedStatsFull,
  useClearAlerts,
  useBlockUrl,
  useUnblockUrl,
} from "@/hooks/use-children";
import type { CategoryCount, MonitoredUrl } from "@/types/models";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { formatActivityTime, formatActivityTableTime } from "@/utils/formatActivityTime";

interface OverviewPanelProps {
  childEmail: string | null;
  childName?: string | null;
}

function ScreenTimeChart({ usageDetails }: { usageDetails: MonitoredUrl[] }) {
  const chartData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 4 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (3 - i));
      const key = date.toISOString().split("T")[0];
      let total = 0;
      usageDetails.forEach((u) => {
        const spent = u.dailyTimeSpent?.[key];
        if (spent) total += spent;
      });
      return { day: key, screenTime: Math.round(total / 60) };
    });
  }, [usageDetails]);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData}>
        <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={30} />
        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
        <Line type="monotone" dataKey="screenTime" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  Social: "bg-rose-500/10 text-rose-500",
  Education: "bg-blue-500/10 text-blue-500",
  Entertainment: "bg-amber-500/10 text-amber-500",
  News: "bg-emerald-500/10 text-emerald-500",
  Productivity: "bg-violet-500/10 text-violet-500",
  general: "bg-pink-500/10 text-pink-500",
};

export function OverviewPanel({ childEmail, childName }: OverviewPanelProps) {
  const [blockInput, setBlockInput] = useState("");

  const { data: alertsData, isLoading: alertsLoading } = useAlertsFull(childEmail);
  const { data: usageData, isLoading: usageLoading } = useWebUsageStatsFull(childEmail);
  const { data: blockedData, isLoading: blockedLoading } = useBlockedStatsFull(childEmail);
  const clearAlertsMut = useClearAlerts(childEmail);
  const blockMut = useBlockUrl(childEmail);
  const unblockMut = useUnblockUrl(childEmail);

  const alerts = alertsData?.alerts ?? [];
  const usageDetails = usageData?.usageDetails ?? [];
  const blockedWebsites = blockedData?.blockedList ?? [];

  const recentSearches = useMemo(() => {
    return [...usageDetails]
      .filter((item) => item.lastUpdated)
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 5);
  }, [usageDetails]);

  const websiteCategories: CategoryCount[] = useMemo(() => {
    const map: Record<string, number> = {};
    usageDetails.forEach((item) => {
      const cat = item.category || "general";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([category, count]) => ({ category, count }));
  }, [usageDetails]);

  const normalizeDomain = (url: string) =>
    url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

  const handleBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockInput.trim()) return;
    blockMut.mutate(normalizeDomain(blockInput));
    setBlockInput("");
  };

  return (
    <div className="space-y-3">
      {childName && (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Viewing: <span className="text-foreground font-bold">{childName}</span>
          </h2>
          {childEmail && (
            <Badge variant="outline" className="text-[11px] font-normal">
              {childEmail}
            </Badge>
          )}
        </div>
      )}

      <Tabs defaultValue="parent" className="space-y-4">
      <TabsList className="grid w-full max-w-sm grid-cols-2">
        <TabsTrigger value="parent">Parent Dashboard</TabsTrigger>
        <TabsTrigger value="child">Child View</TabsTrigger>
      </TabsList>

      <TabsContent value="parent" className="space-y-4">
        {/* Row 1: Activity Overview + Incognito Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base heading-serif">Activity Overview</CardTitle>
                <Badge variant="secondary" className="text-xs font-normal">Last 4 days</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {usageLoading ? (
                <Skeleton className="h-[180px] w-full" />
              ) : childEmail ? (
                <ScreenTimeChart usageDetails={usageDetails} />
              ) : (
                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                  Select a child profile to view activity
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base heading-serif">Incognito Alerts</CardTitle>
                {alerts.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => clearAlertsMut.mutate()}
                    disabled={clearAlertsMut.isPending}
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {alertsLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : alerts.length > 0 ? (
                alerts.slice(0, 3).map((alert, i) => (
                  <div key={i} className="rounded-lg bg-destructive/10 p-3 text-sm">
                    <div className="flex items-center gap-2 text-destructive font-medium mb-1">
                      <Bell className="h-3.5 w-3.5" />
                      Incognito Alert
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{alert.url || "Unknown URL"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatActivityTime(alert.timestamp)}</p>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-500">All clear</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Activity Monitor + Recent Searches + Website Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActivityTable childEmail={childEmail} />

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base heading-serif">Recent Searches</CardTitle></CardHeader>
            <CardContent>
              {usageLoading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
              ) : recentSearches.length > 0 ? (
                <div className="space-y-1.5">
                  {recentSearches.map((s, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2">
                      <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{s.domain}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No recent searches</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base heading-serif">Website Categories</CardTitle></CardHeader>
            <CardContent>
              {usageLoading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
              ) : websiteCategories.length > 0 ? (
                <div className="space-y-1.5">
                  {websiteCategories.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <span className="text-sm">{cat.category}</span>
                      <Badge variant="secondary" className={CATEGORY_COLORS[cat.category] || "bg-muted text-muted-foreground"}>
                        {cat.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-muted-foreground">
                  <Globe className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No categories found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Block Website + Activity Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base heading-serif">Block Website</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleBlock} className="flex gap-2 mb-3">
                <Input
                  placeholder="Enter domain..."
                  value={blockInput}
                  onChange={(e) => setBlockInput(e.target.value)}
                  className="h-9 text-sm"
                />
                <Button type="submit" variant="destructive" size="sm" className="h-9 shrink-0" disabled={blockMut.isPending}>
                  Block
                </Button>
              </form>
              {blockedLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : blockedWebsites.length > 0 ? (
                <div className="space-y-1.5">
                  {blockedWebsites.map((site, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <ShieldBan className="h-3.5 w-3.5 text-destructive shrink-0" />
                        <span className="text-sm truncate">{site.domain}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => unblockMut.mutate(site.domain)}
                        disabled={unblockMut.isPending}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">No blocked websites</p>
              )}
            </CardContent>
          </Card>

          <ActivityFeed />
        </div>
      </TabsContent>

      <TabsContent value="child" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base heading-serif flex items-center gap-2"><Search className="h-4 w-4 text-primary" />All Search Queries</CardTitle>
                <span className="text-xs text-muted-foreground">{recentSearches.length} total</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentSearches.length > 0 ? recentSearches.map((search, i) => (
                  <div key={i} className="rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Search className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-sm font-medium truncate">{search.domain}</span>
                        </div>
                        {search.lastUpdated && (
                          <p className="text-xs text-muted-foreground ml-5">
                            {formatActivityTableTime(search.lastUpdated)}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs">Search</Badge>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center py-12 text-muted-foreground">
                    <Search className="h-10 w-10 mb-3 opacity-40" />
                    <p className="text-sm font-medium">No search queries recorded</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Website Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {websiteCategories.length > 0 ? websiteCategories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                    <span className="text-sm">{cat.category}</span>
                    <Badge variant="secondary" className={CATEGORY_COLORS[cat.category] || ""}>{cat.count} visits</Badge>
                  </div>
                )) : (
                  <div className="flex flex-col items-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">No website visits recorded</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Recent Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentSearches.slice(0, 10).map((a, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border px-3 py-2.5">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{a.domain}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.lastUpdated ? formatActivityTableTime(a.lastUpdated) : "Just now"}
                      </p>
                    </div>
                  </div>
                ))}
                {recentSearches.length === 0 && (
                  <div className="flex flex-col items-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-destructive" />Security Alerts</CardTitle>
                {alerts.length > 0 && <Badge variant="destructive" className="text-xs">{alerts.length} alert{alerts.length !== 1 ? "s" : ""}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {alerts.length > 0 ? alerts.map((alert, i) => (
                  <div key={i} className="rounded-lg bg-destructive/10 p-3">
                    <div className="flex items-start gap-2">
                      <Bell className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-destructive truncate">Incognito: {alert.url || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatActivityTime(alert.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 py-6">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm text-emerald-500 font-medium">No security alerts</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
    </div>
  );
}
