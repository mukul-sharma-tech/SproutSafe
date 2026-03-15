import { useState, useCallback } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioButtonProps {
  text: string;
  lang?: "en" | "hi";
  className?: string;
  "aria-label"?: string;
}

export function AudioButton({ text, lang = "en", className, "aria-label": ariaLabel }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [text, lang, isPlaying]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={speak}
      disabled={isPlaying}
      aria-label={ariaLabel ?? "Read aloud"}
      className={cn(
        "h-12 w-12 rounded-full border-2 border-primary/30 bg-background hover:bg-primary/10 min-w-[48px]",
        className
      )}
    >
      <Volume2 className={cn("h-6 w-6 text-primary", isPlaying && "animate-pulse")} />
    </Button>
  );
}
