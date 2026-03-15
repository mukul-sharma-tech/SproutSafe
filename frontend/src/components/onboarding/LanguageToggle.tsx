import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type OnboardingLang = "en" | "hi";

interface LanguageToggleProps {
  lang: OnboardingLang;
  onLangChange: (lang: OnboardingLang) => void;
  className?: string;
}

const labels = { en: "English", hi: "हिंदी" };

export function LanguageToggle({ lang, onLangChange, className }: LanguageToggleProps) {
  return (
    <div className={cn("flex rounded-lg border-2 border-primary/20 p-0.5", className)} role="group" aria-label="Language">
      {(["en", "hi"] as const).map((l) => (
        <Button
          key={l}
          type="button"
          variant={lang === l ? "default" : "ghost"}
          size="sm"
          onClick={() => onLangChange(l)}
          className={cn(
            "min-h-[44px] min-w-[80px] text-base font-medium",
            lang === l && "shadow-sm"
          )}
          aria-pressed={lang === l}
        >
          {labels[l]}
        </Button>
      ))}
    </div>
  );
}
