export interface CampaignAnalysis {
  campaignName: string;
  score: number;
  scoreReason: string;
  status: "critical" | "needs_improvement" | "good" | "excellent";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  anomalies: string[];
  benchmarkComparison?: {
    roas: string;
    ctr: string;
    cpc: string;
  };
  actions: ActionItem[];
}

export interface ActionItem {
  priority: "urgent" | "monthly" | "longterm";
  action: string;
  expectedImpact: string;
  metric: string;
}

export interface OverallReport {
  overallScore: number;
  overallSummary: string;
  topPerformer: {
    campaignName: string;
    reason: string;
  };
  worstPerformer: {
    campaignName: string;
    reason: string;
  };
  platformComparison?: {
    meta: { avgRoas: number; totalSpend: number; assessment: string };
    google: { avgRoas: number; totalSpend: number; assessment: string };
  };
  budgetEfficiency: string;
  accountHealth: "critical" | "needs_improvement" | "good" | "excellent";
  keyInsights: string[];
}

export interface ActionPlan {
  urgentActions: DetailedAction[];
  monthlyActions: DetailedAction[];
  longtermActions: DetailedAction[];
  campaignsToStop: {
    campaignName: string;
    reason: string;
    budgetReallocation: string;
  }[];
  budgetRecommendation: {
    currentTotal: number;
    recommendedTotal: number;
    rationale: string;
  };
}

export interface DetailedAction {
  title: string;
  description: string;
  campaign: string;
  expectedImpact: string;
  effort: "low" | "medium" | "high";
}

export interface NewCampaignSuggestion {
  title: string;
  platform: "Meta" | "Google" | "Her İkisi";
  campaignType: string;
  objective: string;
  targetAudience: string;
  estimatedBudget: {
    monthly: number;
    currency: "TRY" | "USD";
  };
  estimatedRoas: {
    min: number;
    max: number;
  };
  rationale: string;
  setupSteps: string[];
  kpis: string[];
  timeToResults: string;
}

export interface FullAnalysisResult {
  campaignAnalyses: CampaignAnalysis[];
  overallReport: OverallReport;
  actionPlan: ActionPlan;
  newCampaignSuggestions: NewCampaignSuggestion[];
}
