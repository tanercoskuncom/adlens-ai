"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformLayout } from "@/components/analysis/PlatformLayout";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { analysisStore, type SavedAnalysis } from "@/store/analysisStore";
import { AlertCircle, Target, TrendingUp, DollarSign } from "lucide-react";

export default function MetaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Meta kampanyalarını filtrele (kampanya adında Meta/Facebook ipuçları veya Google olmayan)
  const metaCampaigns = result.campaignAnalyses.filter((c) => {
    const name = c.campaignName.toLowerCase();
    const isGoogle =
      name.includes("google") ||
      name.includes("search") ||
      name.includes("shopping") ||
      name.includes("pmax") ||
      name.includes("display");
    return !isGoogle;
  });

  const metaPlatform = result.overallReport.platformComparison?.meta;

  const avgScore =
    metaCampaigns.length > 0
      ? Math.round(
          metaCampaigns.reduce((sum, c) => sum + c.score, 0) /
            metaCampaigns.length
        )
      : 0;

  const urgentCount = metaCampaigns.reduce(
    (sum, c) => sum + c.actions.filter((a) => a.priority === "urgent").length,
    0
  );

  return (
    <>
      <Header title={`${analysis.clientName} — Meta Ads`} />
      <PlatformLayout analysisId={id} hasMeta={hasMeta} hasGoogle={hasGoogle}>
        <div className="p-6 space-y-6">
          {/* Meta Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="font-bold text-lg">M</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Meta Ads Detayı</h2>
                <p className="text-blue-100 text-sm">
                  {metaCampaigns.length} kampanya analiz edildi
                </p>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500">Ort. Skor</span>
                </div>
                <span className="text-xl font-bold">{avgScore}</span>
                <span className="text-xs text-gray-400"> /100</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500">Ort. ROAS</span>
                </div>
                <span className="text-xl font-bold">
                  {metaPlatform ? `${metaPlatform.avgRoas}x` : "—"}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-500">Toplam Harcama</span>
                </div>
                <span className="text-xl font-bold">
                  {metaPlatform
                    ? `₺${metaPlatform.totalSpend.toLocaleString("tr-TR")}`
                    : "—"}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-gray-500">Acil Aksiyon</span>
                </div>
                <span className="text-xl font-bold">{urgentCount}</span>
              </CardContent>
            </Card>
          </div>

          {/* Platform Assessment */}
          {metaPlatform && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Platform Değerlendirmesi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{metaPlatform.assessment}</p>
              </CardContent>
            </Card>
          )}

          {/* Campaign Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Meta Kampanyaları
                <Badge className="bg-blue-100 text-blue-700">
                  {metaCampaigns.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metaCampaigns.length > 0 ? (
                <CampaignTable campaigns={metaCampaigns} />
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">
                  Meta kampanyası bulunamadı.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </PlatformLayout>
    </>
  );
}
