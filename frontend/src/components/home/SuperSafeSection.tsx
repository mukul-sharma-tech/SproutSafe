import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldAlert, Volume2, LayoutDashboard, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

function MockBlockedCard({ delay }: { delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 space-y-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease }}
    >
      <div className="flex items-center gap-2">
        <Ban className="h-4 w-4 text-red-500" />
        <span className="text-sm font-semibold text-red-600 dark:text-red-400">Site Blocked</span>
      </div>
      <div className="rounded-lg bg-background/60 border border-border/30 px-3 py-2">
        <p className="text-xs text-muted-foreground font-mono">gambling-site.example.com</p>
      </div>
      <p className="text-xs text-muted-foreground">This website was blocked by SuperSafe Mode.</p>
    </motion.div>
  );
}

function MockVoiceCard({ delay }: { delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 space-y-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease }}
    >
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-primary">Voice Warning</span>
      </div>
      <div className="flex gap-1 items-end h-8">
        {[3, 5, 8, 12, 8, 14, 10, 6, 9, 12, 7, 4, 8, 11, 6].map((h, i) => (
          <motion.div
            key={i}
            className="w-1.5 rounded-full bg-primary/40"
            animate={{ height: [h, h * 1.6, h] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }}
            style={{ height: h }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground italic">"This page isn't safe. Heading back now."</p>
    </motion.div>
  );
}

function MockControlCard({ delay }: { delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 space-y-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease }}
    >
      <div className="flex items-center gap-2">
        <LayoutDashboard className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Parent Controls</span>
      </div>
      <div className="space-y-2">
        {[
          { label: "Strict Blocking", on: true },
          { label: "Voice Warnings", on: true },
          { label: "Incognito Lock", on: false },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <div className={cn(
              "h-5 w-9 rounded-full transition-colors flex items-center px-0.5",
              item.on ? "bg-emerald-500" : "bg-muted"
            )}>
              <div className={cn(
                "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                item.on && "translate-x-4"
              )} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function SuperSafeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="super-safe" ref={ref} className="relative py-28 px-6 overflow-hidden">
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 mb-5">
            <ShieldAlert className="h-3.5 w-3.5" />
            SuperSafe Mode
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.02em] mb-4">
            For when you need the strictest settings
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Voice warnings, hard blocking, and full oversight—all toggleable from your dashboard.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <MockBlockedCard delay={0.15} />
          <MockVoiceCard delay={0.25} />
          <MockControlCard delay={0.35} />
        </div>
      </div>
    </section>
  );
}
