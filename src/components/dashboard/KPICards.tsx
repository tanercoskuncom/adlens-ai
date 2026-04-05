"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  MousePointerClick,
  Eye,
  Target,
} from "lucide-react";

export interface KPIData {
  totalSpend: number;
  totalROAS: number;
  totalConversions: number;
  avgCTR: number;
  avgCPC: number;
  totalImpressions: number;
  currency?: string;
}

interface KPICardsProps {
  data: KPIData;
  previousData?: Partial<KPIData>;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toFixed(n % 1 === 0 ? 0 : 2);
}

function ChangeIndicator({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined || previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const isPositive = pct > 0;

  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium ${
        isPositive ? "text-green-600" : "text-red-600"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export function KPICards({ data, previousData }: KPICardsProps) {
  const currency = data.currency || "TRY";

  const cards = [
    {
      title: "Toplam Harcama",
      value: `${formatNumber(data.totalSpend)} ${currency}`,
      icon: DollarSign,
      change: { current: data.totalSpend, previous: previousData?.totalSpend },
      color: "text-blue-600",
    },
    {
      title: "ROAS",
      value: `${data.totalROAS.toFixed(2)}x`,
      icon: Target,
      change: { current: data.totalROAS, previous: previousData?.totalROAS },
      color: "text-green-600",
    },
    {
      title: "Dönüşümler",
      value: formatNumber(data.totalConversions),
      icon: MousePointerClick,
      change: {
        current: data.totalConversions,
        previous: previousData?.totalConversions,
      },
      color: "text-purple-600",
    },
    {
      title: "Ort. CTR",
      value: `%${data.avgCTR.toFixed(2)}`,
      icon: Eye,
      change: { current: data.avgCTR, previous: previousData?.avgCTR },
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {card.title}
            </CardTitle>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{card.value}</span>
              <ChangeIndicator
                current={card.change.current}
                previous={card.change.previous}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
