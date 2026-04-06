import { NextRequest, NextResponse } from "next/server";
import { getAdAccounts, validateToken } from "@/lib/meta/client";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token gerekli" }, { status: 400 });
    }

    const validation = await validateToken(token);
    if (!validation.valid) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş token" }, { status: 401 });
    }

    const accounts = await getAdAccounts(token);

    return NextResponse.json({
      success: true,
      user: { name: validation.name, id: validation.userId },
      accounts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Hesaplar alınamadı" },
      { status: 500 }
    );
  }
}
