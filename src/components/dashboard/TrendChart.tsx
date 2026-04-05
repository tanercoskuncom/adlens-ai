"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TrendDataPoint {
  date: string;
  ctr?: number;
  cpc?: number;
  roas?: number;
  spend?: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  title?: string;
  metrics?: ("ctr" | "cpc" | "roas" | "spend")[];
}

const METRIC_CONFIG = {
  ctr: { color: "#3b82f6", label: "CTR (%)" },
  cpc: { color: "#ef4444", label: "CPC" },
  roas: { color: "#22c55e", label: "ROAS" },
  spend: { color: "#f59e0b", label: "Harcama" },
};

export function TrendChart({
  data,
  title = "Trend Grafikleri",
  metrics = ["ctr", "roas"],
}: TrendChartProps) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            Trend verisi henüz mevcut değil
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              {metrics.map((metric) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  name={METRIC_CONFIG[metric].label}
                  stroke={METRIC_CONFIG[metric].color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
