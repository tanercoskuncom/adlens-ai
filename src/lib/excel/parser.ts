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

export function parseExcelBuffer(buffer: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
  const headers = (rawRows[0] || []).map((h) => String(h));

  const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
  const platform = detectPlatformFromHeaders(headers);

  const normalizedRows =
    platform !== "UNKNOWN" ? normalizeSheet(rows, platform) : rows;

  return {
    platform,
    headers,
    rows,
    normalizedRows,
    rowCount: rows.length,
  };
}
