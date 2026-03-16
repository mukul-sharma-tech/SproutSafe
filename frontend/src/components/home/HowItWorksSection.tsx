import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Download, Sliders, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  {
    num: "01",
    icon: Download,
    title: "Install the Extension",
    desc: "One click to add CyberNest to Chrome. Takes under 30 seconds.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    num: "02",
    icon: Sliders,
    title: "Set Your Preferences",
    desc: "Choose protection levels, time limits, and how you want to be notified.",
    accent: "from-cyan-500 to-blue-600",
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "Protection is Live",
    desc: "Your child browses safely. You get insights and alerts in real-time.",
    accent: "from-emerald-500 to-teal-600",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="relative py-28 px-6">
      <div className="relative mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground mb-5">
            Setup
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.02em] mb-4">
            Three steps, five minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Install the extension, configure your settings, done.
          </p>
        </motion.div>

        <div className="relative space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[56px] left-[17%] right-[17%] h-px">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-border to-transparent"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="relative"
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease }}
            >
              <div className={cn(
                "relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-7 text-center",
                "transition-all duration-300 hover:border-primary/15 hover:shadow-xl hover:shadow-primary/[0.04] hover:-translate-y-0.5"
              )}>
                {/* Step number badge */}
                <div className="flex justify-center mb-5">
                  <div className={cn(
                    "relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                    step.accent
                  )}>
                    <step.icon className="h-6 w-6" />
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border text-[11px] font-bold text-foreground">
                      {step.num}
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <Link to="/dashboard">
            <Button size="lg" className="group shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-shadow">
              Try The Dashboard
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

