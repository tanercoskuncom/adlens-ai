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

  // Raw Data sheet'i tercih et
  let sheetName = workbook.SheetNames[0];
  for (const name of workbook.SheetNames) {
    if (name.toLowerCase().includes("raw")) {
      sheetName = name;
      break;
    }
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

  // İlk 10 satırda header'ı ara
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    if (!rows[i]) continue;
    const result = detectPlatformFromHeaders(rows[i]);
    if (result !== "UNKNOWN") return result;
  }

  return "UNKNOWN";
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
