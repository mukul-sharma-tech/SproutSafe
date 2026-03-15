import { motion } from "framer-motion";
import { Shield, Eye, Bell } from "lucide-react";

const cards = [
  {
    icon: Shield,
    label: "Content Blocked",
    sublabel: "Harmful site detected",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    delay: 0,
    position: "top-4 -right-4 md:top-8 md:-right-8",
  },
  {
    icon: Eye,
    label: "Incognito Alert",
    sublabel: "Private window opened",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    delay: 0.5,
    position: "bottom-12 -left-4 md:bottom-16 md:-left-8",
  },
  {
    icon: Bell,
    label: "Smart Filter Active",
    sublabel: "AI analyzing content",
    color: "text-primary",
    bg: "bg-primary/10",
    delay: 1.0,
    position: "-bottom-4 right-4 md:bottom-0 md:right-0",
  },
];

export function FloatingCards() {
  return (
    <>
      {cards.map((card, i) => (
        <motion.div
          key={i}
          className={`absolute ${card.position} z-10`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + card.delay, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <motion.div
            className="rounded-xl border bg-card/90 backdrop-blur-md p-3 shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: card.delay,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold whitespace-nowrap">{card.label}</p>
                <p className="text-[10px] text-muted-foreground whitespace-nowrap">{card.sublabel}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </>
  );
}
