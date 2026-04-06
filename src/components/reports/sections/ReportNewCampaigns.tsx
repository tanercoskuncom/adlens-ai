"use client";

import type { NewCampaignSuggestion } from "@/types/analysis";
import { Lightbulb } from "lucide-react";

interface ReportNewCampaignsProps {
  suggestions: NewCampaignSuggestion[];
}

export function ReportNewCampaigns({ suggestions }: ReportNewCampaignsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h3 className="text-white font-semibold text-lg">Yeni Kampanya Onerileri</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((s, i) => (
          <div key={i} className="bg-gray-800/80 rounded-xl p-5 border border-gray-700/50 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-white font-semibold text-sm">{s.title}</h4>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full shrink-0 ml-2">
                {s.platform}
              </span>
            </div>

            <div className="space-y-2 text-xs flex-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Tur</span>
                <span className="text-gray-300">{s.campaignType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amac</span>
                <span className="text-gray-300">{s.objective}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hedef Kitle</span>
                <span className="text-gray-300 text-right max-w-[150px]">{s.targetAudience}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Aylik Butce</span>
                <span className="text-green-400 font-medium">
                  {s.estimatedBudget.currency === "TRY" ? "₺" : "$"}
                  {s.estimatedBudget.monthly.toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tahmini ROAS</span>
                <span className="text-gray-300">{s.estimatedRoas.min}x - {s.estimatedRoas.max}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sonuc Suresi</span>
                <span className="text-gray-300">{s.timeToResults}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-700/30">
              <p className="text-gray-400 text-xs leading-relaxed">{s.rationale}</p>
            </div>

            {s.kpis.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {s.kpis.map((kpi, j) => (
                  <span key={j} className="text-[10px] bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded">
                    {kpi}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
