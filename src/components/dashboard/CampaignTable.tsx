"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";
import { MetricExplainer } from "@/components/dashboard/MetricExplainer";
import type { CampaignAnalysis } from "@/types/analysis";

interface CampaignTableProps {
  campaigns: CampaignAnalysis[];
  onCampaignClick?: (campaign: CampaignAnalysis) => void;
}

type SortKey = "campaignName" | "score" | "spend" | "roas";
type SortDir = "asc" | "desc";

function statusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    critical: { label: "Kritik", className: "bg-red-100 text-red-700" },
    needs_improvement: {
      label: "Geliştirilmeli",
      className: "bg-amber-100 text-amber-700",
    },
    good: { label: "İyi", className: "bg-green-100 text-green-700" },
    excellent: { label: "Mükemmel", className: "bg-blue-100 text-blue-700" },
  };
  const c = config[status] || config.good;
  return <Badge className={c.className}>{c.label}</Badge>;
}

function scoreBadge(score: number) {
  let color = "text-red-600 bg-red-50";
  if (score >= 80) color = "text-blue-600 bg-blue-50";
  else if (score >= 60) color = "text-green-600 bg-green-50";
  else if (score >= 40) color = "text-amber-600 bg-amber-50";

  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ${color}`}
    >
      {score}
    </span>
  );
}

function fmt(val: number | undefined, type: "currency" | "number" | "percent" | "decimal" = "number"): string {
  if (val == null || val === 0) return "—";
  if (type === "currency") return `₺${val.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`;
  if (type === "percent") return `%${val.toFixed(2)}`;
  if (type === "decimal") return val.toFixed(2);
  return val.toLocaleString("tr-TR");
}

export function CampaignTable({ campaigns, onCampaignClick }: CampaignTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...campaigns].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "campaignName") return (a.campaignName ?? "").localeCompare(b.campaignName ?? "") * dir;
    if (sortKey === "score") return ((a.score ?? 0) - (b.score ?? 0)) * dir;
    if (sortKey === "spend") return ((a.metrics?.spend ?? 0) - (b.metrics?.spend ?? 0)) * dir;
    if (sortKey === "roas") return ((a.metrics?.roas ?? 0) - (b.metrics?.roas ?? 0)) * dir;
    return 0;
  });

  const hasMetrics = campaigns.some((c) => c.metrics);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>
              <button onClick={() => toggleSort("campaignName")} className="flex items-center gap-1 hover:text-gray-900">
                Kampanya <ArrowUpDown className="w-3 h-3" />
              </button>
            </TableHead>
            <TableHead className="w-16">
              <button onClick={() => toggleSort("score")} className="flex items-center gap-1 hover:text-gray-900">
                Skor <ArrowUpDown className="w-3 h-3" />
              </button>
            </TableHead>
            <TableHead className="w-24">Durum</TableHead>
            {hasMetrics && (
              <>
                <TableHead className="w-24 text-right">
                  <button onClick={() => toggleSort("spend")} className="flex items-center gap-1 hover:text-gray-900 ml-auto">
                    Harcama <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead className="w-20 text-right">Gösterim</TableHead>
                <TableHead className="w-20 text-right">Tıklama</TableHead>
                <TableHead className="w-16 text-right">CTR</TableHead>
                <TableHead className="w-16 text-right">CPC</TableHead>
                <TableHead className="w-16 text-right">
                  <button onClick={() => toggleSort("roas")} className="flex items-center gap-1 hover:text-gray-900 ml-auto">
                    ROAS <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead className="w-20 text-right">Dönüşüm</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((campaign) => {
            const isExpanded = expandedId === (campaign.campaignName ?? "");
            const m = campaign.metrics;
            return (
              <>
                <TableRow
                  key={campaign.campaignName ?? Math.random()}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : (campaign.campaignName ?? ""));
                    onCampaignClick?.(campaign);
                  }}
                >
                  <TableCell>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {campaign.campaignName ?? "—"}
                  </TableCell>
                  <TableCell>{scoreBadge(campaign.score ?? 0)}</TableCell>
                  <TableCell>{statusBadge(campaign.status ?? "good")}</TableCell>
                  {hasMetrics && (
                    <>
                      <TableCell className="text-right text-sm font-medium">{fmt(m?.spend, "currency")}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(m?.impressions)}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(m?.clicks)}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(m?.ctr, "percent")}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(m?.cpc, "currency")}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{m?.roas ? `${m.roas.toFixed(2)}x` : "—"}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(m?.conversions)}</TableCell>
                    </>
                  )}
                </TableRow>

                {isExpanded && (
                  <TableRow key={`${campaign.campaignName}-detail`}>
                    <TableCell colSpan={hasMetrics ? 12 : 5} className="bg-gray-50 p-0">
                      <div className="p-4 space-y-4">
                        {/* Özet */}
                        <div className="p-3 bg-white rounded-lg border">
                          <h4 className="text-xs font-medium text-gray-400 mb-1">Kampanya Özeti</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{campaign.summary}</p>
                        </div>

                        {/* Güçlü / Zayıf / Aksiyonlar */}
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-3 bg-white rounded-lg border">
                            <h4 className="text-sm font-medium text-green-700 mb-2">Güçlü Yönler</h4>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                              {(campaign.strengths ?? []).map((s, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-green-500 shrink-0 mt-0.5">+</span>
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3 bg-white rounded-lg border">
                            <h4 className="text-sm font-medium text-red-700 mb-2">Zayıf Yönler</h4>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                              {(campaign.weaknesses ?? []).map((w, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-red-500 shrink-0 mt-0.5">-</span>
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3 bg-white rounded-lg border">
                            <h4 className="text-sm font-medium text-blue-700 mb-2">Aksiyonlar</h4>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                              {(campaign.actions ?? []).map((a, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-blue-500 shrink-0 mt-0.5">→</span>
                                  <span>{a.action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Benchmark */}
                        {campaign.benchmarkComparison && (
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(campaign.benchmarkComparison).map(
                              ([key, value]) => (
                                <div key={key} className="p-2 bg-white rounded-lg border text-xs">
                                  <span className="text-gray-400 uppercase">{key}</span>
                                  <MetricExplainer
                                    campaignName={campaign.campaignName ?? ""}
                                    metricName={key.toUpperCase()}
                                    metricValue={value}
                                    context={campaign.summary}
                                  />
                                  <p className="font-medium mt-1">{value}</p>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {/* Anomaliler */}
                        {(campaign.anomalies ?? []).length > 0 && (
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-700">
                            <strong>Anomaliler:</strong>{" "}
                            {campaign.anomalies.join(", ")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
