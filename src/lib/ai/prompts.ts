export const SYSTEM_PROMPT = `Sen AdLens AI'ın reklam analiz motorusun. 10+ yıllık deneyime sahip,
Meta Ads ve Google Ads konusunda uzmanlaşmış kıdemli bir dijital pazarlama
danışmanı gibi davranıyorsun.

Temel ilkelerin:
- Veriyi olduğu gibi yorumla, abartma
- Her önerinin arkasında somut bir metrik gerekçesi olsun
- "İyi görünüyor" gibi muğlak ifadeler kullanma
- Aksiyonlar bu hafta / bu ay / uzun vade olarak önceliklendir
- Anomali tespitinde: önceki döneme göre >%15 değişim kritik eşiktir
- KRİTİK: Kampanyayı SADECE amacına (objective) uygun metriklere göre değerlendir

Yanıtların daima geçerli JSON olsun. Başka hiçbir şey yazma.`;

function langInstruction(language: "tr" | "en"): string {
  return language === "tr"
    ? "Tüm yanıtları Türkçe ver."
    : "Respond entirely in English.";
}

/**
 * Meta objective değerlerini Türkçe ve anlaşılır etiketlere dönüştür.
 */
export function normalizeObjective(objective: string): string {
  const map: Record<string, string> = {
    OUTCOME_SALES: "Satış",
    OUTCOME_TRAFFIC: "Trafik",
    OUTCOME_AWARENESS: "Bilinirlik",
    OUTCOME_ENGAGEMENT: "Etkileşim",
    OUTCOME_LEADS: "Lead",
    OUTCOME_APP_PROMOTION: "Uygulama",
    CONVERSIONS: "Satış",
    LINK_CLICKS: "Trafik",
    REACH: "Bilinirlik",
    BRAND_AWARENESS: "Bilinirlik",
    POST_ENGAGEMENT: "Etkileşim",
    LEAD_GENERATION: "Lead",
    MESSAGES: "Mesaj",
    VIDEO_VIEWS: "Video",
    // Türkçe eşleşmeler (Excel'den)
    "Satış": "Satış",
    "Trafik": "Trafik",
    "Bilinirlik": "Bilinirlik",
    "Etkileşim": "Etkileşim",
    "Potansiyel Müşteriler": "Lead",
    "Uygulama Tanıtımı": "Uygulama",
  };
  return map[objective] || objective || "Genel";
}

/**
 * Amaca göre hangi metriklerin önemli olduğunu, ağırlıklarını ve benchmark'ları belirle.
 */
function getObjectiveContext(objective: string): string {
  const obj = normalizeObjective(objective);

  switch (obj) {
    case "Satış":
      return `
KAMPANYA AMACI: SATIŞ
Bu kampanyanın birincil amacı satış/dönüşüm üretmektir.

SKOR AĞIRLIKLARI:
- ROAS: %40 (en önemli metrik)
- CPA (cost per acquisition): %25
- Conversion Rate: %15
- CTR: %10
- Frequency: %10

BENCHMARK'LAR:
- ROAS: <2x kritik, 2-3x geliştirilmeli, 3-5x iyi, >5x mükemmel
- CTR: <1% düşük, 1-2% orta, >2% iyi
- Frequency: <3 ideal, 3-4 dikkat, >4 banner yorgunluğu
- CPC benchmarkı CPA'dan türetilir

DEĞERLENDİRME: Dönüşüm ve ROAS odaklı değerlendir. ROAS yoksa veya 0 ise bu çok ciddi bir sorun.`;

    case "Trafik":
      return `
KAMPANYA AMACI: TRAFİK
Bu kampanyanın birincil amacı web sitesine trafik çekmektir. ROAS/dönüşüm BEKLENMİYOR.

SKOR AĞIRLIKLARI:
- CTR: %35 (en önemli metrik)
- CPC: %30 (düşük maliyet = verimli trafik)
- Link Click sayısı: %15
- CPM: %10
- Frequency: %10

BENCHMARK'LAR:
- CTR: <2% düşük, 2-4% orta, >4% iyi, >6% mükemmel
- CPC: <₺1 mükemmel, ₺1-3 iyi, ₺3-5 orta, >₺5 yüksek
- Frequency: <3 ideal, >4 dikkat

DEĞERLENDİRME: CTR ve CPC odaklı değerlendir. ROAS/dönüşüm olmaması SORUN DEĞİL — bu kampanyanın amacı trafik.
Kesinlikle "dönüşüm yok" veya "ROAS 0" gibi eleştiriler YAPMA.`;

    case "Bilinirlik":
      return `
KAMPANYA AMACI: MARKA BİLİNİRLİĞİ
Bu kampanyanın birincil amacı markanın geniş kitlelere ulaşmasıdır. ROAS/dönüşüm BEKLENMİYOR.

SKOR AĞIRLIKLARI:
- Reach: %35 (en önemli metrik)
- CPM: %30 (düşük CPM = verimli erişim)
- Frequency: %20 (ideal aralıkta olmalı)
- Impressions: %15

BENCHMARK'LAR:
- CPM: <₺30 mükemmel, ₺30-60 iyi, ₺60-100 orta, >₺100 yüksek
- Frequency: 1.5-3 ideal, <1.5 yetersiz tekrar, >4 aşırı tekrar
- Reach: Bütçeye oranla ne kadar kişiye ulaştığı

DEĞERLENDİRME: Reach ve CPM odaklı değerlendir. ROAS/dönüşüm/CTR olmaması SORUN DEĞİL.
Kesinlikle "dönüşüm yok" veya "ROAS 0" gibi eleştiriler YAPMA.`;

    case "Etkileşim":
      return `
KAMPANYA AMACI: ETKİLEŞİM
Bu kampanyanın birincil amacı gönderi etkileşimi, sayfa beğenisi veya profil ziyaretleri almaktır.

SKOR AĞIRLIKLARI:
- Etkileşim Oranı: %35
- Cost per Engagement: %25
- CTR: %20
- Reach: %10
- Frequency: %10

BENCHMARK'LAR:
- Etkileşim oranı: <1% düşük, 1-3% orta, >3% iyi
- CTR: <1% düşük, 1-3% orta, >3% iyi

DEĞERLENDİRME: Etkileşim ve CTR odaklı değerlendir. ROAS beklenmez.`;

    case "Lead":
      return `
KAMPANYA AMACI: LEAD GENERATION
Bu kampanyanın birincil amacı potansiyel müşteri formu doldurtmaktır.

SKOR AĞIRLIKLARI:
- Lead sayısı: %30
- CPL (cost per lead): %30
- CTR: %20
- Lead kalitesi (varsa): %10
- Frequency: %10

BENCHMARK'LAR:
- CPL: Sektöre göre değişir, genel <₺50 iyi
- CTR: <1% düşük, 1-3% orta, >3% iyi

DEĞERLENDİRME: Lead sayısı ve CPL odaklı değerlendir. ROAS değil CPL önemli.`;

    default:
      return `
KAMPANYA AMACI: GENEL
Kampanya amacı belirlenemedi. Tüm metrikleri dengeli değerlendir.

SKOR AĞIRLIKLARI: Tüm metriklere eşit ağırlık ver.`;
  }
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
  const objective = String(params.metrics.objective || params.metrics.status || "");
  const objectiveContext = getObjectiveContext(objective);
  const objectiveLabel = normalizeObjective(objective);

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
${objectiveContext}

Şu formatta JSON döndür:
{
  "campaignName": "kampanya adını aynen yaz",
  "objective": "${objectiveLabel}",
  "score": 0-100,
  "scoreReason": "skoru belirleyen 1-2 cümle — kampanya amacına göre değerlendir",
  "status": "critical" | "needs_improvement" | "good" | "excellent",
  "summary": "2-3 cümle genel değerlendirme — kampanya amacı bağlamında yaz",
  "strengths": ["güçlü yön 1", "güçlü yön 2"],
  "weaknesses": ["sorun 1", "sorun 2"],
  "anomalies": ["anomali varsa yaz, yoksa boş dizi"],
  "benchmarkComparison": {
    "primaryMetric": "kampanya amacına göre ana metriğin benchmark karşılaştırması",
    "secondaryMetric": "ikincil metrik karşılaştırması",
    "efficiency": "maliyet verimliliği değerlendirmesi"
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
1. Kampanyaları AMAÇLARINA GÖRE GRUPLA ve her grup için ayrı değerlendirme yap
2. Platform karşılaştırması yap (Meta vs Google varsa)
3. Bütçe verimliliğini değerlendir
4. Genel hesap sağlığını özetle

ÖNEMLİ: Her kampanyayı kendi amacı bağlamında değerlendir. Trafik kampanyasını satış kampanyasıyla karşılaştırma.

{
  "overallScore": 0-100,
  "overallSummary": "3-4 cümle kapsamlı özet — amaca göre gruplandırılmış değerlendirme",
  "topPerformer": { "campaignName": "...", "reason": "... (kendi amacı bağlamında)" },
  "worstPerformer": { "campaignName": "...", "reason": "... (kendi amacı bağlamında)" },
  "objectiveBreakdown": {
    "sales": { "campaignCount": 0, "totalSpend": 0, "avgRoas": 0, "totalConversions": 0, "assessment": "satış kampanyalarının genel değerlendirmesi" },
    "traffic": { "campaignCount": 0, "totalSpend": 0, "avgCtr": 0, "avgCpc": 0, "assessment": "trafik kampanyalarının genel değerlendirmesi" },
    "awareness": { "campaignCount": 0, "totalSpend": 0, "totalReach": 0, "avgCpm": 0, "assessment": "bilinirlik kampanyalarının değerlendirmesi" }
  },
  "platformComparison": {
    "meta": { "avgRoas": 0, "totalSpend": 0, "assessment": "..." },
    "google": { "avgRoas": 0, "totalSpend": 0, "assessment": "..." }
  },
  "budgetEfficiency": "bütçenin amaçlara göre dağılımı ve verimliliği",
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
- Her kampanyanın amacını (objective) dikkate al
- Trafik kampanyasına "ROAS artır" gibi uygunsuz aksiyonlar önerme
- "Acil" aksiyonlar bu hafta içinde yapılabilir ve somut olmalı
- "Aylık" aksiyonlar 2–4 hafta içinde uygulanabilir
- Her aksiyon için beklenen etkiyi mutlaka belirt
- Durdurulması gereken kampanyaları açıkça söyle — ama amacına göre değerlendir
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
