export interface CampaignMetrics {
  spend?: number;
  impressions?: number;
  reach?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  roas?: number;
  conversions?: number;
  costPerResult?: number;
  frequency?: number;
  conversionValue?: number;
}

export interface CampaignAnalysis {
  campaignName: string;
  objective?: string;
  score: number;
  scoreReason: string;
  status: "critical" | "needs_improvement" | "good" | "excellent";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  anomalies: string[];
  metrics?: CampaignMetrics;
  benchmarkComparison?: Record<string, string>;
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
  objectiveBreakdown?: {
    sales?: { campaignCount: number; totalSpend: number; avgRoas: number; totalConversions: number; assessment: string };
    traffic?: { campaignCount: number; totalSpend: number; avgCtr: number; avgCpc: number; assessment: string };
    awareness?: { campaignCount: number; totalSpend: number; totalReach: number; avgCpm: number; assessment: string };
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
