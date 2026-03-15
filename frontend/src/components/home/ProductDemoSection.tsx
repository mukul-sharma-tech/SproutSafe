import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, ShieldCheck, ShieldX, Globe, Clock, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

function ActivityRow({ domain, time, status, category, delay }: {
  domain: string;
  time: string;
  status: "safe" | "blocked";
  category: string;
  delay: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const isSafe = status === "safe";
  return (
    <motion.div
      ref={ref}
      className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/40 transition-colors"
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay, ease }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {isSafe
          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
        }
        <div className="min-w-0">
          <span className="text-sm font-medium block truncate">{domain}</span>
          <span className="text-[11px] text-muted-foreground">{category}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground">{time}</span>
        <span className={cn(
          "text-[11px] font-semibold px-2.5 py-0.5 rounded-full",
          isSafe ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
        )}>
          {isSafe ? "Allowed" : "Blocked"}
        </span>
      </div>
    </motion.div>
  );
}

const activityData = [
  { domain: "khanacademy.org", time: "2m ago", status: "safe" as const, category: "Education" },
  { domain: "porn-site.example.com", time: "5m ago", status: "blocked" as const, category: "Adult Content" },
  { domain: "youtube.com/education", time: "8m ago", status: "safe" as const, category: "Video" },
  { domain: "gambling-site.example.com", time: "12m ago", status: "blocked" as const, category: "Gambling" },
  { domain: "wikipedia.org", time: "15m ago", status: "safe" as const, category: "Reference" },
  { domain: "violence-forum.example.com", time: "18m ago", status: "blocked" as const, category: "Violence" },
  { domain: "google.com/search", time: "22m ago", status: "safe" as const, category: "Search" },
  { domain: "phishing-scam.example.com", time: "25m ago", status: "blocked" as const, category: "Phishing" },
];

export function ProductDemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const safeCount = activityData.filter(a => a.status === "safe").length;
  const blockedCount = activityData.filter(a => a.status === "blocked").length;

  return (
    <section id="product-demo" ref={ref} className="relative py-28 px-6 overflow-hidden">
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground mb-5">
            Dashboard
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.02em] mb-4">
            See what gets through. And what doesn't.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Every visited site is classified and shown to you in real-time.
          </p>
        </motion.div>

        <motion.div
          className="relative mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease }}
        >
          {/* Browser chrome */}
          <div className="rounded-2xl border border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl shadow-black/5 dark:shadow-black/25 overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-1 rounded-md bg-background/60 border border-border/30 text-xs text-muted-foreground w-full max-w-xs">
                  <Lock className="h-3 w-3 text-emerald-500" />
                  dashboard.sproutsafe.io
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6 space-y-5">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]"
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2, ease }}
                >
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{safeCount}</p>
                    <p className="text-xs text-muted-foreground">Sites allowed</p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/[0.04]"
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.28, ease }}
                >
                  <ShieldX className="h-5 w-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{blockedCount}</p>
                    <p className="text-xs text-muted-foreground">Sites blocked</p>
                  </div>
                </motion.div>
              </div>

              {/* Activity log */}
              <div className="rounded-xl border border-border/40 bg-background/50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                  <span className="text-sm font-medium">Browsing Activity</span>
                  <span className="text-xs text-primary flex items-center gap-0.5 cursor-pointer hover:underline">
                    View all <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
                <div className="divide-y divide-border/20 px-1">
                  {activityData.map((row, i) => (
                    <ActivityRow
                      key={row.domain}
                      {...row}
                      delay={0.35 + i * 0.06}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -inset-8 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-3xl blur-3xl -z-10 opacity-50" />
        </motion.div>
      </div>
    </section>
  );
}
