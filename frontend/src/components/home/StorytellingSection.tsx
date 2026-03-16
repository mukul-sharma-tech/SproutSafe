import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ScanSearch, Lock, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function StorytellingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-28 px-6 overflow-hidden">
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground mb-5">
            How it works under the hood
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.02em] mb-4">
            Protection without the creepiness
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Most parental tools spy on everything. We took a different approach.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            className={cn(
              "relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-8",
              "overflow-hidden transition-all duration-300 hover:border-primary/15 hover:shadow-xl hover:shadow-primary/[0.04]"
            )}
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/15">
                  <ScanSearch className="h-5 w-5 text-violet-500" />
                </div>
                <h3 className="text-lg font-semibold">Content scanning</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                The extension scans page content—images, text, URLs—and checks it
                against known threat databases and content classifiers. Harmful content
                gets blurred or blocked before it loads. No keyword blacklists that
                break half the internet.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Image scanning", "URL classification", "Text filtering", "Real-time"].map((tag) => (
                  <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className={cn(
              "relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-8",
              "overflow-hidden transition-all duration-300 hover:border-primary/15 hover:shadow-xl hover:shadow-primary/[0.04]"
            )}
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25, ease }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                  <Fingerprint className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold">Your child's privacy, respected</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                We don't log keystrokes or read private messages. Your child can see
                exactly what's being monitored. Browsing data stays encrypted on our
                servers and is never shared or sold. Period.
              </p>
              <div className="flex flex-wrap gap-2">
                {["No keylogging", "Encrypted data", "Transparent to kids", "COPPA compliant"].map((tag) => (
                  <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

