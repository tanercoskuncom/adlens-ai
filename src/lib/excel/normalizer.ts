import mappings from "./column-mappings.json";

type Platform = "META" | "GOOGLE";

export function normalizeRow(
  row: Record<string, unknown>,
  platform: Platform
): Record<string, unknown> {
  const map = mappings[platform];
  const normalized: Record<string, unknown> = {};

  for (const [standardKey, aliases] of Object.entries(map)) {
    for (const alias of aliases as string[]) {
      if (row[alias] !== undefined) {
        normalized[standardKey] = row[alias];
        break;
      }
    }
  }
  return normalized;
}

export function normalizeSheet(
  rows: Record<string, unknown>[],
  platform: Platform
): Record<string, unknown>[] {
  return rows.map((row) => normalizeRow(row, platform));
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[%,$₺\s]/g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

export function parseMetric(value: unknown): number {
  return toNumber(value);
}
