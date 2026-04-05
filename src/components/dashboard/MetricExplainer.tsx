"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, X, Loader2 } from "lucide-react";

interface Props {
  campaignName: string;
  metricName: string;
  metricValue: string;
  context?: string;
}

export function MetricExplainer({
  campaignName,
  metricName,
  metricValue,
  context,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");

  const handleExplain = async () => {
    if (explanation) {
      setOpen(!open);
      return;
    }

    setOpen(true);
    setLoading(true);

    try {
      const res = await fetch("/api/analysis/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName,
          metricName,
          metricValue,
          context,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setExplanation(data.explanation);
      } else {
        setExplanation(getLocalExplanation(metricName, metricValue));
      }
    } catch {
      // API yoksa lokal açıklama göster
      setExplanation(getLocalExplanation(metricName, metricValue));
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="inline-flex items-center">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleExplain();
        }}
        className="ml-1 text-gray-400 hover:text-blue-600 transition-colors"
        title={`${metricName} hakkinda aciklama`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border max-w-md w-full mx-4 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm">{campaignName}</h3>
                <p className="text-xs text-gray-500">
                  {metricName}: {metricValue}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analiz ediliyor...
              </div>
            ) : (
              <div className="text-sm text-gray-700 space-y-2 whitespace-pre-line">
                {explanation}
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
}

/**
 * API yoksa lokal açıklama üret
 */
function getLocalExplanation(metric: string, value: string): string {
  const explanations: Record<string, string> = {
    CTR: `CTR (Click-Through Rate) — Reklami goren kullanicilarin yuzde kaci tiklamis.

Deger: ${value}

Sektör ortalaması genellikle %1-2 arasındadır.
- %2+ → Mükemmel, kreatif ve hedefleme uyumlu
- %1-2 → Ortalama, iyileştirme potansiyeli var
- <%1 → Düşük, kreatif yenileme veya kitle daraltma gerekli

Iyilestirme onerileri:
→ Kreatif setlerini yenileyin (A/B test)
→ Hedef kitleyi daraltın
→ Reklam metnini güçlendirin (CTA, aciliyet)`,

    CPC: `CPC (Cost Per Click) — Bir tıklama için ödenen ortalama maliyet.

Deger: ${value}

Yüksek CPC genellikle şu nedenlere bağlı:
- Rekabet yoğunluğu (anahtar kelime/kitle)
- Düşük Quality Score (Google) veya Relevance Score (Meta)
- Geniş hedefleme

İyileştirme önerileri:
→ Negatif anahtar kelime listesini genişletin
→ Quality Score'u artırın (reklam-landing page uyumu)
→ Bid stratejisini gözden geçirin`,

    ROAS: `ROAS (Return on Ad Spend) — Reklam harcamasının getiri oranı.

Deger: ${value}

- 4x+ → Mükemmel, bütçe artırılabilir
- 2-4x → İyi, optimizasyon ile artırılabilir
- 1-2x → Düşük, karlılık sınırında
- <1x → Zararda, acil müdahale gerekli

İyileştirme önerileri:
→ Düşük performanslı kampanyaları durdurun
→ Retargeting bütçesini artırın
→ Dönüşüm hunisini optimize edin`,

    CPM: `CPM (Cost Per Mille) — 1000 gösterim başına maliyet.

Deger: ${value}

Yüksek CPM genellikle:
- Rekabet yoğunluğu döneminde (Black Friday vb.)
- Çok dar hedefleme
- Düşük reklam kalitesi

Iyilestirme onerileri:
→ Kitle genişletme deneyin
→ Farklı plajmanları test edin
→ Kreatif kalitesini artırın`,
  };

  return (
    explanations[metric] ||
    `${metric} metrigi: ${value}\n\nBu metrik hakkinda detayli analiz icin Anthropic API key'inizi ayarlarin. Claude AI, kampanya verileriyle birlikte kişiselleştirilmiş bir aciklama sunacak.`
  );
}
