import { generateAISingle } from "@/lib/ai-service";

export type VoiceProvider = "ollama" | "groq" | "webspeech";

export interface VoiceMessage {
  role: "user" | "assistant";
  text: string;
  provider: VoiceProvider;
  timestamp: Date;
}

export interface VoiceServiceConfig {
  lang: "en" | "hi";
  onMessage: (msg: VoiceMessage) => void;
  onStatusChange: (status: VoiceStatus) => void;
  onError: (err: Error, provider: VoiceProvider) => void;
  onFallback: (reason: string) => void;
}

export type VoiceStatus = "idle" | "thinking" | "error" | "fallback";

const SYSTEM_PROMPTS = {
  en: `You are the CyberNest voice assistant. You help parents manage 
child safety and parental controls. Be warm, concise, and helpful. 
Speak like a knowledgeable friend, not a robot. 
Keep responses under 3 sentences unless more detail is needed.
Common tasks: adding children, copying tokens, checking activity,
understanding what is blocked, dashboard help.`,

  hi: `आप CyberNest के वॉयस असिस्टेंट हैं। आप माता-पिता को बच्चों की 
सुरक्षा और पैरेंटल कंट्रोल प्रबंधित करने में मदद करते हैं।
गर्मजोशी से, संक्षेप में और सहायक तरीके से बोलें।
जब तक अधिक विवरण की आवश्यकता न हो, 3 वाक्यों से कम में उत्तर दें।
सामान्य कार्य: बच्चे जोड़ना, टोकन कॉपी करना, गतिविधि जाँचना,
क्या ब्लॉक है यह समझना, डैशबोर्ड सहायता।`,
};

export class VoiceService {
  private config: VoiceServiceConfig;
  private currentProvider: VoiceProvider = "ollama";

  constructor(config: VoiceServiceConfig) {
    this.config = config;
  }

  async startSession(): Promise<void> {
    this.currentProvider = "ollama";
    this.config.onStatusChange("idle");
  }

  async sendMessage(text: string): Promise<void> {
    this.config.onStatusChange("thinking");

    const prompt = `${SYSTEM_PROMPTS[this.config.lang]}\n\nUser: ${text}\nAssistant:`;

    try {
      const { text: reply, provider } = await generateAISingle(prompt);
      this.currentProvider = provider === "groq" ? "groq" : "ollama";

      const finalReply = reply.trim() || (
        this.config.lang === "hi"
          ? "माफ करें, मैं अभी उत्तर नहीं दे सकता।"
          : "Sorry, I couldn't get a response right now."
      );

      this.config.onMessage({
        role: "assistant",
        text: finalReply,
        provider: this.currentProvider,
        timestamp: new Date(),
      });

      this.speakText(finalReply);
      this.config.onStatusChange("idle");
    } catch (err) {
      this.config.onError(err as Error, this.currentProvider);
      this.config.onStatusChange("error");

      const errMsg =
        this.config.lang === "hi"
          ? "माफ करें, AI से कनेक्ट नहीं हो सका।"
          : "Couldn't connect to AI. Make sure Ollama is running or add a Groq API key.";

      this.speakText(errMsg);
    }
  }

  // kept for backward compat
  async sendViaOllama(userMessage: string): Promise<void> {
    return this.sendMessage(userMessage);
  }

  private speakText(text: string): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = this.config.lang === "hi" ? "hi-IN" : "en-IN";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  async stopSession(): Promise<void> {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.config.onStatusChange("idle");
  }

  async setMicMuted(_muted: boolean): Promise<void> {
    // No-op
  }

  getProvider(): VoiceProvider {
    return this.currentProvider;
  }
}

