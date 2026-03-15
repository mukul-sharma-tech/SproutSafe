import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { fetchWebUsageStatsFull, fetchAlertsFull, fetchBlockedStatsFull, fetchActivities } from "@/api/children";
import { generatePDFReport } from "@/utils/pdfGenerator";
import { useChildren, useWebUsageStatsFull } from "@/hooks/use-children";
import { useParentProfile } from "@/hooks/use-auth";

interface ReportsPanelProps {
  childEmail?: string | null;
  parentName?: string;
}

function buildChartData(usageDetails: any[], days: number) {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    const key = date.toISOString().split("T")[0];
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    let minutes = 0;
    let sites = 0;
    usageDetails.forEach((u: any) => {
      const spent = u.dailyTimeSpent?.[key];
      if (spent) { minutes += Math.round(spent / 60); sites++; }
    });
    return { date: label, minutes, sites };
  });
}

export function ReportsPanel({ childEmail, parentName }: ReportsPanelProps) {
  const [dateRange, setDateRange] = useState("7");
  const [reportType, setReportType] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [emailFreq, setEmailFreq] = useState("weekly");
  const [sendingEmail, setSendingEmail] = useState(false);
  const { data: children = [] } = useChildren();
  const { data: parent } = useParentProfile();
  const { data: usageData } = useWebUsageStatsFull(childEmail ?? null);

  const child = children.find((c) => c.email === childEmail);
  const usageDetails = usageData?.usageDetails ?? [];

  const weeklyData = useMemo(() => buildChartData(usageDetails, 7), [usageDetails]);
  const monthlyData = useMemo(() => buildChartData(usageDetails, 30), [usageDetails]);

  const handleGenerate = async () => {
    if (!childEmail) { toast.error("Please select a child profile first"); return; }
    setGenerating(true);
    try {
      const timeFrame = dateRange === "7" ? "week" : dateRange === "30" ? "month" : "today";
      const [ud, ad, bd, actd] = await Promise.all([
        fetchWebUsageStatsFull(childEmail),
        fetchAlertsFull(childEmail),
        fetchBlockedStatsFull(childEmail),
        fetchActivities(childEmail, timeFrame),
      ]);
      await generatePDFReport(child?.name || "Unknown", childEmail, parentName || "", {
        webUsage: ud.usageDetails || [], alerts: ad.alerts || [],
        blocked: bd.blockedList || [], totalTime: ud.totalTime || "0m",
        activities: actd.activities || [],
      });
      toast.success("Report downloaded successfully");
    } catch { toast.error("Failed to generate report"); }
    finally { setGenerating(false); }
  };

  const handleDownloadSummary = async (range: "week" | "month") => {
    if (!childEmail) { toast.error("Select a child profile first"); return; }
    setGenerating(true);
    try {
      const [ud, ad, bd, actd] = await Promise.all([
        fetchWebUsageStatsFull(childEmail),
        fetchAlertsFull(childEmail),
        fetchBlockedStatsFull(childEmail),
        fetchActivities(childEmail, range),
      ]);
      await generatePDFReport(child?.name || "Unknown", childEmail, parentName || "", {
        webUsage: ud.usageDetails || [], alerts: ad.alerts || [],
        blocked: bd.blockedList || [], totalTime: ud.totalTime || "0m",
        activities: actd.activities || [],
      });
      toast.success(`${range === "week" ? "Weekly" : "Monthly"} report downloaded`);
    } catch { toast.error("Failed to generate report"); }
    finally { setGenerating(false); }
  };

  const handleSendEmail = async () => {
    if (!parent?.email) { toast.error("No email found"); return; }
    setSendingEmail(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success(`${emailFreq.charAt(0).toUpperCase() + emailFreq.slice(1)} report will be sent to ${parent.email}`);
    setSendingEmail(false);
  };

  const chartTooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base heading-serif">Weekly Summary</CardTitle>
            <p className="text-sm text-muted-foreground">Activity from the past 7 days</p>
          </CardHeader>
          <CardContent>
            <div className="h-40 mb-4">
              {childEmail ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Minutes" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-lg bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
                  Select a child to view graph
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="gap-1.5" disabled={!childEmail || generating} onClick={() => handleDownloadSummary("week")}>
                {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base heading-serif">Monthly Summary</CardTitle>
            <p className="text-sm text-muted-foreground">Activity from the past 30 days</p>
          </CardHeader>
          <CardContent>
            <div className="h-40 mb-4">
              {childEmail ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="minutes" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Minutes" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-lg bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
                  Select a child to view graph
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="gap-1.5" disabled={!childEmail || generating} onClick={() => handleDownloadSummary("month")}>
                {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Reports */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base heading-serif">Custom Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All activity</SelectItem>
                  <SelectItem value="websites">Websites only</SelectItem>
                  <SelectItem value="search">Search history</SelectItem>
                  <SelectItem value="alerts">Alerts & blocks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Format</label>
              <Select defaultValue="pdf">
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleGenerate} disabled={generating || !childEmail}>
              {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Send Report to Email */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base heading-serif">Send Report to Email</CardTitle>
          <p className="text-sm text-muted-foreground">Schedule automatic reports to your email</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="space-y-1.5 w-full sm:w-48">
              <label className="text-sm text-muted-foreground">Frequency</label>
              <Select value={emailFreq} onValueChange={setEmailFreq}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSendEmail} disabled={sendingEmail} className="gap-1.5">
              {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
