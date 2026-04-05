import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const AI_MODEL = "claude-sonnet-4-20250514";

/**
 * Claude'a basit bir prompt gönder ve metin yanıt al.
 */
export async function callClaude(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type === "text") {
    return block.text;
  }
  return "";
}
