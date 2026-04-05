export const SYSTEM_PROMPT = `Sen AdLens AI'ın reklam analiz motorusun. 10+ yıllık deneyime sahip,
Meta Ads ve Google Ads konusunda uzmanlaşmış kıdemli bir dijital pazarlama
danışmanı gibi davranıyorsun.

Temel ilkelerin:
- Veriyi olduğu gibi yorumla, abartma
- Her önerinin arkasında somut bir metrik gerekçesi olsun
- "İyi görünüyor" gibi muğlak ifadeler kullanma
- Aksiyonlar bu hafta / bu ay / uzun vade olarak önceliklendir
- ROAS, CTR, CPC, CPM, CPA metriklerini sektör benchmarklarıyla karşılaştır
- Anomali tespitinde: önceki döneme göre >%15 değişim kritik eşiktir

Yanıtların daima geçerli JSON olsun. Başka hiçbir şey yazma.`;

function langInstruction(language: "tr" | "en"): string {
  return language === "tr"
    ? "Tüm yanıtları Türkçe ver."
    : "Respond entirely in English.";
}

export function buildCampaignAnalysisPrompt(params: {
  platform: string;
  campaignName: string;
  template: string;
  dateRange: string;
  metrics: Record<string, unknown>;
  benchmarkData?: Record<string, unknown>;
  language: "tr" | "en";
}): string {
  const benchmarkSection = params.benchmarkData
    ? `\nSEKTÖR BENCHMARK VERİSİ (${params.template}):\n${JSON.stringify(params.benchmarkData, null, 2)}`
    : "";

  return `${SYSTEM_PROMPT}

Dil: ${langInstruction(params.language)}

Aşağıdaki reklam kampanyasını analiz et:

Platform: ${params.platform}
Kampanya Adı: ${params.campaignName}
Analiz Şablonu: ${params.template}
Dönem: ${params.dateRange}

METRİKLER:
${JSON.stringify(params.metrics, null, 2)}
${benchmarkSection}

Analiz kuralları:
- ROAS < 2x ise "kritik", 2–3x ise "geliştirilmeli", >3x ise "iyi", >5x ise "mükemmel"
- CTR: Meta için <0.5% kritik, 0.5–1.5% orta, >1.5% iyi / Google Search için <2% orta, >5% iyi
- CPC önceki döneme göre >%20 artış ise anomali
- Frequency (Meta): >4 ise banner yorgunluğu uyarısı ver
- Impression Share (Google): <%50 ise bütçe yetersizliği uyarısı ver

Şu formatta JSON döndür:
{
  "score": 0-100,
  "scoreReason": "skoru belirleyen 1-2 cümle",
  "status": "critical" | "needs_improvement" | "good" | "excellent",
  "summary": "2-3 cümle genel değerlendirme",
  "strengths": ["güçlü yön 1", "güçlü yön 2"],
  "weaknesses": ["sorun 1", "sorun 2"],
  "anomalies": ["anomali varsa yaz, yoksa boş dizi"],
  "benchmarkComparison": {
    "roas": "sektör ortalamasının üstünde/altında/eşit + fark yüzdesi",
    "ctr": "...",
    "cpc": "..."
  },
  "actions": [
    {
      "priority": "urgent" | "monthly" | "longterm",
      "action": "somut aksiyon açıklaması",
      "expectedImpact": "beklenen etki",
      "metric": "hangi metriği etkiler"
    }
  ]
}`;
}

export function buildOverallReportPrompt(params: {
  campaignCount: number;
  clientName: string;
  platforms: string;
  totalSpend: number;
  dateRange: string;
  campaignAnalyses: unknown[];
  language: "tr" | "en";
}): string {
  return `${SYSTEM_PROMPT}

Dil: ${langInstruction(params.language)}

Aşağıda ${params.campaignCount} kampanyanın analiz sonuçları var.
Müşteri: ${params.clientName}
Platform(lar): ${params.platforms}
Toplam Harcama: ${params.totalSpend}
Dönem: ${params.dateRange}

KAMPANYA ANALİZLERİ:
${JSON.stringify(params.campaignAnalyses, null, 2)}

Görevin:
1. Tüm kampanyaların birleşik performansını değerlendir
2. Platform karşılaştırması yap (Meta vs Google varsa)
3. Bütçe verimliliğini değerlendir
4. Genel hesap sağlığını özetle

{
  "overallScore": 0-100,
  "overallSummary": "3-4 cümle kapsamlı özet",
  "topPerformer": { "campaignName": "...", "reason": "..." },
  "worstPerformer": { "campaignName": "...", "reason": "..." },
  "platformComparison": {
    "meta": { "avgRoas": 0, "totalSpend": 0, "assessment": "..." },
    "google": { "avgRoas": 0, "totalSpend": 0, "assessment": "..." }
  },
  "budgetEfficiency": "...",
  "accountHealth": "critical" | "needs_improvement" | "good" | "excellent",
  "keyInsights": ["içgörü 1", "içgörü 2", "içgörü 3"]
}`;
}

export function buildActionPlanPrompt(params: {
  clientName: string;
  template: string;
  overallScore: number;
  allAnalyses: unknown;
  language: "tr" | "en";
}): string {
  return `${SYSTEM_PROMPT}

Dil: ${langInstruction(params.language)}

Müşteri: ${params.clientName}
Sektör/Şablon: ${params.template}
Genel Hesap Skoru: ${params.overallScore}

TÜM KAMPANYA ANALİZLERİ VE GENEL RAPOR:
${JSON.stringify(params.allAnalyses, null, 2)}

Aksiyon planı oluştururken dikkat et:
- "Acil" aksiyonlar bu hafta içinde yapılabilir ve somut olmalı
- "Aylık" aksiyonlar 2–4 hafta içinde uygulanabilir
- Her aksiyon için beklenen etkiyi mutlaka belirt
- Durdurulması gereken kampanyaları açıkça söyle
- Bütçe tavsiyelerinde mevcut harcamayı referans al

{
  "urgentActions": [
    { "title": "...", "description": "...", "campaign": "...", "expectedImpact": "...", "effort": "low" | "medium" | "high" }
  ],
  "monthlyActions": [ ... ],
  "longtermActions": [ ... ],
  "campaignsToStop": [
    { "campaignName": "...", "reason": "...", "budgetReallocation": "..." }
  ],
  "budgetRecommendation": {
    "currentTotal": 0,
    "recommendedTotal": 0,
    "rationale": "..."
  }
}`;
}

export function buildNewCampaignPrompt(params: {
  clientName: string;
  template: string;
  totalSpend: number;
  platforms: string;
  overallScore: number;
  campaignSummary: unknown;
  language: "tr" | "en";
}): string {
  return `${SYSTEM_PROMPT}

Dil: ${langInstruction(params.language)}

Müşteri: ${params.clientName}
Sektör: ${params.template}
Mevcut Aylık Reklam Bütçesi: ${params.totalSpend}
Aktif Platformlar: ${params.platforms}
Hesap Genel Skoru: ${params.overallScore}

MEVCUT KAMPANYA ÖZETİ:
${JSON.stringify(params.campaignSummary, null, 2)}

Yeni kampanya önerilerinde dikkat et:
- Mevcut kampanyalarda eksik olan açıkları doldur
- Yüksek performanslı kampanyaların mantığını genişlet
- Her öneri için gerçekçi bütçe ve ROAS tahmini ver
- Teknik kurulum adımlarını kısaca belirt
- Maksimum 3 öneri

{
  "suggestions": [
    {
      "title": "...",
      "platform": "Meta" | "Google" | "Her İkisi",
      "campaignType": "...",
      "objective": "...",
      "targetAudience": "...",
      "estimatedBudget": { "monthly": 0, "currency": "TRY" | "USD" },
      "estimatedRoas": { "min": 0, "max": 0 },
      "rationale": "...",
      "setupSteps": ["..."],
      "kpis": ["..."],
      "timeToResults": "..."
    }
  ]
}`;
}
