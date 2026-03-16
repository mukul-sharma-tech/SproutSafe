import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Step1SignUp, type SignUpData } from "./Step1SignUp";
import { Step2AddChild, type AddChildData } from "./Step2AddChild";
import { Step3QRCode } from "./Step3QRCode";
import { Step4Success } from "./Step4Success";
import { signup } from "@/api/auth";
import { addChild } from "@/api/children";
import { useOnboardingI18n } from "@/lib/onboarding-i18n";
import type { OnboardingLang } from "@/components/onboarding/LanguageToggle";
import { toast } from "sonner";

function slug(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<OnboardingLang>("en");
  const [signUpData, setSignUpData] = useState<SignUpData>({
    name: "",
    phone: "",
    otp: "",
    email: "",
    password: "",
    useAdvanced: false,
  });
  const [addChildData, setAddChildData] = useState<AddChildData>({
    childName: "",
    ageGroup: null,
  });
  const [childToken, setChildToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useOnboardingI18n(lang);

  const handleStep1Next = async () => {
    setIsLoading(true);
    try {
      const email = signUpData.useAdvanced
        ? signUpData.email
        : `p${signUpData.phone.replace(/\D/g, "")}@CyberNest.local`;
      const { token } = await signup({
        name: signUpData.name,
        email,
        password: signUpData.password,
      });
      localStorage.setItem("token", token);
      toast.success("Account created!");
      setStep(2);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Next = async () => {
    setIsLoading(true);
    try {
      const childEmail = `c${Date.now()}_${slug(addChildData.childName)}@CyberNest.local`;
      const { token } = await addChild({
        name: addChildData.childName,
        email: childEmail,
      });
      setChildToken(token);
      toast.success("Child added!");
      setStep(3);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to add child. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Next = () => setStep(4);

  const instructions: Record<number, string> = {
    1: t.step1.subtitle,
    2: t.step2.subtitle,
    3: t.step3.subtitle,
    4: t.step4.message.replace("{name}", addChildData.childName || ""),
  };

  return (
    <OnboardingLayout
      instructionText={instructions[step]}
      lang={lang}
      onLangChange={setLang}
    >
      <div className="space-y-6">
        {step === 1 && <h1 className="text-2xl font-bold" style={{ fontSize: "24px" }}>{t.step1.title}</h1>}
        {step === 2 && <h1 className="text-2xl font-bold" style={{ fontSize: "24px" }}>{t.step2.title}</h1>}
        {step === 3 && <h1 className="text-2xl font-bold" style={{ fontSize: "24px" }}>{t.step3.title}</h1>}
        {step === 4 && null}
        {step === 1 && (
          <Step1SignUp
            data={signUpData}
            onChange={(d) => setSignUpData((prev) => ({ ...prev, ...d }))}
            onNext={handleStep1Next}
            isLoading={isLoading}
            instructionText={instructions[1]}
            lang={lang}
          />
        )}
        {step === 2 && (
          <Step2AddChild
            data={addChildData}
            onChange={(d) => setAddChildData((prev) => ({ ...prev, ...d }))}
            onNext={handleStep2Next}
            isLoading={isLoading}
            instructionText={instructions[2]}
            lang={lang}
          />
        )}
        {step === 3 && childToken && (
          <Step3QRCode
            token={childToken}
            childName={addChildData.childName}
            onNext={handleStep3Next}
            instructionText={instructions[3]}
            lang={lang}
          />
        )}
        {step === 4 && (
          <Step4Success
            childName={addChildData.childName}
            instructionText={instructions[4]}
            lang={lang}
          />
        )}
      </div>
    </OnboardingLayout>
  );
}

