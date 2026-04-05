import type { FullAnalysisResult } from "@/types/analysis";

export const DEMO_RESULT: FullAnalysisResult = {
  campaignAnalyses: [
    {
      campaignName: "Brand Awareness - Geniş Kitle",
      score: 72,
      scoreReason: "CPM makul seviyede ama CTR sektör ortalamasının altında",
      status: "good",
      summary:
        "Marka bilinirliği kampanyası genel olarak iyi performans gösteriyor. Erişim ve gösterim sayıları hedeflerin üzerinde ancak tıklama oranı iyileştirilmeli.",
      strengths: [
        "Geniş erişim: 450K unique kullanıcıya ulaşıldı",
        "CPM sektör ortalamasının %15 altında",
      ],
      weaknesses: [
        "CTR %0.8 — sektör ortalaması %1.2",
        "Frequency 4.2 — banner yorgunluğu riski",
      ],
      anomalies: ["Son 7 günde CPM %22 artış gösterdi"],
      benchmarkComparison: {
        roas: "Sektör ortalamasının %10 üstünde",
        ctr: "Sektör ortalamasının %33 altında",
        cpc: "Sektör ortalamasıyla eşit",
      },
      actions: [
        {
          priority: "urgent",
          action: "Kreatif setlerini yenileyin, banner yorgunluğu başlamış",
          expectedImpact: "CTR %30-50 artabilir",
          metric: "CTR",
        },
        {
          priority: "monthly",
          action: "Lookalike kitleyi %1'den %3'e genişletin",
          expectedImpact: "Erişim %40 artabilir, CPM stabil kalmalı",
          metric: "Reach",
        },
      ],
    },
    {
      campaignName: "Retargeting - Sepet Terk",
      score: 88,
      scoreReason: "ROAS 5.2x ile mükemmel seviyede, conversion rate yüksek",
      status: "excellent",
      summary:
        "Retargeting kampanyası çok güçlü performans gösteriyor. ROAS 5.2x ile portföydeki en verimli kampanya. Bütçe artırımı önerilir.",
      strengths: [
        "ROAS 5.2x — portföyün en yüksek getirisi",
        "Conversion rate %4.8 — sektör ortalamasının 2x üstünde",
        "CPA hedef bütçenin %30 altında",
      ],
      weaknesses: [
        "Kitle havuzu küçülüyor — son 30 günde %15 daralma",
      ],
      anomalies: [],
      benchmarkComparison: {
        roas: "Sektör ortalamasının %160 üstünde",
        ctr: "Sektör ortalamasının %80 üstünde",
        cpc: "Sektör ortalamasının %20 altında",
      },
      actions: [
        {
          priority: "urgent",
          action: "Bütçeyi %30 artırın — ROAS bunu kaldırır",
          expectedImpact: "Aylık gelir +%25-30 artış beklenir",
          metric: "ROAS",
        },
        {
          priority: "monthly",
          action: "Dinamik ürün reklamlarına geçiş yapın",
          expectedImpact: "CTR %15-20 iyileşme",
          metric: "CTR",
        },
      ],
    },
    {
      campaignName: "Google Search - Marka Kelimeleri",
      score: 91,
      scoreReason:
        "Impression Share %92, CPC çok düşük, conversion rate yüksek",
      status: "excellent",
      summary:
        "Marka anahtar kelimeler mükemmel performans gösteriyor. Rakip koruma açısından Impression Share %92 ile güvenli seviyede.",
      strengths: [
        "Impression Share %92 — rakip penetrasyonu düşük",
        "CPC ₺0.45 — sektörün çok altında",
        "Conversion Rate %12.5",
      ],
      weaknesses: [
        "Budget limited Impression Share %8 kaybediliyor",
      ],
      anomalies: [],
      benchmarkComparison: {
        roas: "Sektör ortalamasının %200 üstünde",
        ctr: "Sektör ortalamasının %150 üstünde",
        cpc: "Sektör ortalamasının %60 altında",
      },
      actions: [
        {
          priority: "monthly",
          action: "Günlük bütçeyi %10 artırarak Imp. Share'i %95+ yapın",
          expectedImpact: "Kaçırılan %8 gösterim geri kazanılır",
          metric: "Impression Share",
        },
      ],
    },
    {
      campaignName: "Google Search - Genel Anahtar Kelimeler",
      score: 45,
      scoreReason: "ROAS 1.3x ile kritik seviyede, CPC çok yüksek",
      status: "needs_improvement",
      summary:
        "Genel anahtar kelimeler kampanyası bütçe harcıyor ama yeterli dönüşüm getirmiyor. Negatif kelime optimizasyonu ve bid stratejisi değişikliği şart.",
      strengths: ["Impression hacmi yüksek — marka görünürlüğüne katkı"],
      weaknesses: [
        "ROAS 1.3x — karlılık eşiğinin altında",
        "CPC ₺8.50 — bütçenin %60'ını tek başına harcıyor",
        "Quality Score ortalama 4/10",
      ],
      anomalies: [
        "Son 14 günde CPC %35 artış — rakip baskısı olabilir",
      ],
      benchmarkComparison: {
        roas: "Sektör ortalamasının %45 altında",
        ctr: "Sektör ortalamasının %20 altında",
        cpc: "Sektör ortalamasının %70 üstünde",
      },
      actions: [
        {
          priority: "urgent",
          action:
            "Negatif kelime listesine 'ücretsiz', 'bedava', 'nedir' ekleyin",
          expectedImpact: "CPC %20-30 düşebilir, CTR artabilir",
          metric: "CPC",
        },
        {
          priority: "urgent",
          action: "Quality Score 4/10 olan reklamları yeniden yazın",
          expectedImpact: "QS 6+ olursa CPC %40'a kadar düşebilir",
          metric: "Quality Score",
        },
        {
          priority: "monthly",
          action: "Bid stratejisini Manual CPC'den Target ROAS'a geçirin",
          expectedImpact: "ROAS 1.3x'ten 2.5x+ hedefi",
          metric: "ROAS",
        },
      ],
    },
  ],
  overallReport: {
    overallScore: 68,
    overallSummary:
      "Hesap genel olarak geliştirilmeli seviyesinde. Retargeting ve marka kelimeleri mükemmel performans gösterirken, genel anahtar kelimeler kampanyası bütçeyi verimsiz kullanıyor. Bütçe dağılımı optimize edilmeli — yüksek ROAS'lı kampanyalara yönlendirme yapılmalı.",
    topPerformer: {
      campaignName: "Google Search - Marka Kelimeleri",
      reason: "91 skor, %12.5 conversion rate, en düşük CPC",
    },
    worstPerformer: {
      campaignName: "Google Search - Genel Anahtar Kelimeler",
      reason: "45 skor, ROAS 1.3x ile karlılık eşiğinin altında",
    },
    platformComparison: {
      meta: {
        avgRoas: 3.1,
        totalSpend: 15000,
        assessment:
          "Meta kampanyaları ortalama ROAS 3.1x ile sağlıklı. Retargeting öne çıkıyor.",
      },
      google: {
        avgRoas: 4.2,
        totalSpend: 22000,
        assessment:
          "Google toplamda daha yüksek ROAS ama genel kelimeler ortalamayı düşürüyor.",
      },
    },
    budgetEfficiency:
      "Toplam ₺37.000 harcamanın %60'ı Google'da. Genel kelimeler kampanyasının bütçesinin %40'ı retargeting'e aktarılırsa toplam ROAS %35 artabilir.",
    accountHealth: "needs_improvement",
    keyInsights: [
      "Retargeting en verimli kampanya — bütçe artırımı öncelik",
      "Genel kelimeler ROAS 1.3x — acil optimizasyon gerekli",
      "Banner yorgunluğu riski — awareness kreatiflerini yenileyin",
    ],
  },
  actionPlan: {
    urgentActions: [
      {
        title: "Genel kelimeler negatif liste güncellemesi",
        description:
          "Google Search genel kelimeler kampanyasına 'ücretsiz', 'bedava', 'nedir', 'nasıl yapılır' negatif kelimelerini ekleyin",
        campaign: "Google Search - Genel Anahtar Kelimeler",
        expectedImpact: "CPC %20-30 düşüş, CTR artışı",
        effort: "low",
      },
      {
        title: "Awareness kreatiflerini yenileyin",
        description:
          "Frequency 4.2'ye ulaşmış — yeni görsel ve metin setleri hazırlayın",
        campaign: "Brand Awareness - Geniş Kitle",
        expectedImpact: "CTR %30-50 artış beklenir",
        effort: "medium",
      },
      {
        title: "Retargeting bütçesini %30 artırın",
        description:
          "ROAS 5.2x olan kampanyanın bütçesini artırarak gelir maksimize edilebilir",
        campaign: "Retargeting - Sepet Terk",
        expectedImpact: "Aylık gelir +%25-30",
        effort: "low",
      },
    ],
    monthlyActions: [
      {
        title: "Google Ads bid stratejisi değişikliği",
        description:
          "Genel kelimeler kampanyasını Manual CPC'den Target ROAS stratejisine geçirin",
        campaign: "Google Search - Genel Anahtar Kelimeler",
        expectedImpact: "ROAS 1.3x → 2.5x+ hedefi",
        effort: "medium",
      },
      {
        title: "Dinamik ürün reklamlarına geçiş",
        description:
          "Retargeting kampanyasında statik banner yerine DPA kullanın",
        campaign: "Retargeting - Sepet Terk",
        expectedImpact: "CTR %15-20 iyileşme",
        effort: "high",
      },
    ],
    longtermActions: [
      {
        title: "Lookalike kitle genişletmesi",
        description:
          "Meta Lookalike kitlesini %1'den %3'e genişleterek awareness kampanyasının erişimini artırın",
        campaign: "Brand Awareness - Geniş Kitle",
        expectedImpact: "Erişim %40 artış",
        effort: "low",
      },
    ],
    campaignsToStop: [
      {
        campaignName: "Google Search - Genel Anahtar Kelimeler",
        reason:
          "ROAS 1.3x ile 2 haftadır karlılık eşiğinin altında. Optimizasyon yapılmazsa durdurulmalı.",
        budgetReallocation:
          "Bütçenin %60'ını retargeting'e, %40'ını marka kelimelerine aktarın",
      },
    ],
    budgetRecommendation: {
      currentTotal: 37000,
      recommendedTotal: 37000,
      rationale:
        "Toplam bütçe yeterli, dağılım değişmeli. Genel kelimelerden retargeting'e %40 aktarım önerilir.",
    },
  },
  newCampaignSuggestions: [
    {
      title: "Meta - Video Görüntüleme Kampanyası",
      platform: "Meta",
      campaignType: "video",
      objective:
        "Marka bilinirliğini video ile güçlendirmek, retargeting havuzunu büyütmek",
      targetAudience: "25-45 yaş, e-ticaret ilgisi, mevcut web ziyaretçileri",
      estimatedBudget: { monthly: 5000, currency: "TRY" },
      estimatedRoas: { min: 2.0, max: 3.5 },
      rationale:
        "Awareness kampanyasının banner yorgunluğu yaşıyor. Video formatı ile taze içerik sunulabilir ve %75 video izleme kitlesinden retargeting havuzu oluşturulabilir.",
      setupSteps: [
        "15-30 sn ürün tanıtım videosu hazırlayın",
        "ThruPlay optimizasyonu seçin",
        "Video izleyenlerden özel kitle oluşturun",
        "Bu kitleden retargeting kampanyası besleyin",
      ],
      kpis: ["Video İzleme Oranı", "ThruPlay Maliyeti", "Kitle Büyüme Hızı"],
      timeToResults: "2-3 hafta",
    },
    {
      title: "Google Shopping Kampanyası",
      platform: "Google",
      campaignType: "shopping",
      objective: "Ürün bazlı aramalardan direkt satış",
      targetAudience: "Ürün arayan kullanıcılar",
      estimatedBudget: { monthly: 8000, currency: "TRY" },
      estimatedRoas: { min: 3.0, max: 6.0 },
      rationale:
        "Search kampanyaları aktif ama Shopping yok. Ürün görselli reklamlar genellikle text reklamlardan %20-30 daha yüksek CTR alır.",
      setupSteps: [
        "Google Merchant Center hesabı kurun",
        "Ürün feed'i oluşturun",
        "Performance Max kampanyası açın",
        "İlk 2 hafta veri toplamaya izin verin",
      ],
      kpis: ["ROAS", "Tıklama Oranı", "Ürün Başına Maliyet"],
      timeToResults: "3-4 hafta",
    },
  ],
};
