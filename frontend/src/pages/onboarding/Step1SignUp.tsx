import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Lock, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { useOnboardingI18n } from "@/lib/onboarding-i18n";
import { cn } from "@/lib/utils";

export type SignUpData = {
  name: string;
  phone: string;
  otp: string;
  email: string;
  password: string;
  useAdvanced: boolean;
};

interface Step1SignUpProps {
  data: SignUpData;
  onChange: (data: Partial<SignUpData>) => void;
  onNext: () => void;
  isLoading: boolean;
  instructionText: string;
  lang: "en" | "hi";
}

export function Step1SignUp({ data, onChange, onNext, isLoading, instructionText, lang }: Step1SignUpProps) {
  const { t } = useOnboardingI18n(lang);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleSendOtp = () => {
    if (data.phone.replace(/\D/g, "").length >= 10) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = () => {
    if (data.otp.length >= 4) {
      setOtpVerified(true);
    }
  };

  const canProceedPhone = data.name.trim() && data.phone.replace(/\D/g, "").length >= 10 && otpVerified && data.password.length >= 6;
  const canProceedAdvanced = data.name.trim() && data.email.trim() && data.password.length >= 6;

  return (
    <div className="space-y-6">
      <p className="text-lg text-foreground/90 min-h-[1.5rem]" style={{ fontSize: "18px" }}>
        {instructionText}
      </p>

      {!data.useAdvanced ? (
        <>
          <div className="space-y-3">
            <Label htmlFor="name" className="flex items-center gap-2 text-base" style={{ fontSize: "18px" }}>
              <User className="h-5 w-5 text-primary" aria-hidden />
              {t.step1.nameLabel}
            </Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={t.step1.namePlaceholder}
              className="h-12 text-lg min-h-[48px]"
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="phone" className="flex items-center gap-2 text-base" style={{ fontSize: "18px" }}>
              <Phone className="h-5 w-5 text-primary" aria-hidden />
              {t.step1.phoneLabel}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, "").slice(0, 15) })}
              placeholder={t.step1.phonePlaceholder}
              className="h-12 text-lg min-h-[48px]"
              disabled={isLoading}
            />
          </div>

          {otpSent && (
            <div className="space-y-3">
              <Label htmlFor="otp" className="flex items-center gap-2 text-base" style={{ fontSize: "18px" }}>
                {t.step1.otpLabel}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  value={data.otp}
                  onChange={(e) => onChange({ otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  placeholder="000000"
                  className="h-12 text-lg min-h-[48px] flex-1 text-center tracking-[0.5em]"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVerifyOtp}
                  disabled={data.otp.length < 4 || isLoading}
                  className="h-12 min-h-[48px] shrink-0"
                >
                  {t.step1.verifyOtp}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{t.step1.otpHint}</p>
            </div>
          )}

          {!otpSent && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSendOtp}
              disabled={!data.phone.replace(/\D/g, "").match(/^\d{10,15}$/) || isLoading}
              className="w-full h-12 min-h-[48px]"
            >
              {t.step1.sendOtp}
            </Button>
          )}

          {otpVerified && (
            <div className="space-y-3">
              <Label htmlFor="password" className="flex items-center gap-2 text-base" style={{ fontSize: "18px" }}>
                <Lock className="h-5 w-5 text-primary" aria-hidden />
                {t.step1.passwordLabel}
              </Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => onChange({ password: e.target.value })}
                placeholder={t.step1.passwordPlaceholder}
                className="h-12 text-lg min-h-[48px]"
                disabled={isLoading}
                minLength={6}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="space-y-3">
            <Label htmlFor="name-adv" className="flex items-center gap-2 text-base" style={{ fontSize: "18px" }}>
              <User className="h-5 w-5 text-primary" aria-hidden />
              {t.step1.nameLabel}
            </Label>
            <Input
              id="name-adv"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={t.step1.namePlaceholder}
              className="h-12 text-lg min-h-[48px]"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="email" className="flex items-center gap-2 text-base" style={{ fontSize: "18px" }}>
              <Mail className="h-5 w-5 text-primary" aria-hidden />
              {t.step1.emailLabel}
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder={t.step1.emailPlaceholder}
              className="h-12 text-lg min-h-[48px]"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password-adv" className="flex items-center gap-2 text-base" style={{ fontSize: "18px" }}>
              <Lock className="h-5 w-5 text-primary" aria-hidden />
              {t.step1.passwordLabel}
            </Label>
            <Input
              id="password-adv"
              type="password"
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
              placeholder={t.step1.passwordPlaceholder}
              className="h-12 text-lg min-h-[48px]"
              disabled={isLoading}
              minLength={6}
            />
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => onChange({ useAdvanced: !data.useAdvanced })}
        className="flex items-center gap-2 text-sm text-primary hover:underline w-full justify-center py-2"
      >
        {data.useAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {data.useAdvanced ? t.step1.hideAdvanced : t.step1.showAdvanced}
      </button>

      <Button
        type="button"
        onClick={onNext}
        disabled={(!data.useAdvanced ? !canProceedPhone : !canProceedAdvanced) || isLoading}
        className="w-full h-12 min-h-[48px] text-lg"
      >
        {isLoading ? t.common.loading : t.step1.continue}
      </Button>
    </div>
  );
}
