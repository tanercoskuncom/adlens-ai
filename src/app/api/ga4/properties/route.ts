import { NextRequest, NextResponse } from "next/server";
import { getGA4Properties, refreshAccessToken } from "@/lib/ga4/client";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json();

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ error: "Token gerekli" }, { status: 400 });
    }

    let token = accessToken;

    // Try with access token, fallback to refresh
    try {
      const properties = await getGA4Properties(token);
      return NextResponse.json({ success: true, properties });
    } catch {
      if (!refreshToken) throw new Error("Access token expired and no refresh token");
      token = await refreshAccessToken(refreshToken);
      const properties = await getGA4Properties(token);
      return NextResponse.json({ success: true, properties, newAccessToken: token });
    }
  } catch (err) {
    console.error("GA4 properties error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "GA4 property listesi alınamadı" },
      { status: 500 }
    );
  }
}
