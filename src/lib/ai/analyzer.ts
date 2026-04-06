import { anthropic, AI_MODEL } from "./client";
import {
  buildCampaignAnalysisPrompt,
  buildOverallReportPrompt,
  buildActionPlanPrompt,
  buildNewCampaignPrompt,
  normalizeObjective,
} from "./prompts";
import type { CampaignData } from "@/types/campaign";
import type {
  CampaignAnalysis,
  OverallReport,
  ActionPlan,
  NewCampaignSuggestion,
  FullAnalysisResult,
} from "@/types/analysis";

function extractJSON<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("JSON çıktısı bulunamadı");
  return JSON.parse(match[0]) as T;
}

async function callClaude(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Beklenmeyen yanıt tipi");
  return block.text;
}

async function analyzeSingleCampaign(
  campaign: CampaignData,
  template: string,
  dateRange: string,
  language: "tr" | "en"
): Promise<CampaignAnalysis> {
  const prompt = buildCampaignAnalysisPrompt({
    platform: campaign.platform,
    campaignName: campaign.name,
    template,
    dateRange,
    metrics: campaign.metrics,
    language,
  });

  const text = await callClaude(prompt);
  const result = extractJSON<CampaignAnalysis>(text);
  // AI döndürmese bile garanti et
  result.campaignName = campaign.name;
  result.objective = normalizeObjective(String(campaign.metrics.objective || ""));
  return result;
}

export async function runFullAnalysis(params: {
  campaigns: CampaignData[];
  clientName: string;
  template?: string;
  dateRange?: string;
  language?: "tr" | "en";
}): Promise<FullAnalysisResult> {
  const {
    campaigns,
    clientName,
    template = "general",
    dateRange = "",
    language = "tr",
  } = params;

  // Aşama 1: Her kampanya için paralel analiz
  const campaignAnalyses = await Promise.all(
    campaigns.map((c) =>
      analyzeSingleCampaign(c, template, dateRange, language)
    )
  );

  // Aşama 2: Genel rapor
  const platforms = [
    ...new Set(campaigns.map((c) => c.platform)),
  ].join(" + ");
  const totalSpend = campaigns.reduce(
    (sum, c) => sum + (Number(c.metrics.spend) || 0),
    0
  );

  const overallText = await callClaude(
    buildOverallReportPrompt({
      campaignCount: campaigns.length,
      clientName,
      platforms,
      totalSpend,
      dateRange,
      campaignAnalyses,
      language,
    })
  );
  const overallReport = extractJSON<OverallReport>(overallText);

  // Aşama 3: Aksiyon planı
  const actionText = await callClaude(
    buildActionPlanPrompt({
      clientName,
      template,
      overallScore: overallReport.overallScore,
      allAnalyses: { campaignAnalyses, overallReport },
      language,
    })
  );
  const actionPlan = extractJSON<ActionPlan>(actionText);

  // Aşama 4: Yeni kampanya önerileri
  const suggestionsText = await callClaude(
    buildNewCampaignPrompt({
      clientName,
      template,
      totalSpend,
      platforms,
      overallScore: overallReport.overallScore,
      campaignSummary: campaignAnalyses.map((ca) => ({
        name: ca.campaignName,
        objective: ca.objective,
        score: ca.score,
        status: ca.status,
      })),
      language,
    })
  );
  const { suggestions: newCampaignSuggestions } = extractJSON<{
    suggestions: NewCampaignSuggestion[];
  }>(suggestionsText);

  return {
    campaignAnalyses,
    overallReport,
    actionPlan,
    newCampaignSuggestions,
  };
}
