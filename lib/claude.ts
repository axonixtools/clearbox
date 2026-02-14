import { EmailStats } from "./categorize";

export type RoastSeverity = "mild" | "medium" | "savage";

interface RoastConfig {
  temperature: number;
  toneGuide: string;
}

const SEVERITY_CONFIG: Record<RoastSeverity, RoastConfig> = {
  mild: {
    temperature: 0.7,
    toneGuide:
      "Be gently teasing and encouraging. Think friendly coworker ribbing. Light humor, mostly supportive.",
  },
  medium: {
    temperature: 0.8,
    toneGuide:
      "Be witty and pointed but not cruel. Think best friend roast at a dinner party. Clever observations that sting a bit but make everyone laugh.",
  },
  savage: {
    temperature: 0.95,
    toneGuide:
      "Be brutally honest and hilariously savage. Think Comedy Central roast. Pull no punches. Make it so devastating they have to share it. Use creative metaphors and exaggerated comparisons.",
  },
};

function buildPrompt(stats: EmailStats, severity: RoastSeverity): string {
  const config = SEVERITY_CONFIG[severity];

  const daysOld = stats.oldestDate
    ? Math.floor(
        (Date.now() - new Date(stats.oldestDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const socialDetails = stats.socialBreakdown
    .map((s) => `${s.platform}: ${s.count}`)
    .join(", ");

  return `You are a witty AI that roasts people's email habits. ${config.toneGuide}

Here are this person's email stats:
- Total unread emails: ${stats.total}
- Newsletters they'll never read: ${stats.newsletters} (top domains: ${stats.newsletterDomains.join(", ") || "various"})
- Social media notifications: ${stats.social} (${socialDetails || "various platforms"})
- Receipts & orders: ${stats.receipts}
- Other/personal: ${stats.other}
- Oldest unread email: ${daysOld} days ago
- Top senders: ${stats.topSenders.map((s) => `${s.name} (${s.count})`).join(", ")}

Write a ${severity === "savage" ? "120" : "100"}-word roast that:
1. Opens with a devastating zinger about the total count
2. Makes fun of specific patterns you see (newsletters they'll never read, social media they're ignoring, shopping habits)
3. References the oldest email date for comedic effect (${daysOld} days is ${daysOld > 365 ? "over a year" : daysOld > 30 ? "months" : "weeks"})
4. Ends on a ${severity === "savage" ? "backhanded compliment" : "genuinely encouraging note"} ("but we got you" energy)

Rules:
- Be specific to THEIR numbers. Generic roasts are boring.
- Make it shareable — they should screenshot this.
- No markdown formatting, just plain text, 3-4 short paragraphs.
- Don't use the word "roast" in the roast itself.
- Don't start with "Oh" or "So" or "Well".`;
}

// Check if we should use Ollama (for local testing) or Anthropic (for production)
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

function shouldUseOllama(): boolean {
  const forceOllama = process.env.USE_OLLAMA?.toLowerCase() === "true";
  if (forceOllama) return true;

  // If no Anthropic key is configured, default to Ollama automatically.
  return !process.env.ANTHROPIC_API_KEY;
}

function formatOllamaError(status: number, rawText: string): string {
  let details = rawText.trim();

  try {
    const parsed = JSON.parse(rawText) as { error?: string };
    if (parsed?.error) {
      details = parsed.error;
    }
  } catch {
    // Fall back to raw text if body is not JSON.
  }

  if (/model .*not found/i.test(details)) {
    return `Ollama model "${OLLAMA_MODEL}" was not found. Run "ollama pull ${OLLAMA_MODEL}" then try again.`;
  }

  if (!details) {
    details = `HTTP ${status}`;
  }

  return `Ollama request failed (${status}): ${details}`;
}

/**
 * Generate a roast using Ollama (local LLM) with streaming.
 * Returns a ReadableStream for progressive text display.
 */
async function generateRoastStreamOllama(
  stats: EmailStats,
  severity: RoastSeverity = "medium"
): Promise<ReadableStream<Uint8Array>> {
  const prompt = buildPrompt(stats, severity);

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: true,
      options: {
        temperature: SEVERITY_CONFIG[severity].temperature,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(formatOllamaError(response.status, errorBody));
  }

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.response) {
                controller.enqueue(encoder.encode(data.response));
              }
              if (data.done) {
                break;
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }

        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            if (data.response) {
              controller.enqueue(encoder.encode(data.response));
            }
          } catch {
            // Ignore trailing partial data
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Generate a roast (non-streaming) using Ollama.
 */
async function generateRoastOllama(
  stats: EmailStats,
  severity: RoastSeverity = "medium"
): Promise<string> {
  const prompt = buildPrompt(stats, severity);

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: SEVERITY_CONFIG[severity].temperature,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(formatOllamaError(response.status, errorBody));
  }

  const data = await response.json();
  return data.response || "";
}

// Import Anthropic SDK only if not using Ollama
let AnthropicClient: typeof import("@anthropic-ai/sdk").default | null = null;

async function getAnthropicClient() {
  if (!AnthropicClient) {
    const sdkModule = await import("@anthropic-ai/sdk");
    AnthropicClient = sdkModule.default;
  }
  return AnthropicClient;
}

/**
 * Generate a roast using Claude API with streaming.
 * Returns a ReadableStream for progressive text display.
 */
async function generateRoastStreamClaude(
  stats: EmailStats,
  severity: RoastSeverity = "medium"
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is missing. Please add it to your .env.local file or set USE_OLLAMA=true to use local Ollama."
    );
  }

  const AnthropicClient = await getAnthropicClient();
  const client = new AnthropicClient({ apiKey });
  const config = SEVERITY_CONFIG[severity];

  const stream = await client.messages.stream({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 300,
    temperature: config.temperature,
    messages: [
      {
        role: "user",
        content: buildPrompt(stats, severity),
      },
    ],
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Generate a roast (non-streaming, for fallback) using Claude.
 */
async function generateRoastClaude(
  stats: EmailStats,
  severity: RoastSeverity = "medium"
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is missing. Please add it to your .env.local file or set USE_OLLAMA=true to use local Ollama."
    );
  }

  const AnthropicClient = await getAnthropicClient();
  const client = new AnthropicClient({ apiKey });
  const config = SEVERITY_CONFIG[severity];

  const message = await client.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 300,
    temperature: config.temperature,
    messages: [
      {
        role: "user",
        content: buildPrompt(stats, severity),
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  if (text.length < 100) {
    const retry = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 400,
      temperature: config.temperature + 0.05,
      messages: [
        {
          role: "user",
          content:
            buildPrompt(stats, severity) +
            "\n\nIMPORTANT: Make this longer and more detailed. At least 100 words.",
        },
      ],
    });
    return retry.content[0].type === "text" ? retry.content[0].text : text;
  }

  return text;
}

/**
 * Generate a roast with streaming support.
 * Automatically chooses between Ollama (local) and Claude (cloud) based on USE_OLLAMA env var.
 */
export async function generateRoastStream(
  stats: EmailStats,
  severity: RoastSeverity = "medium"
): Promise<ReadableStream<Uint8Array>> {
  if (shouldUseOllama()) {
    try {
      return await generateRoastStreamOllama(stats, severity);
    } catch (error) {
      // Fallback to Claude when available and Ollama fails unexpectedly.
      if (process.env.ANTHROPIC_API_KEY) {
        return generateRoastStreamClaude(stats, severity);
      }
      throw error;
    }
  }
  return generateRoastStreamClaude(stats, severity);
}

/**
 * Generate a roast (non-streaming).
 * Automatically chooses between Ollama (local) and Claude (cloud) based on USE_OLLAMA env var.
 */
export async function generateRoast(
  stats: EmailStats,
  severity: RoastSeverity = "medium"
): Promise<string> {
  if (shouldUseOllama()) {
    try {
      return await generateRoastOllama(stats, severity);
    } catch (error) {
      if (process.env.ANTHROPIC_API_KEY) {
        return generateRoastClaude(stats, severity);
      }
      throw error;
    }
  }
  return generateRoastClaude(stats, severity);
}

/**
 * Check if roast generation is properly configured.
 */
export function isRoastConfigured(): boolean {
  if (shouldUseOllama()) {
    return true; // Ollama doesn't require API keys
  }
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Get the current roast provider name for display.
 */
export function getRoastProvider(): string {
  return shouldUseOllama() ? `Ollama (${OLLAMA_MODEL})` : "Claude (Anthropic)";
}
