import { EmailMetadata } from "./gmail";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

function shouldUseOllama(): boolean {
  const forceOllama = process.env.USE_OLLAMA?.toLowerCase() === "true";
  if (forceOllama) return true;
  return !process.env.ANTHROPIC_API_KEY;
}

function buildReplyPrompt(email: EmailMetadata, instruction?: string): string {
  const customInstruction = instruction?.trim() || "Write a concise, professional, friendly reply.";

  return `You are an email assistant.

Draft a reply to this email:
- From: ${email.from}
- Subject: ${email.subject}
- Snippet: ${email.snippet || "(no snippet provided)"}

User instruction:
${customInstruction}

Rules:
- Output only the draft reply body (no markdown, no greeting line labels).
- Keep it concise and practical.
- If the message looks like marketing or spam, suggest a short decline/unsubscribe style response.
- If information is missing, add a short placeholder in brackets.`;
}

async function generateWithOllama(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.4 },
    }),
  });

  if (!response.ok) {
    const raw = await response.text();
    let detail = raw.trim();
    try {
      const parsed = JSON.parse(raw) as { error?: string };
      if (parsed?.error) {
        detail = parsed.error;
      }
    } catch {
      // Keep raw detail.
    }
    throw new Error(detail || `Ollama request failed (${response.status}).`);
  }

  const data = (await response.json()) as { response?: string };
  return data.response?.trim() || "";
}

async function generateWithClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is missing.");
  }

  const sdkModule = await import("@anthropic-ai/sdk");
  const AnthropicClient = sdkModule.default;
  const client = new AnthropicClient({ apiKey });

  const message = await client.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 350,
    temperature: 0.4,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].type === "text" ? message.content[0].text.trim() : "";
}

export async function generateReplyDraft(email: EmailMetadata, instruction?: string): Promise<string> {
  const prompt = buildReplyPrompt(email, instruction);

  if (shouldUseOllama()) {
    try {
      return await generateWithOllama(prompt);
    } catch (error) {
      if (process.env.ANTHROPIC_API_KEY) {
        return generateWithClaude(prompt);
      }
      throw error;
    }
  }

  return generateWithClaude(prompt);
}
