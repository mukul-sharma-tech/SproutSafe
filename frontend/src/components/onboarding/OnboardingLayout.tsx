import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";
import { AudioButton } from "./AudioButton";
import { LanguageToggle, type OnboardingLang } from "./LanguageToggle";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  instructionText: string;
  lang: OnboardingLang;
  onLangChange: (lang: OnboardingLang) => void;
}

export function OnboardingLayout({ children, instructionText, lang, onLangChange }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <Sprout className="h-4 w-4" aria-hidden />
          </div>
          <span className="text-xl font-bold">CyberNest</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle lang={lang} onLangChange={onLangChange} />
          <AudioButton text={instructionText} lang={lang} aria-label="Read instructions aloud" />
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-8">{children}</main>
    </div>
  );
}

