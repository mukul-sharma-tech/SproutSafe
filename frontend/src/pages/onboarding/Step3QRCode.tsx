import { useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Smartphone, Monitor } from "lucide-react";
import { useOnboardingI18n } from "@/lib/onboarding-i18n";

interface Step3QRCodeProps {
  token: string;
  childName: string;
  onNext: () => void;
  instructionText: string;
  lang: "en" | "hi";
}

export function Step3QRCode({ token, childName, onNext, instructionText, lang }: Step3QRCodeProps) {
  const { t } = useOnboardingI18n(lang);
  const audioRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-lg text-foreground/90 min-h-[1.5rem]" style={{ fontSize: "18px" }}>
        {instructionText}
      </p>

      <div className="flex justify-center p-6 bg-white rounded-2xl border-2 border-border">
        <QRCodeSVG value={token} size={220} level="M" includeMargin />
      </div>

      <div className="flex justify-center gap-8 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <Smartphone className="h-10 w-10" />
          <span className="text-sm" style={{ fontSize: "18px" }}>Phone</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Monitor className="h-10 w-10" />
          <span className="text-sm" style={{ fontSize: "18px" }}>Screen</span>
        </div>
      </div>

      <p className="text-center text-foreground font-medium" style={{ fontSize: "18px" }}>
        {t.step3.scanInstruction}
      </p>

      <Button type="button" onClick={onNext} className="w-full h-12 min-h-[48px] text-lg">
        {t.step3.continue}
      </Button>
    </div>
  );
}
