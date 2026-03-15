import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Award, Users, Star } from "lucide-react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { icon: Users, value: 10000, suffix: "+", label: "Families protected", color: "text-primary" },
  { icon: Shield, value: 50, suffix: "M+", label: "Pages scanned", color: "text-emerald-500" },
  { icon: Star, value: 4, suffix: ".9", label: "Parent rating", color: "text-amber-500" },
  { icon: Award, value: 99, suffix: ".9%", label: "Uptime", color: "text-cyan-500" },
];

export function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-20 px-6 border-y border-border/30 overflow-hidden">
      <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10" />
      <div className="relative mx-auto max-w-6xl">
        <motion.p
          className="text-center text-sm font-medium text-muted-foreground tracking-widest uppercase mb-12"
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 0.7, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Trusted by families across 40+ countries
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="relative text-center group"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
            >
              <div className="flex justify-center mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/50 shadow-sm">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-bold tracking-tight mb-1">
                {stat.suffix === ".9" || stat.suffix === ".9%" ? (
                  <><AnimatedCounter target={stat.value} />{stat.suffix}</>
                ) : (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                )}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
