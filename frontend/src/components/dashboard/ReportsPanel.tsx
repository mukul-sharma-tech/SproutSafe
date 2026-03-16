import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Loader2, Mail, Sparkles, Bot, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { fetchWebUsageStatsFull, fetchAlertsFull, fetchBlockedStatsFull, fetchActivities } from "@/api/children";
import { generatePDFReport } from "@/utils/pdfGenerator";
import { useChildren, useWebUsageStatsFull } from "@/hooks/use-children";
import { useParentProfile } from "@/hooks/use-auth";
import { generateAI, type AIProvider } from "@/lib/ai-service";
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
  const [generatingAISummary, setGeneratingAISummary] = useState(false);
  const [aiSummary, setAISummary] = useState<string | null>(null);
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiProvider, setAIProvider] = useState<AIProvider | null>(null);
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

  // Generate a fallback static summary when AI is unavailable
  const generateFallbackSummary = (
    childName: string,
    totalTime: string,
    usage: any[],
    alerts: any[],
    blocked: any[],
    activities: any[],
    days: string
  ): string => {
    const topSites = usage.slice(0, 5).map((u: any) => {
      const totalSeconds = Object.values(u.dailyTimeSpent || {}).reduce(
        (sum: number, val: unknown) => sum + (typeof val === "number" ? val : 0),
        0
      ) as number;
      return { domain: u.domain, category: u.category || "Unknown", mins: Math.round(totalSeconds / 60) };
    });

    const totalMins = topSites.reduce((sum, s) => sum + s.mins, 0);
    const avgDaily = Math.round(totalMins / parseInt(days));

    let summary = `ACTIVITY SUMMARY FOR ${childName.toUpperCase()}\n`;
    summary += `Period: Last ${days} days\n`;
    summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    summary += `OVERVIEW\n`;
    summary += `Total Screen Time: ${totalTime}\n`;
    summary += `Average Daily Usage: ~${avgDaily} minutes\n`;
    summary += `Sites Visited: ${usage.length}\n`;
    summary += `Blocked Sites: ${blocked.length}\n\n`;

    summary += `TOP VISITED SITES\n`;
    if (topSites.length > 0) {
      topSites.forEach((site, i) => {
        summary += `${i + 1}. ${site.domain} (${site.category}) - ${site.mins} min\n`;
      });
    } else {
      summary += `No browsing data available for this period.\n`;
    }
    summary += `\n`;

    summary += `ALERTS & CONCERNS\n`;
    if (alerts.length > 0) {
      summary += `${alerts.length} alert(s) detected:\n`;
      alerts.slice(0, 5).forEach((a: any) => {
        const time = new Date(a.timestamp);
        summary += `- ${a.url || "Unknown"} at ${time.toLocaleString()}\n`;
      });
    } else {
      summary += `No alerts or concerning activity detected.\n`;
    }
    summary += `\n`;

    summary += `RECOMMENDATIONS\n`;
    if (avgDaily > 180) {
      summary += `- Consider setting daily time limits (current avg: ${avgDaily}min/day)\n`;
    }
    if (alerts.length > 3) {
      summary += `- Review blocked content attempts with your child\n`;
    }
    if (blocked.length === 0) {
      summary += `- Consider adding age-appropriate content filters\n`;
    }
    summary += `- Have regular conversations about online safety\n`;
    summary += `- Review browsing history together periodically\n`;

    return summary;
  };

  const handleGenerateAISummary = async () => {
    if (!childEmail) { toast.error("Please select a child profile first"); return; }
    setGeneratingAISummary(true);
    setShowAISummary(true);
    setAISummary(null);
    setAIProvider(null);

    try {
      const timeFrame = dateRange === "7" ? "week" : dateRange === "30" ? "month" : "today";
      const [ud, ad, bd, actd] = await Promise.all([
        fetchWebUsageStatsFull(childEmail),
        fetchAlertsFull(childEmail),
        fetchBlockedStatsFull(childEmail),
        fetchActivities(childEmail, timeFrame),
      ]);

      const usage = ud.usageDetails || [];
      const alerts = ad.alerts || [];
      const blocked = bd.blockedList || [];
      const activities = actd.activities || [];
      const totalTime = ud.totalTime || "0m";

      const topSites = usage.slice(0, 15).map((u: any) => {
        const totalSeconds = Object.values(u.dailyTimeSpent || {}).reduce(
          (sum: number, val: unknown) => sum + (typeof val === "number" ? val : 0), 0
        ) as number;
        return `${u.domain} (${u.category || "Unknown"}, ${Math.round(totalSeconds / 60)}min)`;
      }).join("\n");

      const alertDetails = alerts.slice(0, 10).map((a: any) => {
        const time = new Date(a.timestamp);
        const hour = time.getHours();
        const period = hour >= 21 || hour < 6 ? "late night" : hour >= 17 ? "evening" : "daytime";
        return `${a.url} at ${time.toLocaleString()} (${period})`;
      }).join("\n");

      const recentActivity = activities.slice(0, 20).map((a: any) =>
        `${a.type}: ${a.content} at ${new Date(a.timestamp).toLocaleString()}`
      ).join("\n");

      const prompt = `You are an AI assistant helping parents understand their child's digital activity.

CHILD: ${child?.name || "Unknown"}
TIME PERIOD: Last ${dateRange} days
TOTAL SCREEN TIME: ${totalTime}

TOP VISITED SITES:
${topSites || "No data"}

BLOCKED ATTEMPTS/ALERTS:
${alertDetails || "No alerts"}

RECENT ACTIVITY LOG:
${recentActivity || "No recent activity"}

CURRENTLY BLOCKED SITES: ${blocked.length} sites

Provide a summary with:
1. Overview of browsing habits (2-3 sentences)
2. Any concerning patterns (late night usage, blocked content attempts, excessive time)
3. Positive observations if any
4. 2-3 specific, actionable recommendations

Keep the tone supportive and helpful. Use plain language a parent can easily understand.
Format with clear sections. Be specific about times and sites when mentioning concerns.`;

      await generateAI(
        prompt,
        (chunk) => setAISummary((prev) => (prev ?? "") + chunk),
        (provider) => {
          setAIProvider(provider);
          if (provider === "groq") toast.info("Using Groq AI (cloud fallback)");
        }
      );
    } catch {
      // Both AI providers failed — show static fallback
      try {
        const timeFrame = dateRange === "7" ? "week" : dateRange === "30" ? "month" : "today";
        const [ud, ad, bd, actd] = await Promise.all([
          fetchWebUsageStatsFull(childEmail),
          fetchAlertsFull(childEmail),
          fetchBlockedStatsFull(childEmail),
          fetchActivities(childEmail, timeFrame),
        ]);
        const fallback = generateFallbackSummary(
          child?.name || "Your Child",
          ud.totalTime || "0m",
          ud.usageDetails || [],
          ad.alerts || [],
          bd.blockedList || [],
          actd.activities || [],
          dateRange
        );
        setAISummary(fallback);
        setAIProvider("none");
        toast.info("AI unavailable — showing data summary instead");
      } catch {
        toast.error("Failed to generate summary");
        setAISummary("Unable to generate summary. Please try again.");
      }
    } finally {
      setGeneratingAISummary(false);
    }
  };

  const chartTooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="space-y-4">
      {/* AI Activity Report Summary */}
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base heading-serif flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            AI Activity Report Summary
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Get an AI-powered plain-English analysis of your child's browsing activity
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {showAISummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative rounded-lg border border-border bg-card p-4"
              >
                <button
                  type="button"
                  onClick={() => { setShowAISummary(false); setAISummary(null); }}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
                {generatingAISummary && !aiSummary ? (
                  <div className="flex items-center gap-3 py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                    <span className="text-sm text-muted-foreground">
                      Analyzing {child?.name || "child"}'s activity data...
                    </span>
                  </div>
                ) : aiSummary ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {aiSummary}
                      {generatingAISummary && (
                        <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              {aiProvider === "groq" ? (
                <><span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />Powered by Groq (cloud)</>
              ) : aiProvider === "ollama" ? (
                <><span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />Powered by Ollama (local)</>
              ) : (
                <><span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />Ollama → Groq fallback</>
              )}
            </div>
            <Button 
              onClick={handleGenerateAISummary} 
              disabled={generatingAISummary || !childEmail}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {generatingAISummary ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate AI Report
            </Button>
          </div>
        </CardContent>
      </Card>

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
