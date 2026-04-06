"use client";

import type { OverallReport } from "@/types/analysis";
import { ShoppingCart, MousePointerClick, Eye } from "lucide-react";

interface ReportObjectiveBreakdownProps {
  breakdown: OverallReport["objectiveBreakdown"];
}

export function ReportObjectiveBreakdown({ breakdown }: ReportObjectiveBreakdownProps) {
  if (!breakdown) return null;

  const sections = [
    {
      key: "sales" as const,
      label: "Satis Kampanyalari",
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      data: breakdown.sales,
    },
    {
      key: "traffic" as const,
      label: "Trafik Kampanyalari",
      icon: <MousePointerClick className="w-5 h-5" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      data: breakdown.traffic,
    },
    {
      key: "awareness" as const,
      label: "Bilinirlik Kampanyalari",
      icon: <Eye className="w-5 h-5" />,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      data: breakdown.awareness,
    },
  ];

  const activeSections = sections.filter((s) => s.data && s.data.campaignCount > 0);
  if (activeSections.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold text-lg px-1">Amaca Gore Performans</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeSections.map((section) => {
          const d = section.data!;
          return (
            <div
              key={section.key}
              className={`${section.bgColor} rounded-xl p-5 border ${section.borderColor}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={section.color}>{section.icon}</span>
                <h4 className={`font-semibold ${section.color}`}>{section.label}</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Kampanya Sayisi</span>
                  <span className="text-white font-medium">{d.campaignCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Toplam Harcama</span>
                  <span className="text-white font-medium">₺{d.totalSpend.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</span>
                </div>
                {section.key === "sales" && "avgRoas" in d && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ort. ROAS</span>
                      <span className="text-white font-medium">{d.avgRoas.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Toplam Donusum</span>
                      <span className="text-white font-medium">{d.totalConversions.toLocaleString("tr-TR")}</span>
                    </div>
                  </>
                )}
                {section.key === "traffic" && "avgCtr" in d && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ort. CTR</span>
                      <span className="text-white font-medium">{d.avgCtr.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ort. CPC</span>
                      <span className="text-white font-medium">₺{d.avgCpc.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {section.key === "awareness" && "totalReach" in d && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Toplam Erisim</span>
                      <span className="text-white font-medium">{d.totalReach.toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ort. CPM</span>
                      <span className="text-white font-medium">₺{d.avgCpm.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-gray-300 text-xs mt-3 leading-relaxed">{d.assessment}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
