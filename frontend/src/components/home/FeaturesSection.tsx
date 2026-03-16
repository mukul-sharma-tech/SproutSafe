import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  type LucideIcon,
  Image,
  Link as LinkIcon,
  MessageSquare,
  Eye,
  Search,
  Clock,
  Grid3X3,
  Bell,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  span?: string;
}[] = [
  {
    icon: Image,
    title: "Content Filtering",
    description: "Blurs inappropriate images and videos in real-time before your child sees them.",
    accent: "from-violet-500/20 to-fuchsia-500/10",
    span: "md:col-span-2",
  },
  {
    icon: LinkIcon,
    title: "URL Blocking",
    description: "Blocks unsafe websites. Educational sites stay accessible.",
    accent: "from-cyan-500/20 to-blue-500/10",
  },
  {
    icon: MessageSquare,
    title: "Text Analysis",
    description: "Flags bullying, profanity, and grooming language in conversations.",
    accent: "from-pink-500/20 to-rose-500/10",
  },
  {
    icon: Eye,
    title: "Incognito Detection",
    description: "Notifies you when private browsing is opened to bypass monitoring.",
    accent: "from-amber-500/20 to-orange-500/10",
  },
  {
    icon: Search,
    title: "Search Tracking",
    description: "See what your child searches for and which pages they visit.",
    accent: "from-emerald-500/20 to-teal-500/10",
    span: "md:col-span-2",
  },
  {
    icon: Clock,
    title: "Time Limits",
    description: "Set screen time caps per site category or specific domains.",
    accent: "from-blue-500/20 to-indigo-500/10",
  },
  {
    icon: Grid3X3,
    title: "Site Classification",
    description: "Auto-sorts visited sites into education, gaming, social media, etc.",
    accent: "from-purple-500/20 to-violet-500/10",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Get notified the moment something risky happens.",
    accent: "from-red-500/20 to-pink-500/10",
  },
  {
    icon: Lock,
    title: "No Spying",
    description: "No keylogging. No conversation recording. Your child knows what's monitored, and their data stays private.",
    accent: "from-green-500/20 to-emerald-500/10",
    span: "md:col-span-2",
  },
];

function BentoCard({
  icon: Icon,
  title,
  description,
  accent,
  span,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  span?: string;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn("group relative", span)}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
    >
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-2xl border border-border/50 p-6",
          "bg-card/60 backdrop-blur-sm",
          "transition-all duration-300",
          "hover:border-primary/20 hover:shadow-xl hover:shadow-primary/[0.04]",
          "hover:-translate-y-0.5"
        )}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--primary)/0.06), transparent 60%)`,
          }}
        />
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", accent)} />

        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.08] border border-primary/10 mb-4 transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-105 group-hover:border-primary/20">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-[15px] font-semibold mb-1.5 tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="relative py-28 px-6">
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground mb-5">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.02em] mb-4">
            Everything your family needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Nine layers of protection. No gimmicks. No spying.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {features.map((f) => (
            <BentoCard key={f.title} {...f} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

