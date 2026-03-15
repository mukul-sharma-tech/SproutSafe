import { motion } from "framer-motion";

export function HeroGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dot grid pattern - more refined than lines */}
      <div
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 0.5px, transparent 0.5px)`,
          backgroundSize: "24px 24px",
        }}
      />
      {/* Radial fade from center */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 40%, transparent 0%, hsl(var(--background)) 100%)`,
        }}
      />
    </div>
  );
}

export function HeroGlow() {
  return (
    <>
      {/* Primary glow - top left */}
      <motion.div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(262 83% 58% / 0.25) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Violet glow - top right */}
      <motion.div
        className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10"
        style={{
          background: "radial-gradient(circle, hsl(280 80% 60% / 0.2) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.15, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Cyan accent - bottom center */}
      <motion.div
        className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20 dark:opacity-10"
        style={{
          background: "radial-gradient(ellipse, hsl(200 80% 60% / 0.12) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </>
  );
}

export function AnimatedBeams() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { left: "15%", height: "55%", color: "primary", delay: 0, opacity: 0.15 },
        { left: "35%", height: "75%", color: "primary", delay: 1, opacity: 0.08 },
        { left: "55%", height: "45%", color: "violet-500", delay: 2, opacity: 0.10 },
        { left: "75%", height: "65%", color: "primary", delay: 0.5, opacity: 0.06 },
        { left: "90%", height: "50%", color: "cyan-500", delay: 1.5, opacity: 0.05 },
      ].map((beam, i) => (
        <motion.div
          key={i}
          className="absolute top-0 w-px"
          style={{
            left: beam.left,
            height: beam.height,
            background: `linear-gradient(to bottom, hsl(var(--${beam.color === "primary" ? "primary" : beam.color})) 0%, transparent 100%)`,
            opacity: 0,
          }}
          animate={{
            opacity: [0, beam.opacity, 0],
            scaleY: [0, 1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: beam.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function AuroraGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-0 left-0 w-full h-full opacity-[0.04] dark:opacity-[0.06] animate-aurora"
        style={{
          background: "linear-gradient(-45deg, hsl(262 83% 58% / 0.3), hsl(280 80% 60% / 0.2), hsl(200 80% 60% / 0.15), hsl(262 83% 58% / 0.25))",
          backgroundSize: "400% 400%",
        }}
      />
    </div>
  );
}
