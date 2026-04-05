export type Platform = "META" | "GOOGLE" | "UNKNOWN";

export interface CampaignData {
  name: string;
  platform: "META" | "GOOGLE";
  metrics: Record<string, number | string>;
}

export interface NormalizedCampaign {
  campaignName: string;
  platform: Platform;
  adSetName?: string;
  adGroup?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spend: number;
  roas?: number;
  // Meta-specific
  reach?: number;
  frequency?: number;
  cpm?: number;
  results?: number;
  costPerResult?: number;
  // Google-specific
  conversions?: number;
  convRate?: number;
  costPerConv?: number;
  impressionShare?: number;
}
