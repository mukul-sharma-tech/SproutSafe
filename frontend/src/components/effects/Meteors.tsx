import { cn } from "@/lib/utils";

interface MeteorsProps {
  count?: number;
  className?: string;
}

export function Meteors({ count = 12, className }: MeteorsProps) {
  const meteors = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${Math.random() * 2 + 2}s`,
    size: Math.random() * 1 + 0.5,
  }));

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {meteors.map((m) => (
        <span
          key={m.id}
          className="absolute animate-meteor"
          style={{
            top: "-5%",
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        >
          <span
            className="block rounded-full bg-gradient-to-b from-primary/60 to-transparent"
            style={{
              width: `${m.size}px`,
              height: `${60 + Math.random() * 80}px`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
