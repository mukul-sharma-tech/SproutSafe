import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { useOnboardingI18n } from "@/lib/onboarding-i18n";
import type { Lang } from "@/lib/onboarding-i18n";

export type AgeGroup = "6-10" | "11-14" | "15-18";

export type AddChildData = {
  childName: string;
  ageGroup: AgeGroup | null;
};

const AGE_OPTIONS: { value: AgeGroup; icon: string; labelEn: string; labelHi: string }[] = [
  { value: "6-10", icon: "🧒", labelEn: "6-10 years", labelHi: "६-१० वर्ष" },
  { value: "11-14", icon: "👦", labelEn: "11-14 years", labelHi: "११-१४ वर्ष" },
  { value: "15-18", icon: "👨", labelEn: "15-18 years", labelHi: "१५-१८ वर्ष" },
];

interface Step2AddChildProps {
  data: AddChildData;
  onChange: (data: Partial<AddChildData>) => void;
  onNext: () => void;
  isLoading: boolean;
  instructionText: string;
  lang: Lang;
}

export function Step2AddChild({ data, onChange, onNext, isLoading, instructionText, lang }: Step2AddChildProps) {
  const { t } = useOnboardingI18n(lang);

  const canProceed = data.childName.trim().length >= 2 && data.ageGroup !== null;

  return (
    <div className="space-y-6">
      <p className="text-lg text-foreground/90 min-h-[1.5rem]" style={{ fontSize: "18px" }}>
        {instructionText}
      </p>

      <div className="space-y-3">
        <Label htmlFor="childName" className="flex items-center gap-2 text-base" style={{ fontSize: "18px" }}>
          <User className="h-5 w-5 text-primary" aria-hidden />
          {t.step2.childNameLabel}
        </Label>
        <Input
          id="childName"
          value={data.childName}
          onChange={(e) => onChange({ childName: e.target.value })}
          placeholder={t.step2.childNamePlaceholder}
          className="h-12 text-lg min-h-[48px]"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-base" style={{ fontSize: "18px" }}>
          {t.step2.ageGroupLabel}
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {AGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ageGroup: opt.value })}
              className={`
                flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 min-h-[80px]
                transition-all duration-200
                ${data.ageGroup === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 bg-card"
                }
              `}
            >
              <span className="text-3xl" role="img" aria-label={lang === "hi" ? opt.labelHi : opt.labelEn}>
                {opt.icon}
              </span>
              <span className="text-base font-medium" style={{ fontSize: "18px" }}>
                {lang === "hi" ? opt.labelHi : opt.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Button
        type="button"
        onClick={onNext}
        disabled={!canProceed || isLoading}
        className="w-full h-12 min-h-[48px] text-lg"
      >
        {isLoading ? t.common.loading : t.step2.continue}
      </Button>
    </div>
  );
}
