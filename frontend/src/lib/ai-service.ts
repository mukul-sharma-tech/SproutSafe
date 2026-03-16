/**
 * AI Service — tries Ollama (local) first, falls back to Groq (cloud).
 * Used by ReportsPanel and VoiceService.
 */

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export type AIProvider = "ollama" | "groq" | "none";

export interface AIStreamResult {
  provider: AIProvider;
  /** Call this to start streaming; calls onChunk for each token, resolves when done */
  stream: (onChunk: (text: string) => void) => Promise<string>;
}

/** Try Ollama streaming. Throws if unavailable. */
async function streamOllama(prompt: string, onChunk: (t: string) => void): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama3", prompt, stream: true }),
    signal: AbortSignal.timeout(8000), // 8s to connect
  });

  if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split("\n").filter(Boolean)) {
      try {
        const json = JSON.parse(line);
        if (json.response) {
          full += json.response;
          onChunk(json.response);
        }
      } catch { /* skip */ }
    }
  }

  if (!full.trim()) throw new Error("Empty Ollama response");
  return full;
}

/** Try Groq streaming. Throws if no key or unavailable. */
async function streamGroq(prompt: string, onChunk: (t: string) => void): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("No GROQ_API_KEY set");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq HTTP ${response.status}: ${err}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.replace(/^data: /, "").trim();
      if (!trimmed || trimmed === "[DONE]") continue;
      try {
        const json = JSON.parse(trimmed);
        const token = json.choices?.[0]?.delta?.content;
        if (token) {
          full += token;
          onChunk(token);
        }
      } catch { /* skip */ }
    }
  }

  if (!full.trim()) throw new Error("Empty Groq response");
  return full;
}

/**
 * Generate text with automatic Ollama → Groq fallback.
 * @param prompt  Full prompt string
 * @param onChunk Called with each streamed token
 * @param onProviderChange Called when provider is determined
 */
export async function generateAI(
  prompt: string,
  onChunk: (text: string) => void,
  onProviderChange?: (provider: AIProvider) => void
): Promise<{ text: string; provider: AIProvider }> {
  // 1. Try Ollama
  try {
    onProviderChange?.("ollama");
    const text = await streamOllama(prompt, onChunk);
    return { text, provider: "ollama" };
  } catch (ollamaErr) {
    console.warn("[AI] Ollama unavailable, trying Groq:", ollamaErr);
  }

  // 2. Try Groq
  try {
    onProviderChange?.("groq");
    const text = await streamGroq(prompt, onChunk);
    return { text, provider: "groq" };
  } catch (groqErr) {
    console.warn("[AI] Groq unavailable:", groqErr);
  }

  // 3. Both failed
  onProviderChange?.("none");
  throw new Error("Both Ollama and Groq are unavailable");
}

/** Non-streaming single response (for voice assistant) */
export async function generateAISingle(prompt: string): Promise<{ text: string; provider: AIProvider }> {
  let full = "";
  return generateAI(prompt, (chunk) => { full += chunk; });
}
