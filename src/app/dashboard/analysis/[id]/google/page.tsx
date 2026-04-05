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

export default function GoogleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = analysisStore.getById(id);
    if (data && (data.platform === "GOOGLE" || data.platform === "BOTH")) {
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

  // Google kampanyalarını filtrele
  const googleCampaigns = result.campaignAnalyses.filter((c) => {
    const name = c.campaignName.toLowerCase();
    return (
      name.includes("google") ||
      name.includes("search") ||
      name.includes("shopping") ||
      name.includes("pmax") ||
      name.includes("display")
    );
  });

  const googlePlatform = result.overallReport.platformComparison?.google;

  const avgScore =
    googleCampaigns.length > 0
      ? Math.round(
          googleCampaigns.reduce((sum, c) => sum + c.score, 0) /
            googleCampaigns.length
        )
      : 0;

  const urgentCount = googleCampaigns.reduce(
    (sum, c) => sum + c.actions.filter((a) => a.priority === "urgent").length,
    0
  );

  return (
    <>
      <Header title={`${analysis.clientName} — Google Ads`} />
      <PlatformLayout analysisId={id} hasMeta={hasMeta} hasGoogle={hasGoogle}>
        <div className="p-6 space-y-6">
          {/* Google Header */}
          <div className="bg-gradient-to-r from-red-500 to-amber-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="font-bold text-lg">G</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Google Ads Detayı</h2>
                <p className="text-red-100 text-sm">
                  {googleCampaigns.length} kampanya analiz edildi
                </p>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-red-500" />
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
                  {googlePlatform ? `${googlePlatform.avgRoas}x` : "—"}
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
                  {googlePlatform
                    ? `₺${googlePlatform.totalSpend.toLocaleString("tr-TR")}`
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
          {googlePlatform && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Platform Değerlendirmesi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {googlePlatform.assessment}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Campaign Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Google Kampanyaları
                <Badge className="bg-red-100 text-red-700">
                  {googleCampaigns.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {googleCampaigns.length > 0 ? (
                <CampaignTable campaigns={googleCampaigns} />
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">
                  Google kampanyası bulunamadı.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </PlatformLayout>
    </>
  );
}
