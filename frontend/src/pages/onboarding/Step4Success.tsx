import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useOnboardingI18n } from "@/lib/onboarding-i18n";
import type { Lang } from "@/lib/onboarding-i18n";

interface Step4SuccessProps {
  childName: string;
  instructionText: string;
  lang: Lang;
}

export function Step4Success({ childName, instructionText, lang }: Step4SuccessProps) {
  const { t } = useOnboardingI18n(lang);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (hasPlayed.current || typeof window === "undefined" || !window.speechSynthesis) return;
    hasPlayed.current = true;
    const msg = new SpeechSynthesisUtterance(t.step4.audioMessage);
    msg.lang = lang === "hi" ? "hi-IN" : "en-IN";
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
  }, [t.step4.audioMessage, lang]);

  return (
    <div className="space-y-8 text-center">
      <div className="flex justify-center">
        <div className="relative">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
          />
          <CheckCircle2 className="h-24 w-24 text-emerald-500 relative z-10" strokeWidth={2} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontSize: "24px" }}>
          {t.step4.title}
        </h2>
        <p className="text-lg text-foreground/90" style={{ fontSize: "18px" }}>
          {t.step4.message.replace("{name}", childName)}
        </p>
      </div>

      <p className="text-muted-foreground min-h-[1.5rem]" style={{ fontSize: "18px" }}>
        {instructionText}
      </p>

      <Link to="/dashboard" className="block">
        <Button className="w-full h-12 min-h-[48px] text-lg gap-2">
          {t.step4.goToDashboard}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}
