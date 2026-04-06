"use client";

import { ReportKPICard } from "./ReportKPICard";
import { ReportSectionHeader } from "./ReportSectionHeader";
import type { FullAnalysisResult } from "@/types/analysis";
import { BarChart3 } from "lucide-react";

interface ReportOverviewProps {
  result: FullAnalysisResult;
  clientName: string;
}

export function ReportOverview({ result, clientName }: ReportOverviewProps) {
  const { overallReport, campaignAnalyses } = result;

  // Aggregate metrics from campaign analyses
  const totalSpend = campaignAnalyses.reduce((sum, c) => sum + (c.metrics?.spend || 0), 0);
  const totalImpressions = campaignAnalyses.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0);
  const totalClicks = campaignAnalyses.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0);
  const totalReach = campaignAnalyses.reduce((sum, c) => sum + (c.metrics?.reach || 0), 0);
  const totalConversions = campaignAnalyses.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0);
  const totalConversionValue = campaignAnalyses.reduce((sum, c) => sum + (c.metrics?.conversionValue || 0), 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const overallROAS = totalSpend > 0 ? totalConversionValue / totalSpend : 0;

  return (
    <div className="space-y-4">
      <ReportSectionHeader
        title="GENEL BAKIS"
        subtitle={`${clientName} — Tum Platformlar`}
        icon={<BarChart3 className="w-6 h-6" />}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportKPICard
          label="Toplam Harcama"
          value={totalSpend > 0 ? totalSpend.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) : "—"}
          prefix={totalSpend > 0 ? "₺" : ""}
        />
        <ReportKPICard
          label="Gosterim"
          value={totalImpressions > 0 ? totalImpressions.toLocaleString("tr-TR") : "—"}
        />
        <ReportKPICard
          label="Erisim"
          value={totalReach > 0 ? totalReach.toLocaleString("tr-TR") : "—"}
        />
        <ReportKPICard
          label="Tiklama"
          value={totalClicks > 0 ? totalClicks.toLocaleString("tr-TR") : "—"}
        />
        <ReportKPICard
          label="CTR"
          value={avgCTR > 0 ? avgCTR.toFixed(2) : "—"}
          suffix={avgCTR > 0 ? "%" : ""}
        />
        <ReportKPICard
          label="ROAS"
          value={overallROAS > 0 ? overallROAS.toFixed(2) : "—"}
          suffix={overallROAS > 0 ? "x" : ""}
        />
        <ReportKPICard
          label="Donusum"
          value={totalConversions > 0 ? totalConversions.toLocaleString("tr-TR") : "—"}
        />
        <ReportKPICard
          label="Genel Skor"
          value={overallReport.overallScore}
          suffix="/100"
        />
      </div>

      {/* Overall Summary */}
      <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-white font-semibold mb-3">Ozet Degerlendirme</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{overallReport.overallSummary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {overallReport.keyInsights.map((insight, i) => (
            <span key={i} className="text-xs bg-blue-500/10 text-blue-300 px-3 py-1.5 rounded-full border border-blue-500/20">
              {insight}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
