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
  ShoppingCart,
  MousePointerClick,
  Eye,
  MessageCircle,
  Target,
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

const OBJECTIVE_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof ShoppingCart }> = {
  "Satış": { label: "Satış", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200", icon: ShoppingCart },
  "Trafik": { label: "Trafik", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: MousePointerClick },
  "Bilinirlik": { label: "Bilinirlik", color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200", icon: Eye },
  "Etkileşim": { label: "Etkileşim", color: "text-orange-700", bgColor: "bg-orange-50 border-orange-200", icon: MessageCircle },
  "Lead": { label: "Lead", color: "text-indigo-700", bgColor: "bg-indigo-50 border-indigo-200", icon: Target },
};

function objectiveBadge(objective?: string) {
  const obj = objective || "Genel";
  const config = OBJECTIVE_CONFIG[obj];
  if (!config) {
    return <Badge className="bg-gray-100 text-gray-600 text-[10px] font-medium">{obj}</Badge>;
  }
  return (
    <Badge className={`${config.bgColor} ${config.color} text-[10px] font-medium border`}>
      {config.label}
    </Badge>
  );
}

/** Amaca göre "ana performans metriği" döndür */
function primaryMetric(campaign: CampaignAnalysis): { label: string; value: string } {
  const m = campaign.metrics;
  const obj = campaign.objective || "Satış";

  switch (obj) {
    case "Trafik":
      return { label: "CPC", value: m?.cpc ? `₺${m.cpc.toFixed(2)}` : "—" };
    case "Bilinirlik":
      return { label: "CPM", value: m?.cpm ? `₺${m.cpm.toFixed(0)}` : "—" };
    case "Etkileşim":
      return { label: "CTR", value: m?.ctr ? `%${m.ctr.toFixed(2)}` : "—" };
    case "Lead":
      return { label: "CPL", value: m?.costPerResult ? `₺${m.costPerResult.toFixed(0)}` : "—" };
    default: // Satış
      return { label: "ROAS", value: m?.roas ? `${m.roas.toFixed(1)}x` : "—" };
  }
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
      name.includes("google") || name.includes("search") ||
      name.includes("shopping") || name.includes("pmax") || name.includes("display");
    return !isGoogle;
  });

  // KPI hesaplamaları
  const totalSpend = metaCampaigns.reduce((sum, c) => sum + (c.metrics?.spend ?? 0), 0);
  const totalReach = metaCampaigns.reduce((sum, c) => sum + (c.metrics?.reach ?? 0), 0);

  // Sadece satış kampanyaları için ROAS hesapla
  const salesCampaigns = metaCampaigns.filter((c) => (c.objective || "Satış") === "Satış");
  const avgRoas = salesCampaigns.length > 0
    ? salesCampaigns.reduce((sum, c) => sum + (c.metrics?.roas ?? 0), 0) / salesCampaigns.length
    : 0;
  const totalConversions = salesCampaigns.reduce((sum, c) => sum + (c.metrics?.conversions ?? 0), 0);

  const avgFreq = metaCampaigns.length > 0
    ? metaCampaigns.reduce((sum, c) => sum + (c.metrics?.frequency ?? 0), 0) / metaCampaigns.length
    : 0;

  const metaPlatform = result.overallReport.platformComparison?.meta;
  const objBreakdown = result.overallReport.objectiveBreakdown;

  const freqColor = avgFreq > 4 ? "text-red-500" : avgFreq > 3 ? "text-amber-500" : "text-green-500";
  const freqLabel = avgFreq > 4 ? "Yüksek" : avgFreq > 3 ? "Dikkat" : "İdeal aralıkta";

  // Kampanyaları amaca göre grupla
  const objectiveGroups = new Map<string, CampaignAnalysis[]>();
  for (const c of metaCampaigns) {
    const obj = c.objective || "Satış";
    if (!objectiveGroups.has(obj)) objectiveGroups.set(obj, []);
    objectiveGroups.get(obj)!.push(c);
  }

  // Sıralama: Satış > Trafik > Bilinirlik > Etkileşim > Lead > diğer
  const objectiveOrder = ["Satış", "Trafik", "Bilinirlik", "Etkileşim", "Lead"];
  const sortedGroups = [...objectiveGroups.entries()].sort((a, b) => {
    const ai = objectiveOrder.indexOf(a[0]);
    const bi = objectiveOrder.indexOf(b[0]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

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
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Ort. ROAS <span className="text-[9px] text-gray-300">(Satış)</span>
              </p>
              <p className="text-2xl font-bold">{fmtNum(avgRoas, "roas")}</p>
              {totalConversions > 0 && (
                <p className="text-xs text-gray-400 mt-1">{totalConversions} dönüşüm</p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Toplam Reach</p>
              <p className="text-2xl font-bold">{fmtNum(totalReach, "number")}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: avgFreq > 4 ? '#ef4444' : avgFreq > 3 ? '#f59e0b' : '#3b82f6' }} />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Ort. Frequency</p>
              <p className="text-2xl font-bold">{fmtNum(avgFreq, "freq")}</p>
              <p className={`text-xs mt-1 ${freqColor}`}>— {freqLabel}</p>
            </div>
          </div>

          {/* Objective Breakdown */}
          {objBreakdown && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {objBreakdown.sales && objBreakdown.sales.campaignCount > 0 && (
                <Card className="border-emerald-200">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">Satış Kampanyaları ({objBreakdown.sales.campaignCount})</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{objBreakdown.sales.assessment}</p>
                  </CardContent>
                </Card>
              )}
              {objBreakdown.traffic && objBreakdown.traffic.campaignCount > 0 && (
                <Card className="border-blue-200">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MousePointerClick className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">Trafik Kampanyaları ({objBreakdown.traffic.campaignCount})</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{objBreakdown.traffic.assessment}</p>
                  </CardContent>
                </Card>
              )}
              {objBreakdown.awareness && objBreakdown.awareness.campaignCount > 0 && (
                <Card className="border-purple-200">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-700">Bilinirlik Kampanyaları ({objBreakdown.awareness.campaignCount})</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{objBreakdown.awareness.assessment}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

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

          {/* Campaign Groups by Objective */}
          {sortedGroups.map(([objective, campaigns]) => {
            const config = OBJECTIVE_CONFIG[objective];
            const Icon = config?.icon || Target;
            const groupColor = config?.color || "text-gray-700";

            // Dinamik kolon başlıkları
            const columns = getColumnsForObjective(objective);

            return (
              <div key={objective} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${groupColor}`} />
                    <h3 className={`text-sm font-semibold ${groupColor}`}>{objective} Kampanyaları</h3>
                  </div>
                  <Badge className="bg-gray-100 text-gray-600">{campaigns.length}</Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="w-8 px-3 py-2.5" />
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Kampanya</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Harcama</th>
                        {columns.map((col) => (
                          <th key={col.key} className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            {col.label}
                          </th>
                        ))}
                        <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Frequency</th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Skor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => {
                        const isExpanded = expandedId === (campaign.campaignName ?? "");
                        return (
                          <CampaignRow
                            key={campaign.campaignName ?? Math.random()}
                            campaign={campaign}
                            columns={columns}
                            isExpanded={isExpanded}
                            onToggle={() => setExpandedId(isExpanded ? null : (campaign.campaignName ?? ""))}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {metaCampaigns.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              Meta kampanyası bulunamadı.
            </div>
          )}
        </div>
      </PlatformLayout>
    </>
  );
}

interface ColumnDef {
  key: string;
  label: string;
  render: (m: CampaignAnalysis["metrics"]) => string;
}

function getColumnsForObjective(objective: string): ColumnDef[] {
  switch (objective) {
    case "Trafik":
      return [
        { key: "ctr", label: "CTR", render: (m) => fmtNum(m?.ctr, "percent") },
        { key: "cpc", label: "CPC", render: (m) => m?.cpc ? `₺${m.cpc.toFixed(2)}` : "—" },
        { key: "clicks", label: "Tıklama", render: (m) => fmtNum(m?.clicks, "number") },
        { key: "reach", label: "Reach", render: (m) => fmtNum(m?.reach, "number") },
      ];
    case "Bilinirlik":
      return [
        { key: "reach", label: "Reach", render: (m) => fmtNum(m?.reach, "number") },
        { key: "cpm", label: "CPM", render: (m) => m?.cpm ? `₺${m.cpm.toFixed(0)}` : "—" },
        { key: "impressions", label: "Gösterim", render: (m) => fmtNum(m?.impressions, "number") },
      ];
    case "Etkileşim":
      return [
        { key: "ctr", label: "CTR", render: (m) => fmtNum(m?.ctr, "percent") },
        { key: "cpc", label: "CPC", render: (m) => m?.cpc ? `₺${m.cpc.toFixed(2)}` : "—" },
        { key: "reach", label: "Reach", render: (m) => fmtNum(m?.reach, "number") },
        { key: "clicks", label: "Tıklama", render: (m) => fmtNum(m?.clicks, "number") },
      ];
    case "Lead":
      return [
        { key: "conversions", label: "Lead", render: (m) => fmtNum(m?.conversions, "number") },
        { key: "costPerResult", label: "CPL", render: (m) => m?.costPerResult ? `₺${m.costPerResult.toFixed(0)}` : "—" },
        { key: "ctr", label: "CTR", render: (m) => fmtNum(m?.ctr, "percent") },
        { key: "reach", label: "Reach", render: (m) => fmtNum(m?.reach, "number") },
      ];
    default: // Satış
      return [
        { key: "roas", label: "ROAS", render: (m) => fmtNum(m?.roas, "roas") },
        { key: "ctr", label: "CTR", render: (m) => fmtNum(m?.ctr, "percent") },
        { key: "conversions", label: "Dönüşüm", render: (m) => fmtNum(m?.conversions, "number") },
        { key: "reach", label: "Reach", render: (m) => fmtNum(m?.reach, "number") },
      ];
  }
}

function CampaignRow({
  campaign,
  columns,
  isExpanded,
  onToggle,
}: {
  campaign: CampaignAnalysis;
  columns: ColumnDef[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const m = campaign.metrics;
  const freq = m?.frequency ?? 0;
  const freqColor = freq > 4 ? "text-red-500" : freq > 3 ? "text-amber-500" : "text-green-600";
  const colCount = 4 + columns.length; // expand + name + spend + columns + freq + score

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
        {columns.map((col) => (
          <td key={col.key} className="px-4 py-3 text-sm text-gray-600 text-right font-medium">
            {col.render(m)}
          </td>
        ))}
        <td className={`px-4 py-3 text-sm text-right font-medium ${freqColor}`}>
          {fmtNum(freq, "freq")}
          {freq > 4 && <AlertTriangle className="w-3 h-3 inline ml-1" />}
        </td>
        <td className="px-4 py-3 text-center">{scorePill(campaign.score ?? 0)}</td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={colCount} className="bg-gray-50 p-0">
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
