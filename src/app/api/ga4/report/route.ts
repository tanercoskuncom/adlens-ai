import { NextRequest, NextResponse } from "next/server";
import { getGA4Report, refreshAccessToken } from "@/lib/ga4/client";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken, propertyId, startDate, endDate } = await request.json();

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json({ error: "propertyId, startDate ve endDate gerekli" }, { status: 400 });
    }

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ error: "Token gerekli" }, { status: 400 });
    }

    let token = accessToken;

    try {
      const report = await getGA4Report(token, propertyId, startDate, endDate);
      return NextResponse.json({ success: true, report });
    } catch {
      if (!refreshToken) throw new Error("Access token expired and no refresh token");
      token = await refreshAccessToken(refreshToken);
      const report = await getGA4Report(token, propertyId, startDate, endDate);
      return NextResponse.json({ success: true, report, newAccessToken: token });
    }
  } catch (err) {
    console.error("GA4 report error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "GA4 raporu alınamadı" },
      { status: 500 }
    );
  }
}
