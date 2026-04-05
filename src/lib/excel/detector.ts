import * as XLSX from "xlsx";
import type { Platform } from "@/types/campaign";

const META_COLUMNS = [
  "campaign name",
  "kampanya adı",
  "ad set name",
  "reklam seti adı",
  "ad name",
  "reklam adı",
  "reach",
  "erişim",
  "frequency",
  "sıklık",
  "results",
  "alışverişler",
  "cost per result",
  "alışveriş başına ücret",
  "amount spent (try)",
  "harcanan tutar (try)",
  "purchase roas",
  "roas",
  "cpm (1000 gösterim başına ücret)",
];

const GOOGLE_COLUMNS = [
  "campaign",
  "kampanya",
  "ad group",
  "reklam grubu",
  "impressions",
  "görüntülenme",
  "clicks",
  "tıklamalar",
  "avg. cpc",
  "ort. tbm",
  "conversions",
  "dönüşümler",
  "conv. rate",
  "dön. oranı",
  "search impr. share",
  "görüntülenme payı",
];

export function detectPlatformFromHeaders(headers: string[]): Platform {
  const normalized = headers.map((h) => String(h).toLowerCase().trim());

  const metaScore = META_COLUMNS.filter((c) => normalized.includes(c)).length;
  const googleScore = GOOGLE_COLUMNS.filter((c) =>
    normalized.includes(c)
  ).length;

  if (metaScore >= 3) return "META";
  if (googleScore >= 3) return "GOOGLE";
  return "UNKNOWN";
}

export function detectPlatformFromBuffer(buffer: ArrayBuffer): Platform {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

  if (!rows[0]) return "UNKNOWN";

  return detectPlatformFromHeaders(rows[0]);
}

export function detectPlatformFromFile(file: File): Promise<Platform> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      resolve(detectPlatformFromBuffer(data.buffer as ArrayBuffer));
    };
    reader.onerror = () => resolve("UNKNOWN");
    reader.readAsArrayBuffer(file);
  });
}
