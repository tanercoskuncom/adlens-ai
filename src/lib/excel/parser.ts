import * as XLSX from "xlsx";
import { detectPlatformFromHeaders } from "./detector";
import { normalizeSheet } from "./normalizer";
import type { Platform } from "@/types/campaign";

export interface ParseResult {
  platform: Platform;
  headers: string[];
  rows: Record<string, unknown>[];
  normalizedRows: Record<string, unknown>[];
  rowCount: number;
}

/**
 * Meta/Google export dosyalarında header her zaman ilk satırda olmaz.
 * Meta "Ayrıntılı Rapor" formatında ilk 1-3 satır başlık/boş olabilir.
 * Gerçek header satırını bul: "Kampanya Adı", "Campaign Name" gibi
 * bilinen kolon isimlerini içeren ilk satır.
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
  return 0; // fallback: ilk satır
}

/**
 * Excel buffer'ını parse et.
 * Birden fazla sheet varsa en uygun olanı seç.
 */
export function parseExcelBuffer(buffer: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });

  // Birden fazla sheet varsa "Raw Data" tercih et, yoksa ilk sheet
  let sheetName = workbook.SheetNames[0];
  for (const name of workbook.SheetNames) {
    if (name.toLowerCase().includes("raw")) {
      sheetName = name;
      break;
    }
  }

  const sheet = workbook.Sheets[sheetName];
  const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  // Gerçek header satırını bul
  const headerRowIndex = findHeaderRow(allRows);
  const headers = (allRows[headerRowIndex] || []).map((h) => String(h ?? "").trim()).filter(Boolean);

  // Header altındaki veri satırlarını parse et
  const dataRows = allRows.slice(headerRowIndex + 1);
  const rows: Record<string, unknown>[] = dataRows
    .filter((row) => row.some((cell) => cell != null && cell !== ""))
    .map((row) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((h, i) => {
        if (h && row[allRows[headerRowIndex].indexOf(headers[0]) > 0 ? i + 1 : i] !== undefined) {
          // İlk kolonda null/boş olabilir (Meta formatında index offset)
          obj[h] = row[allRows[headerRowIndex].indexOf(headers[0]) > 0 ? i + 1 : i];
        }
      });
      return obj;
    });

  const platform = detectPlatformFromHeaders(headers);
  const normalizedRows = platform !== "UNKNOWN" ? normalizeSheet(rows, platform) : rows;

  return {
    platform,
    headers,
    rows,
    normalizedRows,
    rowCount: rows.length,
  };
}
