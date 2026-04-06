import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignInsights,
  getCampaigns,
  extractConversions,
  validateToken,
} from "@/lib/meta/client";
import { runFullAnalysis } from "@/lib/ai/analyzer";
import type { CampaignData } from "@/types/campaign";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      token,
      accountId,
      since,
      until,
      clientName = "Müşteri",
      language = "tr",
      template = "general",
      activeOnly = true,
    } = body;

    if (!token || !accountId || !since || !until) {
      return NextResponse.json(
        { error: "token, accountId, since, until alanları gerekli" },
        { status: 400 }
      );
    }

    const validation = await validateToken(token);
    if (!validation.valid) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş token" }, { status: 401 });
    }

    // Kampanya listesini al (aktif/pasif durumu için)
    const allCampaigns = await getCampaigns(token, accountId);
    const campaignStatusMap = new Map(
      allCampaigns.map((c) => [c.id, { status: c.status, objective: c.objective }])
    );

    // Insights verilerini çek
    const insights = await getCampaignInsights(token, accountId, since, until);

    if (insights.length === 0) {
      return NextResponse.json(
        { error: "Bu tarih aralığında kampanya verisi bulunamadı." },
        { status: 400 }
      );
    }

    // Aktif filtre
    const filteredInsights = activeOnly
      ? insights.filter((i) => {
          const info = campaignStatusMap.get(i.campaign_id);
          return info?.status === "ACTIVE";
        })
      : insights;

    if (filteredInsights.length === 0) {
      return NextResponse.json(
        { error: "Bu tarih aralığında aktif kampanya bulunamadı. Pasif kampanyaları da dahil etmek için 'activeOnly' seçeneğini kapatın." },
        { status: 400 }
      );
    }

    // CampaignData formatına dönüştür
    const campaigns: CampaignData[] = filteredInsights.map((insight) => {
      const conv = extractConversions(insight);
      const info = campaignStatusMap.get(insight.campaign_id);

      return {
        name: insight.campaign_name,
        platform: "META" as const,
        metrics: {
          spend: parseFloat(insight.spend) || 0,
          impressions: parseInt(insight.impressions) || 0,
          reach: parseInt(insight.reach) || 0,
          clicks: parseInt(insight.clicks) || 0,
          ctr: parseFloat(insight.ctr) || 0,
          cpc: parseFloat(insight.cpc) || 0,
          cpm: parseFloat(insight.cpm) || 0,
          frequency: parseFloat(insight.frequency) || 0,
          roas: conv.roas,
          conversions: conv.conversions,
          results: conv.conversions,
          conversionValue: conv.conversionValue,
          costPerResult: conv.costPerResult,
          objective: info?.objective ?? "",
          status: info?.status ?? "UNKNOWN",
        },
      };
    });

    // AI analizi çalıştır
    const result = await runFullAnalysis({
      campaigns,
      clientName,
      template,
      language: language as "tr" | "en",
    });

    // Ham metrikleri kampanya analizlerine ekle
    for (const ca of result.campaignAnalyses) {
      const match = campaigns.find((c) => c.name === ca.campaignName);
      if (match) {
        const m = match.metrics;
        ca.metrics = {
          spend: Number(m.spend) || 0,
          impressions: Number(m.impressions) || 0,
          reach: Number(m.reach) || 0,
          clicks: Number(m.clicks) || 0,
          ctr: Number(m.ctr) || 0,
          cpc: Number(m.cpc) || 0,
          cpm: Number(m.cpm) || 0,
          roas: Number(m.roas) || 0,
          conversions: Number(m.conversions) || 0,
          costPerResult: Number(m.costPerResult) || 0,
          frequency: Number(m.frequency) || 0,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        platform: "META",
        campaignCount: campaigns.length,
        dateRange: `${since} - ${until}`,
        activeOnly,
        totalCampaigns: allCampaigns.length,
        activeCampaigns: allCampaigns.filter((c) => c.status === "ACTIVE").length,
      },
    });
  } catch (error) {
    console.error("Meta insights error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Meta verileri alınamadı" },
      { status: 500 }
    );
  }
}
