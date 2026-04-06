"use client";

import { ReportKPICard } from "./ReportKPICard";
import { ReportSectionHeader } from "./ReportSectionHeader";
import type { GA4ReportData } from "@/lib/ga4/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface ReportGA4OverviewProps {
  data: GA4ReportData;
}

export function ReportGA4Overview({ data }: ReportGA4OverviewProps) {
  const { overview, dailyTrend } = data;

  return (
    <div className="space-y-4">
      <ReportSectionHeader
        title="GOOGLE ANALYTICS 4"
        subtitle="Web sitesi performans verileri"
        icon={<BarChart3 className="w-6 h-6" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportKPICard
          label="Kullanicilar"
          value={overview.totalUsers.toLocaleString("tr-TR")}
        />
        <ReportKPICard
          label="Sayfa Goruntuleme"
          value={overview.pageViews.toLocaleString("tr-TR")}
        />
        <ReportKPICard
          label="Ort. Oturum Suresi"
          value={formatDuration(overview.avgSessionDuration)}
        />
        <ReportKPICard
          label="Cikma Orani"
          value={overview.bounceRate.toFixed(1)}
          suffix="%"
        />
        <ReportKPICard
          label="Gelir"
          value={overview.purchaseRevenue > 0 ? overview.purchaseRevenue.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) : "—"}
          prefix={overview.purchaseRevenue > 0 ? "₺" : ""}
        />
        <ReportKPICard
          label="E-ticaret Donusum"
          value={overview.ecommerceConversionRate > 0 ? overview.ecommerceConversionRate.toFixed(2) : "—"}
          suffix={overview.ecommerceConversionRate > 0 ? "%" : ""}
        />
        <ReportKPICard
          label="Oturumlar"
          value={overview.sessions.toLocaleString("tr-TR")}
        />
        <ReportKPICard
          label="Yeni Kullanicilar"
          value={overview.newUsers.toLocaleString("tr-TR")}
        />
      </div>

      {/* Daily Trend Chart */}
      {dailyTrend.length > 0 && (
        <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-white font-semibold mb-4">Gunluk Trafik Trendi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#D1D5DB" }}
                />
                <Area type="monotone" dataKey="users" name="Kullanicilar" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} />
                <Area type="monotone" dataKey="sessions" name="Oturumlar" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}dk ${s}sn`;
}
