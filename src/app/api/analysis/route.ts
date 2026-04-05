import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { detectPlatformFromHeaders } from "@/lib/excel/detector";
import { normalizeSheet } from "@/lib/excel/normalizer";
import { runFullAnalysis } from "@/lib/ai/analyzer";
import { prisma, isDatabaseConnected } from "@/lib/prisma";
import type { CampaignData } from "@/types/campaign";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const language = (formData.get("language") as "tr" | "en") ?? "tr";
    const clientName = (formData.get("clientName") as string) ?? "Müşteri";
    const template = (formData.get("template") as string) ?? "general";

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Excel'i parse et
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rawRows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
    }) as unknown[][];
    const headers = (rawRows[0] || []).map((h) => String(h));
    const platform = detectPlatformFromHeaders(headers);

    if (platform === "UNKNOWN") {
      return NextResponse.json(
        { error: "Dosya formatı tanınamadı. Meta veya Google Ads export dosyası yükleyin." },
        { status: 400 }
      );
    }

    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
    const normalizedRows = normalizeSheet(rows, platform);

    // Kampanya verilerini hazırla
    const campaignMap = new Map<string, Record<string, unknown>>();
    for (const row of normalizedRows) {
      const name = String(row.campaignName ?? "Bilinmeyen");
      if (!campaignMap.has(name)) {
        campaignMap.set(name, row);
      }
    }

    const campaigns: CampaignData[] = Array.from(campaignMap.entries()).map(
      ([name, metrics]) => ({
        name,
        platform,
        metrics: metrics as Record<string, number | string>,
      })
    );

    // AI analizi çalıştır
    const result = await runFullAnalysis({
      campaigns,
      clientName,
      template,
      language,
    });

    // Ham metrikleri kampanya analizlerine ekle
    for (const ca of result.campaignAnalyses) {
      const match = campaigns.find(
        (c) => c.name === ca.campaignName
      );
      if (match) {
        ca.metrics = {
          spend: Number(match.metrics.spend) || 0,
          impressions: Number(match.metrics.impressions) || 0,
          reach: Number(match.metrics.reach) || 0,
          clicks: Number(match.metrics.clicks) || 0,
          ctr: Number(match.metrics.ctr) || 0,
          cpc: Number(match.metrics.cpc) || 0,
          cpm: Number(match.metrics.cpm) || 0,
          roas: Number(match.metrics.roas) || 0,
          conversions: Number(match.metrics.results || match.metrics.conversions) || 0,
          costPerResult: Number(match.metrics.costPerResult) || 0,
          frequency: Number(match.metrics.frequency) || 0,
        };
      }
    }

    // DB bağlıysa sonucu veritabanına da kaydet
    let dbSessionId: string | null = null;
    try {
      if (await isDatabaseConnected()) {
        // TODO: getToken ile userId al, workspaceId bul
        // Şimdilik DB'ye kaydetme — auth entegrasyonu sonra
        // const session = await prisma.analysisSession.create({ ... });
        // dbSessionId = session.id;
      }
    } catch {
      // DB hatası analizi engellemez
    }

    return NextResponse.json({ success: true, data: result, dbSessionId });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analiz sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
