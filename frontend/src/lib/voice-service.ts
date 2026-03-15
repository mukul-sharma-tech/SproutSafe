export type VoiceProvider = "ollama" | "webspeech";

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
  en: `You are the SproutSafe voice assistant. You help parents manage 
child safety and parental controls. Be warm, concise, and helpful. 
Speak like a knowledgeable friend, not a robot. 
Keep responses under 3 sentences unless more detail is needed.
Common tasks: adding children, copying tokens, checking activity,
understanding what is blocked, dashboard help.`,

  hi: `आप SproutSafe के वॉयस असिस्टेंट हैं। आप माता-पिता को बच्चों की 
सुरक्षा और पैरेंटल कंट्रोल प्रबंधित करने में मदद करते हैं।
गर्मजोशी से, संक्षेप में और सहायक तरीके से बोलें।
जब तक अधिक विवरण की आवश्यकता न हो, 3 वाक्यों से कम में उत्तर दें।
सामान्य कार्य: बच्चे जोड़ना, टोकन कॉपी करना, गतिविधि जाँचना,
क्या ब्लॉक है यह समझना, डैशबोर्ड सहायता।`,
};

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";

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
    await this.sendViaOllama(text);
  }

  async sendViaOllama(userMessage: string): Promise<void> {
    this.currentProvider = "ollama";
    this.config.onStatusChange("thinking");

    try {
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3",
          prompt: `${SYSTEM_PROMPTS[this.config.lang]}\n\nUser: ${userMessage}\nAssistant:`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply =
        data?.response?.trim() ||
        (this.config.lang === "hi"
          ? "माफ करें, मैं अभी उत्तर नहीं दे सकता।"
          : "Sorry, I couldn't get a response right now.");

      this.config.onMessage({
        role: "assistant",
        text: reply,
        provider: "ollama",
        timestamp: new Date(),
      });

      this.speakFallback(reply);
      this.config.onStatusChange("idle");
    } catch (err) {
      const error = err as Error;
      this.config.onError(error, "ollama");
      this.config.onStatusChange("error");

      const errMsg =
        this.config.lang === "hi"
          ? "माफ करें, Ollama से कनेक्ट नहीं हो सका। कृपया सुनिश्चित करें कि Ollama चल रहा है।"
          : "Couldn't connect to Ollama. Make sure it's running locally.";

      this.speakFallback(errMsg);
    }
  }

  private speakFallback(text: string): void {
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
    // No-op for Ollama mode
  }

  getProvider(): VoiceProvider {
    return this.currentProvider;
  }
}
