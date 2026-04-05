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

type SortKey = "campaignName" | "score" | "status";
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
    if (sortKey === "campaignName") return a.campaignName.localeCompare(b.campaignName) * dir;
    if (sortKey === "score") return (a.score - b.score) * dir;
    return a.status.localeCompare(b.status) * dir;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8" />
          <TableHead>
            <button
              onClick={() => toggleSort("campaignName")}
              className="flex items-center gap-1 hover:text-gray-900"
            >
              Kampanya
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </TableHead>
          <TableHead>
            <button
              onClick={() => toggleSort("score")}
              className="flex items-center gap-1 hover:text-gray-900"
            >
              Skor
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </TableHead>
          <TableHead>
            <button
              onClick={() => toggleSort("status")}
              className="flex items-center gap-1 hover:text-gray-900"
            >
              Durum
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </TableHead>
          <TableHead>Özet</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((campaign) => {
          const isExpanded = expandedId === campaign.campaignName;
          return (
            <>
              <TableRow
                key={campaign.campaignName}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setExpandedId(isExpanded ? null : campaign.campaignName);
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
                <TableCell className="font-medium">
                  {campaign.campaignName}
                </TableCell>
                <TableCell>{scoreBadge(campaign.score)}</TableCell>
                <TableCell>{statusBadge(campaign.status)}</TableCell>
                <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                  {campaign.summary}
                </TableCell>
              </TableRow>

              {isExpanded && (
                <TableRow key={`${campaign.campaignName}-detail`}>
                  <TableCell colSpan={5} className="bg-gray-50 p-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-2">
                          Güçlü Yönler
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {campaign.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-green-500 mt-0.5">+</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-2">
                          Zayıf Yönler
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {campaign.weaknesses.map((w, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-red-500 mt-0.5">-</span>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-700 mb-2">
                          Aksiyonlar
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {(campaign.actions ?? []).map((a, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-blue-500 mt-0.5">→</span>
                              {a.action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {/* Benchmark Karşılaştırması */}
                    {campaign.benchmarkComparison && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {Object.entries(campaign.benchmarkComparison).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="p-2 bg-white rounded border text-xs"
                            >
                              <span className="text-gray-400 uppercase">
                                {key}
                              </span>
                              <MetricExplainer
                                campaignName={campaign.campaignName}
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

                    {campaign.anomalies.length > 0 && (
                      <div className="mt-3 p-2 bg-amber-50 rounded text-sm text-amber-700">
                        <strong>Anomaliler:</strong>{" "}
                        {campaign.anomalies.join(", ")}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </>
          );
        })}
      </TableBody>
    </Table>
  );
}
