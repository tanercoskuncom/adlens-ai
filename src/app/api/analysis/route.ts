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

/**
 * Sayısal değere dönüştür. TRY/USD/$/%/boşluk temizle, virgülü noktaya çevir.
 */
function toNum(val: unknown): number {
  if (val == null || val === "") return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[%,$₺\s]/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
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

    // ─── Kampanya bazlı aggregation ───
    // Meta "Ayrıntılı Rapor" formatında her satır kırılım detayıdır (yaş, cinsiyet, gün).
    // Spend/reach/impressions sadece genel toplam satırında olabilir, alt kırılımlarda boş.
    // Toplanabilir metrikler: clicks, conversions, cartAdds
    // Toplam satır: kampanya adı boş = genel toplam

    interface CampaignAgg {
      spend: number;
      reach: number;
      impressions: number;
      clicks: number;
      conversions: number;
      conversionValue: number;
      costPerResult: number;
      frequency: number;
      ctr: number;
      cpc: number;
      cpm: number;
      roas: number;
      cartAdds: number;
      rowCount: number;
      objective: string;
      dailyBudget: number;
    }

    const campaignAgg = new Map<string, CampaignAgg>();

    // Genel toplam satırını bul (kampanya adı boş ama metrikler dolu)
    let grandTotal: Record<string, unknown> | null = null;

    for (const row of normalizedRows) {
      const name = String(row.campaignName ?? "").trim();

      // Kampanya adı boş + spend dolu = genel toplam satırı
      if (!name) {
        if (toNum(row.spend) > 0 || toNum(row.impressions) > 0) {
          grandTotal = row;
        }
        continue;
      }

      if (!campaignAgg.has(name)) {
        campaignAgg.set(name, {
          spend: 0, reach: 0, impressions: 0, clicks: 0,
          conversions: 0, conversionValue: 0, costPerResult: 0,
          frequency: 0, ctr: 0, cpc: 0, cpm: 0, roas: 0,
          cartAdds: 0, rowCount: 0, objective: "", dailyBudget: 0,
        });
      }

      const agg = campaignAgg.get(name)!;

      // Toplama: her satırdaki dolu metrikleri topla
      agg.spend += toNum(row.spend);
      agg.reach += toNum(row.reach);
      agg.impressions += toNum(row.impressions);
      agg.clicks += toNum(row.clicks);
      agg.conversions += toNum(row.results);
      agg.conversionValue += toNum(row.conversionValue);
      agg.cartAdds += toNum(row.cartAdds);
      agg.rowCount++;

      // Objective ve bütçe - ilk dolu değeri al
      if (!agg.objective) {
        const obj = String(row.objective ?? "").trim();
        if (obj) agg.objective = obj;
      }
      if (agg.dailyBudget === 0) {
        const budget = toNum(row.campaignBudget);
        if (budget > 0) agg.dailyBudget = budget;
      }

      // Eğer satırda direkt spend varsa, oran metriklerini de al
      if (toNum(row.spend) > 0) {
        if (toNum(row.ctr) > 0) agg.ctr = toNum(row.ctr);
        if (toNum(row.cpc) > 0) agg.cpc = toNum(row.cpc);
        if (toNum(row.cpm) > 0) agg.cpm = toNum(row.cpm);
        if (toNum(row.roas) > 0) agg.roas = toNum(row.roas);
        if (toNum(row.frequency) > 0) agg.frequency = toNum(row.frequency);
        if (toNum(row.costPerResult) > 0) agg.costPerResult = toNum(row.costPerResult);
      }
    }

    // ─── Genel toplamdan kampanya bazlı dağıtım ───
    // Eğer kampanyaların kendi spend'i 0 ama genel toplam varsa dağıt
    const anySpendZero = Array.from(campaignAgg.values()).some(a => a.spend === 0);

    if (grandTotal && campaignAgg.size > 0 && anySpendZero) {
      const totalSpend = toNum(grandTotal.spend);
      const totalReach = toNum(grandTotal.reach);
      const totalImpressions = toNum(grandTotal.impressions);
      const totalConvValue = toNum(grandTotal.conversionValue);

      // Günlük bütçe toplamı (bütçesi bilinenler)
      let knownBudgetTotal = 0;
      let unknownBudgetCount = 0;
      for (const agg of campaignAgg.values()) {
        if (agg.dailyBudget > 0) {
          knownBudgetTotal += agg.dailyBudget;
        } else {
          unknownBudgetCount++;
        }
      }

      // Bütçesi bilinmeyenler için ortalama bütçe tahmin et
      const avgBudget = knownBudgetTotal > 0 && unknownBudgetCount > 0
        ? knownBudgetTotal / (campaignAgg.size - unknownBudgetCount)
        : 0;

      // Toplam tahmini bütçe
      const totalEstBudget = knownBudgetTotal + (avgBudget * unknownBudgetCount);

      // Toplam conversion
      let allConversions = 0;
      for (const agg of campaignAgg.values()) {
        allConversions += agg.conversions;
      }

      for (const agg of campaignAgg.values()) {
        if (agg.spend === 0 && totalSpend > 0) {
          // Bütçe oranıyla dağıt
          const budget = agg.dailyBudget > 0 ? agg.dailyBudget : avgBudget;
          const ratio = totalEstBudget > 0 ? budget / totalEstBudget : 1 / campaignAgg.size;
          agg.spend = Math.round(totalSpend * ratio * 100) / 100;
          agg.reach = Math.round(totalReach * ratio);
          agg.impressions = Math.round(totalImpressions * ratio);
        }

        // Oran metriklerini hesapla
        if (agg.spend > 0 && agg.impressions > 0) {
          agg.cpm = (agg.spend / agg.impressions) * 1000;
        }
        if (agg.spend > 0 && agg.clicks > 0) {
          agg.cpc = agg.spend / agg.clicks;
        }
        if (agg.impressions > 0 && agg.clicks > 0) {
          agg.ctr = (agg.clicks / agg.impressions) * 100;
        }
        if (agg.reach > 0 && agg.impressions > 0) {
          agg.frequency = agg.impressions / agg.reach;
        }
        if (agg.spend > 0 && agg.conversionValue > 0) {
          agg.roas = agg.conversionValue / agg.spend;
        }
        // conversionValue yoksa, toplam convValue'dan conversion oranıyla dağıt
        if (agg.roas === 0 && totalConvValue > 0 && agg.conversions > 0 && allConversions > 0) {
          const convRatio = agg.conversions / allConversions;
          agg.conversionValue = Math.round(totalConvValue * convRatio * 100) / 100;
          agg.roas = agg.spend > 0 ? agg.conversionValue / agg.spend : 0;
        }
        if (agg.conversions > 0 && agg.spend > 0) {
          agg.costPerResult = agg.spend / agg.conversions;
        }
      }
    }

    // Kampanyaları oluştur
    const campaigns: CampaignData[] = Array.from(campaignAgg.entries()).map(
      ([name, agg]) => ({
        name,
        platform,
        metrics: {
          spend: agg.spend,
          reach: agg.reach,
          impressions: agg.impressions,
          clicks: agg.clicks,
          ctr: agg.ctr,
          cpc: agg.cpc,
          cpm: agg.cpm,
          roas: agg.roas,
          results: agg.conversions,
          conversions: agg.conversions,
          costPerResult: agg.costPerResult,
          frequency: agg.frequency,
          conversionValue: agg.conversionValue,
          cartAdds: agg.cartAdds,
          objective: agg.objective,
        } as Record<string, number | string>,
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
