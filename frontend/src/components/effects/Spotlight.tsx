import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}>
      {/* Left spotlight */}
      <motion.div
        className="absolute -top-40 -left-40"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <svg
          width="560"
          height="1380"
          viewBox="0 0 560 1380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-[0.15] dark:opacity-[0.08]"
        >
          <ellipse
            cx="280"
            cy="690"
            rx="280"
            ry="690"
            fill={`url(#spotlight-left-${fill})`}
          />
          <defs>
            <radialGradient id={`spotlight-left-${fill}`} cx="0" cy="0" r="1" gradientTransform="translate(280 690) scale(280 690)">
              <stop stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="0.5" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Right spotlight */}
      <motion.div
        className="absolute -top-20 -right-40"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
      >
        <svg
          width="480"
          height="1200"
          viewBox="0 0 480 1200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-[0.10] dark:opacity-[0.06]"
        >
          <ellipse
            cx="240"
            cy="600"
            rx="240"
            ry="600"
            fill="url(#spotlight-right)"
          />
          <defs>
            <radialGradient id="spotlight-right" cx="0" cy="0" r="1" gradientTransform="translate(240 600) scale(240 600)">
              <stop stopColor="hsl(262, 83%, 68%)" stopOpacity="0.25" />
              <stop offset="0.6" stopColor="hsl(262, 83%, 58%)" stopOpacity="0.08" />
              <stop offset="1" stopColor="hsl(262, 83%, 58%)" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}

export function MouseSpotlight({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };
    const el = containerRef.current;
    el?.addEventListener("mousemove", handleMove);
    return () => el?.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className={cn("absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="pointer-events-none absolute h-[500px] w-[500px] rounded-full"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, rgba(120,80,255,0.06) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
