import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getUserInfo } from "@/lib/ga4/client";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?ga4_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/settings?ga4_error=no_code", request.url)
    );
  }

  try {
    const tokens = await exchangeCode(code);
    const user = await getUserInfo(tokens.access_token!);

    // Redirect to settings with tokens encoded in URL fragment (not sent to server)
    const params = new URLSearchParams({
      ga4_success: "1",
      ga4_access_token: tokens.access_token || "",
      ga4_refresh_token: tokens.refresh_token || "",
      ga4_email: user.email || "",
      ga4_name: user.name || "",
    });

    return NextResponse.redirect(
      new URL(`/settings?${params.toString()}`, request.url)
    );
  } catch (err) {
    console.error("GA4 token exchange error:", err);
    return NextResponse.redirect(
      new URL(`/settings?ga4_error=token_exchange_failed`, request.url)
    );
  }
}
