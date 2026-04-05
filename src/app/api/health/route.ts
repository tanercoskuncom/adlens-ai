import { NextResponse } from "next/server";
import { isDatabaseConnected } from "@/lib/prisma";

export async function GET() {
  const dbConnected = await isDatabaseConnected();
  const hasApiKey =
    !!process.env.ANTHROPIC_API_KEY &&
    !process.env.ANTHROPIC_API_KEY.includes("PLACEHOLDER");

  return NextResponse.json({
    status: "ok",
    database: dbConnected,
    ai: hasApiKey,
    version: "1.0.0",
  });
}
