/* eslint-disable @typescript-eslint/no-explicit-any */
const META_API_VERSION = "v21.0";
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export interface MetaAdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  business_name?: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
}

export interface MetaCampaignInsight {
  campaign_name: string;
  campaign_id: string;
  spend: string;
  impressions: string;
  reach: string;
  clicks: string;
  ctr: string;
  cpc: string;
  cpm: string;
  frequency: string;
  actions?: { action_type: string; value: string }[];
  action_values?: { action_type: string; value: string }[];
  cost_per_action_type?: { action_type: string; value: string }[];
}

/**
 * Meta Graph API'den paginated veri çek.
 */
async function paginatedFetch(initialUrl: string, token: string, params: Record<string, string>): Promise<any[]> {
  const results: any[] = [];
  let nextUrl: string | null = initialUrl;

  while (nextUrl) {
    const u: URL = new URL(nextUrl);
    if (!u.searchParams.has("access_token")) {
      u.searchParams.set("access_token", token);
    }
    for (const [k, v] of Object.entries(params)) {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }

    const response: Response = await fetch(u.toString());
    const body: any = await response.json();

    if (body.error) throw new Error(`Meta API Error: ${body.error.message} (code: ${body.error.code})`);

    results.push(...(body.data || []));
    nextUrl = body.paging?.next || null;
  }

  return results;
}

/**
 * Kullanıcının erişebildiği reklam hesaplarını getir.
 */
export async function getAdAccounts(token: string): Promise<MetaAdAccount[]> {
  const accounts = await paginatedFetch(`${META_BASE_URL}/me/adaccounts`, token, {
    fields: "id,name,account_status,currency,business_name",
    limit: "100",
  });

  // Sadece aktif hesapları döndür (status 1 = ACTIVE)
  return (accounts as MetaAdAccount[]).filter((a) => a.account_status === 1);
}

/**
 * Bir reklam hesabındaki kampanyaları getir.
 */
export async function getCampaigns(token: string, accountId: string): Promise<MetaCampaign[]> {
  const campaigns = await paginatedFetch(`${META_BASE_URL}/${accountId}/campaigns`, token, {
    fields: "id,name,status,objective,daily_budget,lifetime_budget",
    limit: "100",
  });

  return campaigns as MetaCampaign[];
}

/**
 * Kampanya insights verilerini çek.
 */
export async function getCampaignInsights(
  token: string,
  accountId: string,
  since: string,
  until: string
): Promise<MetaCampaignInsight[]> {
  const insights = await paginatedFetch(`${META_BASE_URL}/${accountId}/insights`, token, {
    level: "campaign",
    fields: [
      "campaign_name", "campaign_id",
      "spend", "impressions", "reach", "clicks",
      "ctr", "cpc", "cpm", "frequency",
      "actions", "action_values", "cost_per_action_type",
    ].join(","),
    time_range: JSON.stringify({ since, until }),
    limit: "100",
  });

  return insights as MetaCampaignInsight[];
}

/**
 * Insights verisinden purchase/conversion çıkar.
 */
export function extractConversions(insight: MetaCampaignInsight) {
  const purchaseTypes = [
    "omni_purchase",
    "purchase",
    "offsite_conversion.fb_pixel_purchase",
  ];

  const actions = insight.actions || [];
  const actionValues = insight.action_values || [];
  const costPerAction = insight.cost_per_action_type || [];

  const purchaseAction = actions.find((a) => purchaseTypes.includes(a.action_type));
  const purchaseValue = actionValues.find((a) => purchaseTypes.includes(a.action_type));
  const purchaseCost = costPerAction.find((a) => purchaseTypes.includes(a.action_type));

  const conversions = purchaseAction ? parseInt(purchaseAction.value) : 0;
  const conversionValue = purchaseValue ? parseFloat(purchaseValue.value) : 0;
  const costPerResult = purchaseCost ? parseFloat(purchaseCost.value) : 0;
  const roas = parseFloat(insight.spend) > 0 && conversionValue > 0
    ? conversionValue / parseFloat(insight.spend)
    : 0;

  return { conversions, conversionValue, costPerResult, roas };
}

/**
 * Token'ın geçerliliğini kontrol et.
 */
export async function validateToken(token: string): Promise<{ valid: boolean; name?: string; userId?: string }> {
  try {
    const response: Response = await fetch(`${META_BASE_URL}/me?fields=id,name&access_token=${token}`);
    const body: any = await response.json();
    if (body.error) return { valid: false };
    return { valid: true, name: body.name, userId: body.id };
  } catch {
    return { valid: false };
  }
}
