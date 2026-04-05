"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";

interface ColumnMapperProps {
  platform: "META" | "GOOGLE";
  detectedColumns: string[];
  requiredColumns: string[];
}

export function ColumnMapper({
  platform,
  detectedColumns,
  requiredColumns,
}: ColumnMapperProps) {
  const matched = requiredColumns.filter((col) =>
    detectedColumns.some(
      (dc) => dc.toLowerCase().trim() === col.toLowerCase().trim()
    )
  );
  const missing = requiredColumns.filter(
    (col) =>
      !detectedColumns.some(
        (dc) => dc.toLowerCase().trim() === col.toLowerCase().trim()
      )
  );

  const platformLabel = platform === "META" ? "Meta Ads" : "Google Ads";
  const platformColor = platform === "META" ? "blue" : "red";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full bg-${platformColor}-500`}
        />
        <span className="text-sm font-medium">
          {platformLabel} — {matched.length}/{requiredColumns.length} kolon
          eşleşti
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {matched.map((col) => (
          <div
            key={col}
            className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded"
          >
            <CheckCircle2 className="w-3 h-3" />
            {col}
          </div>
        ))}
        {missing.map((col) => (
          <div
            key={col}
            className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded"
          >
            <AlertTriangle className="w-3 h-3" />
            {col}
          </div>
        ))}
      </div>
    </div>
  );
}
