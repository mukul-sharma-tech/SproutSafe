import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sprout, Mail, Lock, User, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import apiClient from "@/api/client";
import { useLanguage } from "@/context/LanguageContext";
import { voiceStrings } from "@/lib/voice-strings";

type AuthTab = "login" | "signup";

interface AuthModalProps {
  open: boolean;
  initialTab?: AuthTab;
  onClose?: () => void;
  // kept for API compat — ignored now that verification flow is removed
  initialMode?: string;
}

const MIN_FONT_CLASS = "text-[18px]";

function speak(text: string, lang: "en" | "hi") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "hi" ? "hi-IN" : "en-IN";
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function AuthModal({ open, initialTab = "login", onClose }: AuthModalProps) {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();

  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  useEffect(() => { if (open) setAuthError(null); }, [open, activeTab]);

  useEffect(() => {
    if (!open || !voiceEnabled) return;
    const key = activeTab === "login" ? "stepAuthLogin" : "stepAuthSignup";
    speak(voiceStrings[lang][key], lang);
  }, [open, activeTab, lang, voiceEnabled]);

  const titleAndInstruction = useMemo(() => (
    activeTab === "login"
      ? { title: "Welcome back", instruction: "Sign in to manage your child's protection." }
      : { title: "Create your account", instruction: "Sign up to start protecting your child's browsing." }
  ), [activeTab]);

  if (!open) return null;

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      const { data } = await apiClient.post("/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      if (data?.token) localStorage.setItem("token", data.token);
      if (onClose) onClose();
      navigate("/dashboard");
    } catch (err: unknown) {
      setAuthError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Login failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async () => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      const { data } = await apiClient.post("/api/auth/signup", {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });
      if (data?.token) localStorage.setItem("token", data.token);
      if (onClose) onClose();
      navigate("/dashboard");
    } catch (err: unknown) {
      setAuthError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Signup failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/70 backdrop-blur-xl px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-[420px] rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 p-5 space-y-5"
        >
          {/* Header */}
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Sprout className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold">SproutSafe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-full border border-border p-0.5 text-xs">
                <button type="button" onClick={() => setLang("en")}
                  className={`px-2 py-1 rounded-full ${lang === "en" ? "bg-primary text-white" : "text-muted-foreground"}`}>
                  EN
                </button>
                <button type="button" onClick={() => setLang("hi")}
                  className={`px-2 py-1 rounded-full ${lang === "hi" ? "bg-primary text-white" : "text-muted-foreground"}`}>
                  HI
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Voice</span>
                <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
              </div>
              <Button type="button" variant="ghost" size="icon"
                className={`h-10 w-10 rounded-full border border-border ${!voiceEnabled ? "opacity-50" : ""}`}
                onClick={() => voiceEnabled && speak(voiceStrings[lang][activeTab === "login" ? "stepAuthLogin" : "stepAuthSignup"], lang)}>
                <HeadphonesIcon className="h-5 w-5 text-primary" />
              </Button>
            </div>
          </header>

          {/* Title */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{titleAndInstruction.title}</h2>
            <p className={`${MIN_FONT_CLASS} text-muted-foreground`}>{titleAndInstruction.instruction}</p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-full bg-muted p-1 text-sm font-medium">
            <button type="button" onClick={() => setActiveTab("login")}
              className={`flex-1 rounded-full py-2 transition-colors ${activeTab === "login" ? "bg-white dark:bg-gray-800 shadow-sm" : "text-muted-foreground"}`}>
              Login
            </button>
            <button type="button" onClick={() => setActiveTab("signup")}
              className={`flex-1 rounded-full py-2 transition-colors ${activeTab === "signup" ? "bg-white dark:bg-gray-800 shadow-sm" : "text-muted-foreground"}`}>
              Sign Up
            </button>
          </div>

          {/* Error */}
          {authError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {authError}
            </div>
          )}

          {/* Login form */}
          {activeTab === "login" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={`flex items-center gap-2 font-medium ${MIN_FONT_CLASS}`}>
                  <Mail className="h-5 w-5 text-primary" /> Email
                </label>
                <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  className="h-12 text-base bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>
              <div className="space-y-1.5">
                <label className={`flex items-center gap-2 font-medium ${MIN_FONT_CLASS}`}>
                  <Lock className="h-5 w-5 text-primary" /> Password
                </label>
                <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  className="h-12 text-base bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>
              <Button type="button" className="w-full h-12 text-base" onClick={handleLogin}
                disabled={!loginEmail || !loginPassword || isSubmitting}>
                {isSubmitting ? "Signing in..." : "Log in"}
              </Button>
            </div>
          )}

          {/* Signup form */}
          {activeTab === "signup" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={`flex items-center gap-2 font-medium ${MIN_FONT_CLASS}`}>
                  <User className="h-5 w-5 text-primary" /> Name
                </label>
                <Input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)}
                  className="h-12 text-base bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700" />
              </div>
              <div className="space-y-1.5">
                <label className={`flex items-center gap-2 font-medium ${MIN_FONT_CLASS}`}>
                  <Mail className="h-5 w-5 text-primary" /> Email
                </label>
                <Input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                  className="h-12 text-base bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700" />
              </div>
              <div className="space-y-1.5">
                <label className={`flex items-center gap-2 font-medium ${MIN_FONT_CLASS}`}>
                  <Lock className="h-5 w-5 text-primary" /> Password
                </label>
                <Input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                  className="h-12 text-base bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  onKeyDown={(e) => e.key === "Enter" && handleSignup()} />
              </div>
              <Button type="button" className="w-full h-12 text-base" onClick={handleSignup}
                disabled={!signupName || !signupEmail || !signupPassword || isSubmitting}>
                {isSubmitting ? "Creating account..." : "Sign up"}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
