import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChildren, useWebUsageStatsFull, useAlertsFull, useBlockedStatsFull } from "@/hooks/use-children";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface AIParentingChatProps {
  childEmail: string | null;
  childName: string | null;
}

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";

const SUGGESTION_CHIPS = [
  "Is my child's screen time healthy?",
  "What sites should I block for a 10-year-old?",
  "Any concerning activity today?",
  "Tips for safer browsing?",
];

function buildActivityContext(
  childName: string | null,
  usageData: any,
  alertsData: any,
  blockedData: any
): string {
  const usage = usageData?.usageDetails ?? [];
  const alerts = alertsData?.alerts ?? [];
  const blocked = blockedData?.blockedList ?? [];
  const totalTime = usageData?.totalTime ?? "0m";

  const topSites = usage
    .slice(0, 10)
    .map((u: any) => {
      const totalSeconds = Object.values(u.dailyTimeSpent || {}).reduce(
        (sum: number, val: unknown) => sum + (typeof val === "number" ? val : 0),
        0
      ) as number;
      const mins = Math.round(totalSeconds / 60);
      return `- ${u.domain} (${u.category || "Unknown"}, ${mins}min total)`;
    })
    .join("\n");

  const recentAlerts = alerts
    .slice(0, 5)
    .map((a: any) => `- ${a.url} at ${new Date(a.timestamp).toLocaleString()}`)
    .join("\n");

  const blockedSites = blocked.slice(0, 10).map((b: any) => `- ${b.domain}`).join("\n");

  return `
CHILD ACTIVITY DATA for ${childName || "this child"}:
Total screen time: ${totalTime}

Top visited sites:
${topSites || "No data available"}

Recent incognito/alert events:
${recentAlerts || "No alerts"}

Currently blocked sites:
${blockedSites || "None blocked"}
`.trim();
}

export function AIParentingChat({ childEmail, childName }: AIParentingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: children = [] } = useChildren();
  const { data: usageData } = useWebUsageStatsFull(childEmail);
  const { data: alertsData } = useAlertsFull(childEmail);
  const { data: blockedData } = useBlockedStatsFull(childEmail);

  const child = children.find((c) => c.email === childEmail);
  const displayName = child?.name || childName || "your child";

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed, timestamp: new Date() },
    ]);
    setInputText("");
    setIsThinking(true);

    try {
      const activityContext = buildActivityContext(
        displayName,
        usageData,
        alertsData,
        blockedData
      );

      const systemPrompt = `You are an AI parenting assistant for CyberNest, a child safety app. 
You help parents understand their child's digital activity and provide thoughtful, practical advice.
Be warm, supportive, and concise. Keep responses under 4 sentences unless more detail is needed.
Always base your answers on the actual activity data provided below when relevant.

${activityContext}

Guidelines:
- If asked about screen time, analyze the actual usage data
- If asked about blocking recommendations, consider the child's current browsing patterns
- Provide specific, actionable advice
- Be encouraging and non-judgmental
- If data is missing, acknowledge it and provide general advice`;

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3",
          prompt: `${systemPrompt}\n\nParent's question: ${trimmed}\n\nAssistant:`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply =
        data?.response?.trim() ||
        "Sorry, I couldn't generate a response right now. Please try again.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: reply, timestamp: new Date() },
      ]);
    } catch (err) {
      console.error("AI Chat error:", err);
      toast.error("Couldn't connect to AI. Make sure Ollama is running.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I'm having trouble connecting right now. Please make sure Ollama is running locally and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow"
        title="AI Parenting Insights"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center">
          <Sparkles className="h-3 w-3" />
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[160px] right-6 z-40 w-[380px] max-h-[500px] rounded-2xl shadow-2xl bg-card border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-sm">Parenting Insights</span>
                  <p className="text-[10px] text-muted-foreground">
                    AI powered by {displayName}'s activity
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* No child selected warning */}
            {!childEmail && (
              <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
                Select a child profile for personalized insights
              </div>
            )}

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[300px]">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Sparkles className="h-8 w-8 text-emerald-500 mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Ask me anything about {displayName}'s digital habits
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTION_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSend(chip)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <p className="text-[10px] mt-1 opacity-60">
                      {m.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="max-w-[60%] rounded-2xl px-4 py-3 bg-muted rounded-bl-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
                      <span className="text-xs text-muted-foreground">Analyzing activity...</span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input row */}
            <div className="border-t border-border px-3 py-2 flex items-center gap-2 bg-muted/30">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(inputText);
                  }
                }}
                placeholder="Ask about screen time, sites to block..."
                className="flex-1 h-10 px-3 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                disabled={isThinking}
              />
              <Button
                size="icon"
                onClick={() => handleSend(inputText)}
                disabled={!inputText.trim() || isThinking}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

