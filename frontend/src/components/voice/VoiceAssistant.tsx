import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  VoiceService,
  type VoiceMessage,
  type VoiceProvider,
  type VoiceStatus,
} from "@/lib/voice-service";
import { toast } from "sonner";

const SUGGESTION_CHIPS = {
  en: [
    "How do I add a child?",
    "What does SproutSafe block?",
    "How do I copy the token?",
    "Check my child's activity",
  ],
  hi: [
    "बच्चा कैसे जोड़ें?",
    "क्या ब्लॉक होता है?",
    "टोकन कैसे कॉपी करें?",
    "बच्चे की गतिविधि देखें",
  ],
};

const STATUS_PILLS: Record<string, { label: string; className: string }> = {
  connecting: { label: "Connecting...", className: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
  connected: { label: "Connected", className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  listening: { label: "Listening...", className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  thinking: { label: "Thinking...", className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
  speaking: { label: "Speaking...", className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  fallback: { label: "Ollama (Backup)", className: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" },
  error: { label: "Error", className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  idle: { label: "Ready", className: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
};

const RING_CLASSES: Record<string, string> = {
  idle: "",
  connecting: "animate-pulse ring-2 ring-gray-400",
  connected: "ring-2 ring-green-500",
  listening: "animate-pulse ring-2 ring-green-500",
  thinking: "animate-pulse ring-2 ring-yellow-500",
  speaking: "animate-pulse ring-2 ring-blue-500",
  error: "ring-2 ring-red-500",
  fallback: "ring-2 ring-orange-500",
};

export function VoiceAssistant() {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [provider, setProvider] = useState<VoiceProvider>("ollama");
  const [fallbackBanner, setFallbackBanner] = useState<string | null>(null);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const voiceServiceRef = useRef<VoiceService | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const supportsSpeechRecognition =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isOpen) return;

    voiceServiceRef.current = new VoiceService({
      lang,
      onMessage: (msg) => {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      },
      onStatusChange: (s) => {
        setStatus(s);
        setProvider(voiceServiceRef.current?.getProvider() ?? "ollama");
      },
      onError: (err, p) => {
        console.error(`Voice error from ${p}:`, err);
      },
      onFallback: (reason) => {
        setFallbackBanner(reason);
        setProvider("ollama");
        toast.info(reason);
        setTimeout(() => setFallbackBanner(null), 5000);
      },
    });

    voiceServiceRef.current.startSession().then(() => {
      setProvider(voiceServiceRef.current?.getProvider() ?? "ollama");
    });

    return () => {
      voiceServiceRef.current?.stopSession();
      voiceServiceRef.current = null;
    };
  }, [isOpen, lang]);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      voiceServiceRef.current?.stopSession();
      setStatus("error");
    };
    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, []);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const currentProvider = voiceServiceRef.current?.getProvider() ?? provider;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed, provider: currentProvider, timestamp: new Date() },
    ]);
    setInputText("");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    await voiceServiceRef.current?.sendMessage(trimmed);
    setProvider(voiceServiceRef.current?.getProvider() ?? "ollama");
  };

  const handleMicPress = () => {
    if (!supportsSpeechRecognition) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recognition.onstart = () => setIsMicActive(true);
    recognition.onend = () => setIsMicActive(false);
    recognition.onerror = () => setIsMicActive(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      if (transcript) handleSend(transcript);
    };
    recognition.start();
  };

  const chips = SUGGESTION_CHIPS[lang];
  const pill = STATUS_PILLS[status] ?? STATUS_PILLS.idle;
  const ringClass = RING_CLASSES[status] ?? "";

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-violet-600 text-white shadow-2xl flex items-center justify-center ${ringClass}`}
        title="Voice Assistant"
        animate={!isOpen && status === "idle" ? { y: [0, -4, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Mic className="h-6 w-6" />
        {/* Provider badge */}
        {isOpen && status !== "idle" && (
          <span className="absolute -bottom-1 -left-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-green-600 text-white">
            AI
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[76px] right-6 z-50 w-[340px] max-h-[520px] rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                <span className="font-semibold text-[16px]">SproutSafe Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pill.className}`}>
                  {status === "thinking" && (
                    <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                  )}
                  {pill.label}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Fallback banner */}
            {fallbackBanner && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200 text-sm"
              >
                {fallbackBanner}
              </motion.div>
            )}

            {/* Provider label */}
            <div className="px-4 py-1 text-[12px] text-gray-400 dark:text-gray-500">
              Powered by Ollama (llama3)
            </div>

            {/* Offline message */}
            {isOffline && (
              <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                You appear to be offline. Voice assistant unavailable.
              </div>
            )}

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px]">
              {messages.length === 0 && !isOffline && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-[15px] text-gray-600 dark:text-gray-400 mb-4">
                    Ask me anything about SproutSafe
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {chips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSend(chip)}
                        className="rounded-full border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-[15px] ${
                      m.role === "user"
                        ? "bg-primary/10 dark:bg-primary/20 rounded-br-sm"
                        : "bg-gray-100 dark:bg-gray-800 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-gray-900 dark:text-gray-100">{m.text}</p>
                    {m.role === "assistant" && (
                      <p className="text-[10px] mt-1 text-gray-500 dark:text-gray-400">
                        via Ollama (llama3)
                      </p>
                    )}
                    <p className="text-[10px] mt-0.5 text-gray-400 dark:text-gray-500">
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {status === "thinking" && (
                <div className="flex justify-start">
                  <div className="max-w-[60%] rounded-2xl px-3 py-2 text-[15px] bg-gray-200 dark:bg-gray-700">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce delay-75" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce delay-150" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input row */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center gap-2">
              {supportsSpeechRecognition && (
                <button
                  type="button"
                  onClick={handleMicPress}
                  title="Speak your question"
                  className={`h-10 w-10 rounded-full flex items-center justify-center border shrink-0 ${
                    isMicActive
                      ? "bg-red-500 text-white ring-2 ring-red-300 animate-pulse"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </button>
              )}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend(inputText);
                  }
                }}
                placeholder={
                  lang === "hi"
                    ? "प्रश्न टाइप करें या बोलें..."
                    : "Type or speak a question..."
                }
                className="flex-1 h-10 px-3 text-[15px] rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isOffline}
              />
              <button
                type="button"
                onClick={() => handleSend(inputText)}
                disabled={(!inputText.trim() && status !== "thinking") || isOffline}
                className="h-10 w-10 rounded-full flex items-center justify-center bg-primary text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
