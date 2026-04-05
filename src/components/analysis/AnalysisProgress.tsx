"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2 } from "lucide-react";

interface AnalysisProgressProps {
  steps: { label: string; status: "pending" | "active" | "done" }[];
  currentProgress: number;
  estimatedTime?: string;
}

export function AnalysisProgress({
  steps,
  currentProgress,
  estimatedTime,
}: AnalysisProgressProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Analiz ilerleme durumu</span>
        <span className="font-medium">{currentProgress}%</span>
      </div>

      <Progress value={currentProgress} />

      {estimatedTime && (
        <p className="text-xs text-gray-400 text-center">
          Tahmini kalan süre: {estimatedTime}
        </p>
      )}

      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            {step.status === "done" ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            ) : step.status === "active" ? (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
            )}
            <span
              className={`text-sm ${
                step.status === "done"
                  ? "text-green-700"
                  : step.status === "active"
                    ? "text-blue-700 font-medium"
                    : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
