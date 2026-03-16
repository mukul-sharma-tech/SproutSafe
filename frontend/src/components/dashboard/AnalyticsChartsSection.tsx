import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useWebUsageStatsFull } from "@/hooks/use-children";
import type { MonitoredUrl } from "@/types/models";

interface AnalyticsChartsSectionProps {
  childEmail: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  Social: "hsl(var(--chart-1))",
  Education: "hsl(var(--chart-2))",
  Entertainment: "hsl(var(--chart-3))",
  News: "hsl(var(--chart-4))",
  Productivity: "hsl(var(--chart-5))",
  general: "hsl(var(--chart-1))",
};

function BrowsingTrendChart({ usageDetails }: { usageDetails: MonitoredUrl[] }) {
  const chartData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const key = date.toISOString().split("T")[0];
      const short = date.toLocaleDateString("en-US", { weekday: "short" });
      let total = 0;
      usageDetails.forEach((u) => {
        const spent = u.dailyTimeSpent?.[key];
        if (spent) total += spent;
      });
      return { day: short, full: key, screenTime: Math.round(total / 60) };
    });
  }, [usageDetails]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={32} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`${value} min`, "Screen time"]}
          labelFormatter={(label, payload) => payload?.[0]?.payload?.full ?? label}
        />
        <Line
          type="monotone"
          dataKey="screenTime"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4, fill: "hsl(var(--primary))" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CategoryDistributionChart({ usageDetails }: { usageDetails: MonitoredUrl[] }) {
  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    usageDetails.forEach((item) => {
      const cat = item.category || "general";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [usageDetails]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={80} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [value, "Visits"]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={CATEGORY_COLORS[entry.category] || "hsl(var(--primary))"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AnalyticsChartsSection({ childEmail }: AnalyticsChartsSectionProps) {
  const { data: usageData, isLoading } = useWebUsageStatsFull(childEmail);
  const usageDetails = usageData?.usageDetails ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base heading-serif">Browsing Activity (7 days)</CardTitle>
          <p className="text-xs text-muted-foreground">Daily screen time in minutes</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : childEmail ? (
            <BrowsingTrendChart usageDetails={usageDetails} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Select a child to view browsing trends
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base heading-serif">Category Distribution</CardTitle>
          <p className="text-xs text-muted-foreground">Sites by category</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : childEmail && usageDetails.length > 0 ? (
            <CategoryDistributionChart usageDetails={usageDetails} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              No category data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
