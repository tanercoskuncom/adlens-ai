"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ReportKPICardProps {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
}

export function ReportKPICard({ label, value, change, prefix, suffix, icon }: ReportKPICardProps) {
  const changeColor = change === undefined ? "" : change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-gray-400";
  const ChangeIcon = change === undefined ? null : change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <div className="bg-gray-800/80 backdrop-blur rounded-xl p-5 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white">
          {prefix}{typeof value === "number" ? value.toLocaleString("tr-TR") : value}{suffix}
        </span>
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${changeColor}`}>
          {ChangeIcon && <ChangeIcon className="w-3.5 h-3.5" />}
          <span>{change > 0 ? "+" : ""}{change.toFixed(1)}%</span>
          <span className="text-gray-500 text-xs ml-1">onceki donem</span>
        </div>
      )}
    </div>
  );
}
