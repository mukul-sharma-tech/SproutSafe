import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SparklesCoreProps {
  className?: string;
  particleCount?: number;
  particleColor?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
}

export function SparklesCore({
  className,
  particleCount = 50,
  particleColor,
  minSize = 0.6,
  maxSize = 1.4,
  speed = 1,
}: SparklesCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.width / dpr;
    const h = () => canvas.height / dpr;

    interface Particle {
      x: number;
      y: number;
      size: number;
      alpha: number;
      alphaSpeed: number;
      vx: number;
      vy: number;
    }

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * (w() || 400),
      y: Math.random() * (h() || 400),
      size: Math.random() * (maxSize - minSize) + minSize,
      alpha: Math.random(),
      alphaSpeed: (Math.random() * 0.02 + 0.005) * speed,
      vx: (Math.random() - 0.5) * 0.15 * speed,
      vy: (Math.random() - 0.5) * 0.15 * speed,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, w(), h());
      const isDark = document.documentElement.classList.contains("dark");
      const color = particleColor || (isDark ? "200, 180, 255" : "120, 80, 255");

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaSpeed;

        if (p.alpha >= 1 || p.alpha <= 0) {
          p.alphaSpeed *= -1;
        }
        p.alpha = Math.max(0, Math.min(1, p.alpha));

        if (p.x < 0) p.x = w();
        if (p.x > w()) p.x = 0;
        if (p.y < 0) p.y = h();
        if (p.y > h()) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.alpha * 0.8})`;
        ctx.fill();

        if (p.alpha > 0.6) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${p.alpha * 0.1})`;
          ctx.fill();
        }
      });

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [particleCount, particleColor, minSize, maxSize, speed]);

  useEffect(() => {
    const cleanup = draw();
    return cleanup;
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
