"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface PlatformDetectorProps {
  platform: "META" | "GOOGLE" | "UNKNOWN";
  onPlatformChange?: (platform: "META" | "GOOGLE") => void;
}

export function PlatformDetector({
  platform,
  onPlatformChange,
}: PlatformDetectorProps) {
  if (platform === "UNKNOWN") {
    return (
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-amber-500" />
        <span className="text-sm text-amber-700">
          Platform tanınamadı. Lütfen manuel seçin:
        </span>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => onPlatformChange?.("META")}
            className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Meta Ads
          </button>
          <button
            onClick={() => onPlatformChange?.("GOOGLE")}
            className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Google Ads
          </button>
        </div>
      </div>
    );
  }

  const config = {
    META: {
      label: "Meta Ads",
      color: "bg-blue-100 text-blue-700",
      borderColor: "border-blue-200",
      bgColor: "bg-blue-50",
    },
    GOOGLE: {
      label: "Google Ads",
      color: "bg-red-100 text-red-700",
      borderColor: "border-red-200",
      bgColor: "bg-red-50",
    },
  };

  const c = config[platform];

  return (
    <div
      className={`flex items-center gap-2 p-3 ${c.bgColor} border ${c.borderColor} rounded-lg`}
    >
      <CheckCircle2 className="w-4 h-4 text-green-500" />
      <span className="text-sm">Platform olarak tanındı:</span>
      <Badge className={c.color}>{c.label}</Badge>
    </div>
  );
}
