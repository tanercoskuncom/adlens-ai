import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const { campaignName, metricName, metricValue, context } = await req.json();

    if (!campaignName || !metricName) {
      return NextResponse.json(
        { error: "campaignName ve metricName gerekli" },
        { status: 400 }
      );
    }

    const prompt = `Bir dijital reklam kampanyasının metriğini analiz et.

Kampanya: ${campaignName}
Metrik: ${metricName}
Değer: ${metricValue}
${context ? `Ek bağlam: ${context}` : ""}

Kısa ve net açıkla:
1. Bu metrik ne anlama geliyor (1 cümle)
2. Bu değer iyi mi kötü mü (sektör ortalamasına göre)
3. Neden böyle olabilir (2-3 olası sebep)
4. Ne yapılmalı (2-3 aksiyon önerisi)

Türkçe yaz, teknik ama anlaşılır ol. Maksimum 150 kelime.`;

    const response = await callClaude(prompt);

    return NextResponse.json({ explanation: response });
  } catch (error) {
    console.error("Explain error:", error);
    return NextResponse.json(
      { error: "Açıklama oluşturulamadı" },
      { status: 500 }
    );
  }
}
