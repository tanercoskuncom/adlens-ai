"use client";

import type { CampaignAnalysis } from "@/types/analysis";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface ReportScoreChartProps {
  campaigns: CampaignAnalysis[];
  title: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#3B82F6";
  if (score >= 60) return "#22C55E";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

export function ReportScoreChart({ campaigns, title }: ReportScoreChartProps) {
  const data = campaigns
    .sort((a, b) => b.score - a.score)
    .map((c) => ({
      name: c.campaignName.length > 25 ? c.campaignName.slice(0, 25) + "..." : c.campaignName,
      skor: c.score,
      objective: c.objective || "Genel",
    }));

  return (
    <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={180} tick={{ fill: "#9CA3AF", fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
              formatter={(value) => [`${value}/100`, "Skor"]}
            />
            <ReferenceLine x={60} stroke="#6B7280" strokeDasharray="3 3" />
            <Bar dataKey="skor" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={scoreColor(entry.skor)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
