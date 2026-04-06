import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/ga4/client";

export async function GET() {
  try {
    const url = getAuthUrl();
    return NextResponse.json({ url });
  } catch (err) {
    console.error("GA4 auth URL error:", err);
    return NextResponse.json(
      { error: "Google OAuth yapılandırması eksik. GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET .env dosyasına ekleyin." },
      { status: 500 }
    );
  }
}
