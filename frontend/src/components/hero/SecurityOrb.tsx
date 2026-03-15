import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { SparklesCore } from "@/components/effects/SparklesCore";

function OrbCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    const size = 420;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const center = size / 2;
    const radius = 150;
    let rotation = 0;

    const nodes: { lat: number; lng: number; pulse: number; speed: number }[] = [];
    for (let i = 0; i < 35; i++) {
      nodes.push({
        lat: (Math.random() - 0.5) * Math.PI,
        lng: Math.random() * Math.PI * 2,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.025,
      });
    }

    const projectPoint = (lat: number, lng: number) => {
      const adjustedLng = lng + rotation;
      const x = radius * Math.cos(lat) * Math.sin(adjustedLng);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.cos(adjustedLng);
      const scale = 1 + z / (radius * 3);
      return { x: center + x * scale, y: center - y * scale, z, scale };
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const isDark = document.documentElement.classList.contains("dark");

      // Core glow
      const glow = ctx.createRadialGradient(center, center, 0, center, center, radius * 1.2);
      glow.addColorStop(0, isDark ? "rgba(120, 80, 255, 0.08)" : "rgba(120, 80, 255, 0.10)");
      glow.addColorStop(0.5, isDark ? "rgba(120, 80, 255, 0.03)" : "rgba(120, 80, 255, 0.04)");
      glow.addColorStop(1, "rgba(120, 80, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(center, center, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Concentric rings
      const ringAlpha = isDark ? 0.08 : 0.06;
      for (let i = 0; i < 6; i++) {
        const r = radius * (0.3 + i * 0.14);
        ctx.beginPath();
        ctx.arc(center, center, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${isDark ? "160, 140, 255" : "120, 80, 255"}, ${ringAlpha * (1 - i * 0.12)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 20) {
        const latRad = (lat * Math.PI) / 180;
        ctx.beginPath();
        for (let lng = 0; lng <= 360; lng += 2) {
          const p = projectPoint(latRad, (lng * Math.PI) / 180);
          if (lng === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = isDark ? "rgba(160, 140, 255, 0.05)" : "rgba(120, 80, 255, 0.04)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Longitude lines
      for (let lng = 0; lng < 360; lng += 20) {
        const lngRad = (lng * Math.PI) / 180;
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 2) {
          const p = projectPoint((lat * Math.PI) / 180, lngRad);
          if (lat === -90) {
            ctx.moveTo(p.x, p.y);
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = isDark ? "rgba(160, 140, 255, 0.03)" : "rgba(120, 80, 255, 0.03)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Nodes and connections
      const projected = nodes
        .map((n) => ({ ...n, ...projectPoint(n.lat, n.lng) }))
        .sort((a, b) => a.z - b.z);

      // Connections
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i], b = projected[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 && a.z > -radius * 0.2 && b.z > -radius * 0.2) {
            const alpha = 0.18 * (1 - dist / 100) * Math.min(a.scale, b.scale);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = isDark ? `rgba(140, 120, 255, ${alpha})` : `rgba(120, 80, 255, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      projected.forEach((n) => {
        n.pulse += n.speed;
        const pulseSize = 1 + Math.sin(n.pulse) * 0.4;
        const alpha = n.z > 0 ? 0.8 : 0.15;
        const r = (2.5 + pulseSize) * n.scale;
        const col = isDark ? "180, 160, 255" : "120, 80, 255";

        // Outer glow for front-facing nodes
        if (n.z > radius * 0.3) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${col}, ${alpha * 0.08})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col}, ${alpha})`;
        ctx.fill();
      });

      rotation += 0.0025;
      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ maxWidth: 420, maxHeight: 420 }} />;
}

export function SecurityOrb() {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="h-56 w-56 rounded-full bg-primary/10 blur-[80px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Sparkles layer */}
      <div className="absolute inset-0">
        <SparklesCore particleCount={30} minSize={0.4} maxSize={1.2} speed={0.5} />
      </div>

      {/* Globe */}
      <OrbCanvas />

      {/* Rotating dashed ring */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <div className="h-[340px] w-[340px] rounded-full border border-primary/[0.08] border-dashed" />
      </motion.div>

      {/* Counter-rotating ring */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        <div className="h-[380px] w-[380px] rounded-full border border-primary/[0.04] border-dotted" />
      </motion.div>
    </motion.div>
  );
}
