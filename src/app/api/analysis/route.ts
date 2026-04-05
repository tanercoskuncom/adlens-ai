import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { detectPlatformFromHeaders } from "@/lib/excel/detector";
import { normalizeSheet } from "@/lib/excel/normalizer";
import { runFullAnalysis } from "@/lib/ai/analyzer";
import { isDatabaseConnected } from "@/lib/prisma";
import type { CampaignData } from "@/types/campaign";

/**
 * Meta/Google export'unda header her zaman ilk satırda olmaz.
 * Gerçek header satırını bul.
 */
function findHeaderRow(rawRows: unknown[][]): number {
  const knownHeaders = [
    "kampanya adı", "campaign name", "campaign",
    "reklam seti adı", "ad set name",
    "impressions", "gösterim", "clicks", "tıklama",
  ];

  for (let i = 0; i < Math.min(10, rawRows.length); i++) {
    const row = (rawRows[i] || []).map((h) => String(h ?? "").toLowerCase().trim());
    const matchCount = knownHeaders.filter((kh) => row.includes(kh)).length;
    if (matchCount >= 2) return i;
  }
  return 0;
}

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

    // Birden fazla sheet varsa "Raw Data" tercih et
    let sheetName = workbook.SheetNames[0];
    for (const name of workbook.SheetNames) {
      if (name.toLowerCase().includes("raw")) {
        sheetName = name;
        break;
      }
    }

    const sheet = workbook.Sheets[sheetName];
    const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    // Header satırını bul
    const headerRowIndex = findHeaderRow(allRows);
    const headerRow = allRows[headerRowIndex] || [];
    const headers = headerRow.map((h) => String(h ?? "").trim()).filter(Boolean);

    const platform = detectPlatformFromHeaders(headers);

    if (platform === "UNKNOWN") {
      return NextResponse.json(
        {
          error: "Platform tanınamadı. Meta veya Google Ads export dosyası olduğundan emin olun.",
          detectedHeaders: headers.slice(0, 10),
        },
        { status: 400 }
      );
    }

    // Header index offset (Meta'da ilk kolon boş olabilir)
    const firstHeaderIndex = headerRow.findIndex(
      (h) => h != null && String(h).trim() !== ""
    );

    // Veri satırlarını parse et
    const dataRows = allRows.slice(headerRowIndex + 1);
    const rows: Record<string, unknown>[] = [];

    for (const row of dataRows) {
      if (!row || !row.some((cell) => cell != null && cell !== "")) continue;
      const obj: Record<string, unknown> = {};
      headers.forEach((h, i) => {
        const cellIndex = firstHeaderIndex + i;
        if (h && cellIndex < row.length) {
          obj[h] = row[cellIndex];
        }
      });
      rows.push(obj);
    }

    const normalizedRows = normalizeSheet(rows, platform);

    // Kampanya bazlı toplama — sadece kampanya toplam satırlarını al
    // Meta hiyerarşisi: Kampanya Adı dolu + Reklam Seti = "All" → toplam satır
    const campaignMap = new Map<string, Record<string, unknown>>();

    for (const row of normalizedRows) {
      const name = String(row.campaignName ?? "").trim();
      if (!name) continue;

      const adSetName = String(row.adSetName ?? "").trim();

      // Eğer reklam seti "All" veya boş ise bu kampanya toplam satırı
      const isCampaignTotal =
        adSetName === "" ||
        adSetName.toLowerCase() === "all" ||
        adSetName === name;

      if (isCampaignTotal && !campaignMap.has(name)) {
        campaignMap.set(name, row);
      }
    }

    // Eğer hiç kampanya toplam satırı bulunamadıysa, tüm satırları kampanya bazlı topla
    if (campaignMap.size === 0) {
      for (const row of normalizedRows) {
        const name = String(row.campaignName ?? "").trim();
        if (!name) continue;
        if (!campaignMap.has(name)) {
          campaignMap.set(name, row);
        }
      }
    }

    const campaigns: CampaignData[] = Array.from(campaignMap.entries()).map(
      ([name, metrics]) => ({
        name,
        platform,
        metrics: metrics as Record<string, number | string>,
      })
    );

    if (campaigns.length === 0) {
      return NextResponse.json(
        { error: "Dosyada kampanya verisi bulunamadı." },
        { status: 400 }
      );
    }

    // AI analizi çalıştır
    const result = await runFullAnalysis({
      campaigns,
      clientName,
      template,
      language,
    });

    // Ham metrikleri kampanya analizlerine ekle
    for (const ca of result.campaignAnalyses) {
      const match = campaigns.find((c) => c.name === ca.campaignName);
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
        // TODO: auth entegrasyonu sonra
      }
    } catch {
      // DB hatası analizi engellemez
    }

    return NextResponse.json({
      success: true,
      data: result,
      dbSessionId,
      meta: {
        platform,
        campaignCount: campaigns.length,
        totalRows: rows.length,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analiz sırasında hata oluştu: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
