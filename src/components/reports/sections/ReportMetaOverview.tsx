"use client";

import { ReportKPICard } from "./ReportKPICard";
import { ReportSectionHeader } from "./ReportSectionHeader";
import type { CampaignAnalysis } from "@/types/analysis";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ReportMetaOverviewProps {
  campaigns: CampaignAnalysis[];
}

export function ReportMetaOverview({ campaigns }: ReportMetaOverviewProps) {
  const totalSpend = campaigns.reduce((s, c) => s + (c.metrics?.spend || 0), 0);
  const totalReach = campaigns.reduce((s, c) => s + (c.metrics?.reach || 0), 0);
  const totalImpressions = campaigns.reduce((s, c) => s + (c.metrics?.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.metrics?.clicks || 0), 0);
  const totalConversionValue = campaigns.reduce((s, c) => s + (c.metrics?.conversionValue || 0), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.metrics?.conversions || 0), 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const roas = totalSpend > 0 ? totalConversionValue / totalSpend : 0;
  const avgCPM = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;

  // Chart data: spend vs revenue per campaign
  const chartData = campaigns.map((c) => ({
    name: c.campaignName.length > 20 ? c.campaignName.slice(0, 20) + "..." : c.campaignName,
    harcama: c.metrics?.spend || 0,
    gelir: c.metrics?.conversionValue || 0,
  }));

  return (
    <div className="space-y-4">
      <ReportSectionHeader
        title="META ADS GENEL BAKIS"
        subtitle={`${campaigns.length} Kampanya`}
        icon={
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportKPICard label="Toplam Harcama" value={totalSpend.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} prefix="₺" />
        <ReportKPICard label="Gelir" value={totalConversionValue > 0 ? totalConversionValue.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) : "—"} prefix={totalConversionValue > 0 ? "₺" : ""} />
        <ReportKPICard label="ROAS" value={roas > 0 ? roas.toFixed(2) : "—"} suffix={roas > 0 ? "x" : ""} />
        <ReportKPICard label="Erisim" value={totalReach > 0 ? totalReach.toLocaleString("tr-TR") : "—"} />
        <ReportKPICard label="Gosterim" value={totalImpressions.toLocaleString("tr-TR")} />
        <ReportKPICard label="Tiklama" value={totalClicks.toLocaleString("tr-TR")} />
        <ReportKPICard label="CTR" value={avgCTR.toFixed(2)} suffix="%" />
        <ReportKPICard label="CPM" value={avgCPM.toFixed(2)} prefix="₺" />
      </div>

      {/* Spend vs Revenue Chart */}
      {chartData.length > 0 && (
        <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-white font-semibold mb-4">Harcama vs Gelir</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 10 }} angle={-45} textAnchor="end" />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#D1D5DB" }}
                  formatter={(value) => `₺${Number(value).toLocaleString("tr-TR")}`}
                />
                <Legend wrapperStyle={{ color: "#9CA3AF" }} />
                <Bar dataKey="harcama" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gelir" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
