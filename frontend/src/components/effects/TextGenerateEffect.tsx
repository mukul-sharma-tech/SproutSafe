import { useEffect, useRef } from "react";
import { motion, useInView, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
}

export function TextGenerateEffect({ words, className, duration = 0.3 }: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { once: true });
  const wordArray = words.split(" ");

  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        { opacity: 1, filter: "blur(0px)" },
        { duration, delay: stagger(0.05) }
      );
    }
  }, [isInView, animate, duration]);

  return (
    <motion.p ref={scope} className={cn(className)}>
      {wordArray.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block mr-[0.3em]"
          style={{ opacity: 0, filter: "blur(6px)" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}
