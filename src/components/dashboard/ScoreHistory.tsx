"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { analysisStore, type SavedAnalysis } from "@/store/analysisStore";

interface ScoreDataPoint {
  date: string;
  score: number;
  client: string;
}

export function ScoreHistory() {
  const [data, setData] = useState<ScoreDataPoint[]>([]);

  useEffect(() => {
    const analyses = analysisStore.getAll();
    // En eskiden en yeniye sırala
    const sorted = [...analyses].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    setData(
      sorted.map((a) => ({
        date: new Date(a.createdAt).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "short",
        }),
        score: a.result.overallReport.overallScore,
        client: a.clientName,
      }))
    );
  }, []);

  if (data.length < 2) return null;

  const lastScore = data[data.length - 1]?.score ?? 0;
  const prevScore = data[data.length - 2]?.score ?? 0;
  const diff = lastScore - prevScore;
  const trend = diff > 0 ? "up" : diff < 0 ? "down" : "flat";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Skor Gecmisi</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{lastScore}</span>
            <Badge
              className={
                trend === "up"
                  ? "bg-green-100 text-green-700"
                  : trend === "down"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
              }
            >
              {trend === "up" ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : trend === "down" ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : (
                <Minus className="w-3 h-3 mr-1" />
              )}
              {diff > 0 ? "+" : ""}
              {diff}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload as ScoreDataPoint;
                  return (
                    <div className="bg-white px-3 py-2 shadow-lg rounded-lg border text-xs">
                      <p className="font-medium">{d.client}</p>
                      <p className="text-gray-500">{d.date}</p>
                      <p className="font-bold text-blue-600 mt-1">
                        Skor: {d.score}/100
                      </p>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={60}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{ value: "Hedef", fontSize: 10, fill: "#f59e0b" }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#scoreGradient)"
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
