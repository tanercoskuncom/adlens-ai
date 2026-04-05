"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformLayout } from "@/components/analysis/PlatformLayout";
import { MetricExplainer } from "@/components/dashboard/MetricExplainer";
import { analysisStore, type SavedAnalysis } from "@/store/analysisStore";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import type { CampaignAnalysis } from "@/types/analysis";

function fmtNum(val: number | undefined, type: "currency" | "number" | "percent" | "roas" | "freq" = "number"): string {
  if (val == null || isNaN(val)) return "—";
  if (type === "currency") {
    if (val >= 1_000_000) return `₺${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `₺${(val / 1_000).toFixed(1)}K`;
    return `₺${val.toFixed(0)}`;
  }
  if (type === "number") {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toLocaleString("tr-TR");
  }
  if (type === "percent") return `%${val.toFixed(2)}`;
  if (type === "roas") return `${val.toFixed(1)}x`;
  if (type === "freq") return val.toFixed(1);
  return String(val);
}

function scorePill(score: number) {
  let bg = "bg-red-100 text-red-700";
  if (score >= 80) bg = "bg-green-100 text-green-700";
  else if (score >= 60) bg = "bg-amber-100 text-amber-700";
  else if (score >= 40) bg = "bg-orange-100 text-orange-700";

  return (
    <span className={`inline-flex items-center justify-center w-10 h-7 rounded-md font-bold text-xs ${bg}`}>
      {score}
    </span>
  );
}

export default function MetaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const data = analysisStore.getById(id);
    if (data && (data.platform === "META" || data.platform === "BOTH")) {
      setAnalysis(data);
    } else if (data) {
      router.replace(`/dashboard/analysis/${id}`);
    }
    setLoading(false);
  }, [id, router]);

  if (loading) {
    return (
      <>
        <Header title="Yükleniyor..." />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

  if (!analysis) {
    return (
      <>
        <Header title="Analiz Bulunamadı" />
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Bu analiz bulunamadı.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const { result, platform } = analysis;
  const hasMeta = platform === "META" || platform === "BOTH";
  const hasGoogle = platform === "GOOGLE" || platform === "BOTH";

  const metaCampaigns = (result.campaignAnalyses ?? []).filter((c) => {
    const name = (c.campaignName ?? "").toLowerCase();
    const isGoogle =
      name.includes("google") ||
      name.includes("search") ||
      name.includes("shopping") ||
      name.includes("pmax") ||
      name.includes("display");
    return !isGoogle;
  });

  // KPI hesaplamaları
  const totalSpend = metaCampaigns.reduce((sum, c) => sum + (c.metrics?.spend ?? 0), 0);
  const totalReach = metaCampaigns.reduce((sum, c) => sum + (c.metrics?.reach ?? 0), 0);
  const totalImpressions = metaCampaigns.reduce((sum, c) => sum + (c.metrics?.impressions ?? 0), 0);
  const totalConvValue = metaCampaigns.reduce((sum, c) => sum + (c.metrics?.conversions ?? 0), 0);
  const avgRoas = totalSpend > 0
    ? metaCampaigns.reduce((sum, c) => sum + (c.metrics?.roas ?? 0), 0) / metaCampaigns.length
    : 0;
  const avgFreq = metaCampaigns.length > 0
    ? metaCampaigns.reduce((sum, c) => sum + (c.metrics?.frequency ?? 0), 0) / metaCampaigns.length
    : 0;
  const avgScore = metaCampaigns.length > 0
    ? Math.round(metaCampaigns.reduce((sum, c) => sum + (c.score ?? 0), 0) / metaCampaigns.length)
    : 0;

  const metaPlatform = result.overallReport.platformComparison?.meta;

  const freqColor = avgFreq > 4 ? "text-red-500" : avgFreq > 3 ? "text-amber-500" : "text-green-500";
  const freqLabel = avgFreq > 4 ? "Yüksek" : avgFreq > 3 ? "Dikkat" : "İdeal aralıkta";

  return (
    <>
      <Header title={`${analysis.clientName} — Meta Ads`} />
      <PlatformLayout analysisId={id} hasMeta={hasMeta} hasGoogle={hasGoogle}>
        <div className="p-6 space-y-5">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Toplam Harcama</p>
              <p className="text-2xl font-bold">{fmtNum(totalSpend, "currency")}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Ort. ROAS</p>
              <p className="text-2xl font-bold">{fmtNum(avgRoas, "roas")}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Reach</p>
              <p className="text-2xl font-bold">{fmtNum(totalReach, "number")}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: avgFreq > 4 ? '#ef4444' : avgFreq > 3 ? '#f59e0b' : '#3b82f6' }} />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Ort. Frequency</p>
              <p className="text-2xl font-bold">{fmtNum(avgFreq, "freq")}</p>
              <p className={`text-xs mt-1 ${freqColor}`}>— {freqLabel}</p>
            </div>
          </div>

          {/* Platform Assessment */}
          {metaPlatform?.assessment && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Platform Değerlendirmesi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">{metaPlatform.assessment}</p>
              </CardContent>
            </Card>
          )}

          {/* Campaign Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-blue-600">Meta Kampanyaları</h3>
              <Badge className="bg-blue-100 text-blue-700">{metaCampaigns.length}</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="w-8 px-3 py-2.5" />
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Kampanya</th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Harcama</th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ROAS</th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">CTR</th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Frequency</th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Reach</th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Dönüşüm</th>
                    <th className="px-4 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {metaCampaigns.map((campaign) => {
                    const isExpanded = expandedId === (campaign.campaignName ?? "");
                    const m = campaign.metrics;
                    const freq = m?.frequency ?? 0;
                    const freqCellColor = freq > 4 ? "text-red-500" : freq > 3 ? "text-amber-500" : "text-green-600";

                    return (
                      <CampaignRow
                        key={campaign.campaignName ?? Math.random()}
                        campaign={campaign}
                        isExpanded={isExpanded}
                        freqCellColor={freqCellColor}
                        onToggle={() => setExpandedId(isExpanded ? null : (campaign.campaignName ?? ""))}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>

            {metaCampaigns.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">
                Meta kampanyası bulunamadı.
              </div>
            )}
          </div>
        </div>
      </PlatformLayout>
    </>
  );
}

function CampaignRow({
  campaign,
  isExpanded,
  freqCellColor,
  onToggle,
}: {
  campaign: CampaignAnalysis;
  isExpanded: boolean;
  freqCellColor: string;
  onToggle: () => void;
}) {
  const m = campaign.metrics;
  const freq = m?.frequency ?? 0;

  return (
    <>
      <tr
        className="border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <td className="px-3 py-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </td>
        <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[220px] truncate">
          {campaign.campaignName ?? "—"}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 text-right">{fmtNum(m?.spend, "currency")}</td>
        <td className="px-4 py-3 text-sm text-gray-600 text-right font-medium">{fmtNum(m?.roas, "roas")}</td>
        <td className="px-4 py-3 text-sm text-gray-600 text-right">{fmtNum(m?.ctr, "percent")}</td>
        <td className={`px-4 py-3 text-sm text-right font-medium ${freqCellColor}`}>
          {fmtNum(freq, "freq")}
          {freq > 4 && <AlertTriangle className="w-3 h-3 inline ml-1" />}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 text-right">{fmtNum(m?.reach, "number")}</td>
        <td className="px-4 py-3 text-sm text-gray-600 text-right">{fmtNum(m?.conversions, "number")}</td>
        <td className="px-4 py-3 text-center">{scorePill(campaign.score ?? 0)}</td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={9} className="bg-gray-50 p-0">
            <div className="p-5 space-y-4">
              {/* Özet */}
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <h4 className="text-xs font-medium text-gray-400 mb-1">Kampanya Özeti</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{campaign.summary}</p>
              </div>

              {/* Güçlü / Zayıf / Aksiyonlar */}
              <div className="grid md:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
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
                <div className="p-3 bg-white rounded-lg border border-gray-200">
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
                <div className="p-3 bg-white rounded-lg border border-gray-200">
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
                  {Object.entries(campaign.benchmarkComparison).map(([key, value]) => (
                    <div key={key} className="p-2.5 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400 uppercase font-medium">{key}</span>
                        <MetricExplainer
                          campaignName={campaign.campaignName ?? ""}
                          metricName={key.toUpperCase()}
                          metricValue={value}
                          context={campaign.summary}
                        />
                      </div>
                      <p className="text-sm font-medium mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Anomaliler */}
              {(campaign.anomalies ?? []).length > 0 && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-700">
                  <strong>Anomaliler:</strong> {campaign.anomalies.join(", ")}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
