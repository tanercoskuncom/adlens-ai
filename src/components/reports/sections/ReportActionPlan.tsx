"use client";

import type { ActionPlan } from "@/types/analysis";
import { AlertTriangle, Calendar, Rocket, XCircle } from "lucide-react";

interface ReportActionPlanProps {
  actionPlan: ActionPlan;
}

export function ReportActionPlan({ actionPlan }: ReportActionPlanProps) {
  const effortColors: Record<string, string> = {
    low: "bg-green-500/20 text-green-400",
    medium: "bg-amber-500/20 text-amber-400",
    high: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Urgent Actions */}
      {actionPlan.urgentActions.length > 0 && (
        <div className="bg-red-500/5 rounded-xl p-6 border border-red-500/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-red-400 font-semibold text-lg">Acil Aksiyonlar</h3>
            <span className="text-red-400/60 text-xs ml-auto">Bu hafta</span>
          </div>
          <div className="space-y-3">
            {actionPlan.urgentActions.map((a, i) => (
              <div key={i} className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">{a.title}</h4>
                    <p className="text-gray-400 text-xs mt-1">{a.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500">Kampanya: {a.campaign}</span>
                      <span className="text-xs text-green-400">Etki: {a.expectedImpact}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${effortColors[a.effort] || ""}`}>
                    {a.effort === "low" ? "Kolay" : a.effort === "medium" ? "Orta" : "Zor"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Actions */}
      {actionPlan.monthlyActions.length > 0 && (
        <div className="bg-amber-500/5 rounded-xl p-6 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="text-amber-400 font-semibold text-lg">Aylik Aksiyonlar</h3>
            <span className="text-amber-400/60 text-xs ml-auto">2-4 hafta</span>
          </div>
          <div className="space-y-3">
            {actionPlan.monthlyActions.map((a, i) => (
              <div key={i} className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/30">
                <h4 className="text-white font-medium text-sm">{a.title}</h4>
                <p className="text-gray-400 text-xs mt-1">{a.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500">Kampanya: {a.campaign}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${effortColors[a.effort] || ""}`}>
                    {a.effort === "low" ? "Kolay" : a.effort === "medium" ? "Orta" : "Zor"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Long-term Actions */}
      {actionPlan.longtermActions.length > 0 && (
        <div className="bg-blue-500/5 rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-blue-400" />
            <h3 className="text-blue-400 font-semibold text-lg">Uzun Vade Stratejiler</h3>
          </div>
          <div className="space-y-3">
            {actionPlan.longtermActions.map((a, i) => (
              <div key={i} className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/30">
                <h4 className="text-white font-medium text-sm">{a.title}</h4>
                <p className="text-gray-400 text-xs mt-1">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaigns to Stop */}
      {actionPlan.campaignsToStop.length > 0 && (
        <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-white font-semibold">Durdurulmasi Gereken Kampanyalar</h3>
          </div>
          <div className="space-y-3">
            {actionPlan.campaignsToStop.map((c, i) => (
              <div key={i} className="flex items-start gap-3 bg-red-500/5 rounded-lg p-4 border border-red-500/10">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{c.campaignName}</h4>
                  <p className="text-gray-400 text-xs mt-1">{c.reason}</p>
                  <p className="text-green-400 text-xs mt-1">Butce: {c.budgetReallocation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Recommendation */}
      <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-white font-semibold mb-3">Butce Tavsiyesi</h3>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <span className="text-gray-400 text-xs block">Mevcut Butce</span>
            <span className="text-white text-lg font-bold">₺{actionPlan.budgetRecommendation.currentTotal.toLocaleString("tr-TR")}</span>
          </div>
          <div>
            <span className="text-gray-400 text-xs block">Onerilen Butce</span>
            <span className="text-green-400 text-lg font-bold">₺{actionPlan.budgetRecommendation.recommendedTotal.toLocaleString("tr-TR")}</span>
          </div>
        </div>
        <p className="text-gray-300 text-sm">{actionPlan.budgetRecommendation.rationale}</p>
      </div>
    </div>
  );
}
