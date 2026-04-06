import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { google } from "googleapis";

// OAuth2 client factory
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/ga4/auth/callback`
  );
}

// Generate OAuth2 authorization URL
export function getAuthUrl(): string {
  const oauth2 = createOAuth2Client();
  return oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });
}

// Exchange authorization code for tokens
export async function exchangeCode(code: string) {
  const oauth2 = createOAuth2Client();
  const { tokens } = await oauth2.getToken(code);
  return tokens;
}

// Get user info from access token
export async function getUserInfo(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to get user info");
  return res.json() as Promise<{ email: string; name: string; picture?: string }>;
}

// Create GA4 Data API client with access token
function createGA4Client(accessToken: string) {
  const oauth2 = createOAuth2Client();
  oauth2.setCredentials({ access_token: accessToken });

  return new BetaAnalyticsDataClient({
    authClient: oauth2 as never,
  });
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const oauth2 = createOAuth2Client();
  oauth2.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2.refreshAccessToken();
  if (!credentials.access_token) throw new Error("Failed to refresh token");
  return credentials.access_token;
}

// List GA4 properties the user has access to
export async function getGA4Properties(accessToken: string) {
  const res = await fetch(
    "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Failed to list GA4 properties");
  }

  const data = await res.json();
  const properties: GA4Property[] = [];

  for (const account of data.accountSummaries || []) {
    for (const prop of account.propertySummaries || []) {
      properties.push({
        propertyId: prop.property.replace("properties/", ""),
        displayName: prop.displayName,
        accountName: account.displayName,
      });
    }
  }

  return properties;
}

export interface GA4Property {
  propertyId: string;
  displayName: string;
  accountName: string;
}

// Core metrics report
export interface GA4ReportData {
  overview: {
    totalUsers: number;
    newUsers: number;
    sessions: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
    purchaseRevenue: number;
    ecommercePurchases: number;
    ecommerceConversionRate: number;
  };
  demographics: {
    gender: { label: string; value: number }[];
    ageGroup: { label: string; value: number }[];
  };
  devices: { device: string; users: number; sessions: number }[];
  cities: { city: string; users: number; sessions: number; bounceRate: number }[];
  dailyTrend: { date: string; users: number; sessions: number; revenue: number }[];
}

export async function getGA4Report(
  accessToken: string,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<GA4ReportData> {
  const client = createGA4Client(accessToken);
  const property = `properties/${propertyId}`;

  // Run multiple reports in parallel
  const [overviewRes, demographicsRes, deviceRes, cityRes, trendRes] = await Promise.all([
    // Overview metrics
    client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "purchaseRevenue" },
        { name: "ecommercePurchases" },
      ],
    }),
    // Demographics: gender + age
    client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "userGender" }],
      metrics: [{ name: "totalUsers" }],
    }),
    // Devices
    client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }],
      limit: 10,
    }),
    // Cities
    client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "city" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "bounceRate" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 15,
    }),
    // Daily trend
    client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "purchaseRevenue" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
  ]);

  // Parse overview
  const ov = overviewRes[0]?.rows?.[0]?.metricValues || [];
  const overview = {
    totalUsers: Number(ov[0]?.value || 0),
    newUsers: Number(ov[1]?.value || 0),
    sessions: Number(ov[2]?.value || 0),
    pageViews: Number(ov[3]?.value || 0),
    avgSessionDuration: Number(ov[4]?.value || 0),
    bounceRate: Number(ov[5]?.value || 0),
    purchaseRevenue: Number(ov[6]?.value || 0),
    ecommercePurchases: Number(ov[7]?.value || 0),
    ecommerceConversionRate: 0,
  };
  if (overview.sessions > 0) {
    overview.ecommerceConversionRate = (overview.ecommercePurchases / overview.sessions) * 100;
  }

  // Parse demographics - gender
  const gender = (demographicsRes[0]?.rows || []).map((row) => ({
    label: row.dimensionValues?.[0]?.value || "unknown",
    value: Number(row.metricValues?.[0]?.value || 0),
  }));

  // Age group - separate request
  const ageRes = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "userAgeBracket" }],
    metrics: [{ name: "totalUsers" }],
  });
  const ageGroup = (ageRes[0]?.rows || []).map((row) => ({
    label: row.dimensionValues?.[0]?.value || "unknown",
    value: Number(row.metricValues?.[0]?.value || 0),
  }));

  // Parse devices
  const devices = (deviceRes[0]?.rows || []).map((row) => ({
    device: row.dimensionValues?.[0]?.value || "unknown",
    users: Number(row.metricValues?.[0]?.value || 0),
    sessions: Number(row.metricValues?.[1]?.value || 0),
  }));

  // Parse cities
  const cities = (cityRes[0]?.rows || []).map((row) => ({
    city: row.dimensionValues?.[0]?.value || "unknown",
    users: Number(row.metricValues?.[0]?.value || 0),
    sessions: Number(row.metricValues?.[1]?.value || 0),
    bounceRate: Number(row.metricValues?.[2]?.value || 0),
  }));

  // Parse daily trend
  const dailyTrend = (trendRes[0]?.rows || []).map((row) => {
    const d = row.dimensionValues?.[0]?.value || "";
    return {
      date: d ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : "",
      users: Number(row.metricValues?.[0]?.value || 0),
      sessions: Number(row.metricValues?.[1]?.value || 0),
      revenue: Number(row.metricValues?.[2]?.value || 0),
    };
  });

  return { overview, demographics: { gender, ageGroup }, devices, cities, dailyTrend };
}
