/** Simple i18n for onboarding - structure ready for full i18n later */
export type Lang = "en" | "hi";

export const onboardingText: Record<
  Lang,
  {
    step1: {
      title: string;
      subtitle: string;
      nameLabel: string;
      namePlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      otpLabel: string;
      otpHint: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      verifyOtp: string;
      sendOtp: string;
      showAdvanced: string;
      hideAdvanced: string;
      continue: string;
    };
    step2: {
      title: string;
      subtitle: string;
      childNameLabel: string;
      childNamePlaceholder: string;
      ageGroupLabel: string;
      age6_10: string;
      age11_14: string;
      age15_18: string;
      continue: string;
    };
    step3: {
      title: string;
      subtitle: string;
      scanInstruction: string;
      continue: string;
    };
    step4: {
      title: string;
      message: string;
      audioMessage: string;
      goToDashboard: string;
    };
    common: {
      back: string;
      language: string;
      loading: string;
    };
  }
> = {
  en: {
    step1: {
      title: "Create your account",
      subtitle: "Enter your details to get started. We'll verify your phone.",
      nameLabel: "Your name",
      namePlaceholder: "Enter your name",
      phoneLabel: "Phone number",
      phonePlaceholder: "10-digit mobile number",
      otpLabel: "Enter 6-digit code",
      otpHint: "We've sent a code to your phone. Enter it above.",
      passwordLabel: "Create a password",
      passwordPlaceholder: "At least 6 characters",
      emailLabel: "Email address",
      emailPlaceholder: "you@example.com",
      verifyOtp: "Verify",
      sendOtp: "Send code",
      showAdvanced: "Use email instead",
      hideAdvanced: "Use phone instead",
      continue: "Continue",
    },
    step2: {
      title: "Add your child",
      subtitle: "Tell us about the child you want to protect.",
      childNameLabel: "Child's name",
      childNamePlaceholder: "Enter child's name",
      ageGroupLabel: "Age group",
      age6_10: "6–10 years",
      age11_14: "11–14 years",
      age15_18: "15–18 years",
      continue: "Add child",
    },
    step3: {
      title: "Connect the extension",
      subtitle: "Scan this QR code with the SproutSafe extension to activate protection.",
      scanInstruction: "Open the extension and tap 'Scan to Connect'",
      continue: "I've scanned",
    },
    step4: {
      title: "You're all set!",
      message: "{name} is now protected.",
      audioMessage: "Setup complete. Your child is now protected.",
      goToDashboard: "Go to dashboard",
    },
    common: {
      back: "Back",
      language: "Language",
      loading: "Please wait...",
    },
  },
  hi: {
    step1: {
      title: "अपना खाता बनाएं",
      subtitle: "शुरू करने के लिए अपना विवरण दर्ज करें। हम आपका फोन सत्यापित करेंगे।",
      nameLabel: "आपका नाम",
      namePlaceholder: "अपना नाम दर्ज करें",
      phoneLabel: "फोन नंबर",
      phonePlaceholder: "10 अंकों का मोबाइल नंबर",
      otpLabel: "6 अंकों का कोड दर्ज करें",
      otpHint: "हमने आपके फोन पर कोड भेजा है। ऊपर दर्ज करें।",
      passwordLabel: "पासवर्ड बनाएं",
      passwordPlaceholder: "कम से कम 6 अक्षर",
      emailLabel: "ईमेल पता",
      emailPlaceholder: "you@example.com",
      verifyOtp: "सत्यापित करें",
      sendOtp: "कोड भेजें",
      showAdvanced: "ईमेल का उपयोग करें",
      hideAdvanced: "फोन का उपयोग करें",
      continue: "जारी रखें",
    },
    step2: {
      title: "अपने बच्चे को जोड़ें",
      subtitle: "उस बच्चे के बारे में बताएं जिसे आप सुरक्षित करना चाहते हैं।",
      childNameLabel: "बच्चे का नाम",
      childNamePlaceholder: "बच्चे का नाम दर्ज करें",
      ageGroupLabel: "आयु समूह",
      age6_10: "6–10 वर्ष",
      age11_14: "11–14 वर्ष",
      age15_18: "15–18 वर्ष",
      continue: "बच्चा जोड़ें",
    },
    step3: {
      title: "एक्सटेंशन कनेक्ट करें",
      subtitle: "सुरक्षा सक्रिय करने के लिए SproutSafe एक्सटेंशन से इस QR कोड को स्कैन करें।",
      scanInstruction: "एक्सटेंशन खोलें और 'Scan to Connect' पर टैप करें",
      continue: "मैंने स्कैन कर लिया",
    },
    step4: {
      title: "सब तैयार है!",
      message: "{name} अब सुरक्षित है।",
      audioMessage: "सेटअप पूर्ण। आपका बच्चा अब सुरक्षित है।",
      goToDashboard: "डैशबोर्ड पर जाएं",
    },
    common: {
      back: "वापस",
      language: "भाषा",
      loading: "कृपया प्रतीक्षा करें...",
    },
  },
};

export function useOnboardingI18n(lang: Lang = "en") {
  return { t: onboardingText[lang], lang };
}

export type OnboardingLang = Lang;
