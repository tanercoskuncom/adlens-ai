import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { campaignData, language } = await req.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send({ type: "status", message: "Kampanyalar analiz ediliyor..." });

        const langText =
          language === "tr" ? "Türkçe yanıt ver." : "Respond in English.";

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          stream: true,
          messages: [
            {
              role: "user",
              content: `${SYSTEM_PROMPT}\n\n${langText}\n\nKampanya verisi:\n${JSON.stringify(campaignData, null, 2)}\n\nDetaylı analiz yap ve JSON formatında yanıt ver.`,
            },
          ],
        });

        for await (const chunk of response) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            send({ type: "chunk", text: chunk.delta.text });
          }
        }
        send({ type: "done" });
      } catch (err) {
        send({ type: "error", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
