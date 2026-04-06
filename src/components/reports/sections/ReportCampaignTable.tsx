"use client";

import type { CampaignAnalysis } from "@/types/analysis";

interface ReportCampaignTableProps {
  campaigns: CampaignAnalysis[];
  title: string;
  platform: "META" | "GOOGLE";
}

const statusColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400",
  needs_improvement: "bg-amber-500/20 text-amber-400",
  good: "bg-green-500/20 text-green-400",
  excellent: "bg-blue-500/20 text-blue-400",
};

const statusLabels: Record<string, string> = {
  critical: "Kritik",
  needs_improvement: "Gelistirilmeli",
  good: "Iyi",
  excellent: "Mukemmel",
};

export function ReportCampaignTable({ campaigns, title, platform }: ReportCampaignTableProps) {
  return (
    <div className="bg-gray-800/80 rounded-xl border border-gray-700/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700/50">
        <h3 className="text-white font-semibold">{title}</h3>
        <p className="text-gray-400 text-xs mt-1">{campaigns.length} kampanya</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900/50">
              <th className="text-left text-gray-400 font-medium px-4 py-3 text-xs uppercase tracking-wider">Kampanya</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3 text-xs uppercase tracking-wider">Amac</th>
              <th className="text-right text-gray-400 font-medium px-4 py-3 text-xs uppercase tracking-wider">Harcama</th>
              <th className="text-right text-gray-400 font-medium px-4 py-3 text-xs uppercase tracking-wider">Gosterim</th>
              <th className="text-right text-gray-400 font-medium px-4 py-3 text-xs uppercase tracking-wider">Tiklama</th>
              <th className="text-right text-gray-400 font-medium px-4 py-3 text-xs uppercase tracking-wider">CTR</th>
              {platform === "META" && (
                <>
                  <th className="text-right text-gray-400 font-medium px-4 py-3 text-xs uppercase tracking-wider">ROAS</th>
                  <th className="text-right text-gray-400 font-medium px-4 py-3 text-xs uppercase tracking-wider">CPM</th>
                </>
              )}
              <th className="text-right text-gray-400 font-medium px-4 py-3 text-xs uppercase tracking-wider">Skor</th>
              <th className="text-center text-gray-400 font-medium px-4 py-3 text-xs uppercase tracking-wider">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {campaigns.map((c, i) => (
              <tr key={i} className="hover:bg-gray-700/20 transition-colors">
                <td className="px-4 py-3 text-white font-medium max-w-[200px] truncate" title={c.campaignName}>
                  {c.campaignName}
                </td>
                <td className="px-4 py-3 text-gray-300 text-xs">
                  {c.objective || "—"}
                </td>
                <td className="px-4 py-3 text-gray-300 text-right">
                  {c.metrics?.spend ? `₺${c.metrics.spend.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-300 text-right">
                  {c.metrics?.impressions ? c.metrics.impressions.toLocaleString("tr-TR") : "—"}
                </td>
                <td className="px-4 py-3 text-gray-300 text-right">
                  {c.metrics?.clicks ? c.metrics.clicks.toLocaleString("tr-TR") : "—"}
                </td>
                <td className="px-4 py-3 text-gray-300 text-right">
                  {c.metrics?.ctr ? `${c.metrics.ctr.toFixed(2)}%` : "—"}
                </td>
                {platform === "META" && (
                  <>
                    <td className="px-4 py-3 text-gray-300 text-right">
                      {c.metrics?.roas ? `${c.metrics.roas.toFixed(2)}x` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-right">
                      {c.metrics?.cpm ? `₺${c.metrics.cpm.toFixed(2)}` : "—"}
                    </td>
                  </>
                )}
                <td className="px-4 py-3 text-right">
                  <span className={`font-bold ${c.score >= 70 ? "text-green-400" : c.score >= 40 ? "text-amber-400" : "text-red-400"}`}>
                    {c.score}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[c.status] || ""}`}>
                    {statusLabels[c.status] || c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
