"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformLayout } from "@/components/analysis/PlatformLayout";
import { analysisStore, type SavedAnalysis } from "@/store/analysisStore";
import type { CampaignAnalysis } from "@/types/analysis";
import {
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

function CompareMetric({
  label,
  metaValue,
  googleValue,
  suffix,
  inverse,
}: {
  label: string;
  metaValue: number;
  googleValue: number;
  suffix?: string;
  inverse?: boolean;
}) {
  const metaWins = inverse ? metaValue < googleValue : metaValue > googleValue;
  const googleWins = inverse
    ? googleValue < metaValue
    : googleValue > metaValue;

  return (
    <div className="grid grid-cols-3 items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-right">
        <span
          className={`text-lg font-bold ${metaWins ? "text-blue-600" : "text-gray-600"}`}
        >
          {metaValue.toFixed(1)}
          {suffix}
        </span>
        {metaWins && <TrendingUp className="w-4 h-4 text-blue-500 inline ml-1" />}
      </div>
      <div className="text-center">
        <span className="text-xs text-gray-400 block">{label}</span>
      </div>
      <div className="text-left">
        <span
          className={`text-lg font-bold ${googleWins ? "text-red-600" : "text-gray-600"}`}
        >
          {googleValue.toFixed(1)}
          {suffix}
        </span>
        {googleWins && (
          <TrendingUp className="w-4 h-4 text-red-500 inline ml-1" />
        )}
      </div>
    </div>
  );
}

function filterByPlatform(
  campaigns: CampaignAnalysis[],
  platform: "meta" | "google"
): CampaignAnalysis[] {
  return campaigns.filter((c) => {
    const name = c.campaignName.toLowerCase();
    const isGoogle =
      name.includes("google") ||
      name.includes("search") ||
      name.includes("shopping") ||
      name.includes("pmax") ||
      name.includes("display");
    return platform === "google" ? isGoogle : !isGoogle;
  });
}

export default function PlatformComparePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = analysisStore.getById(id);
    if (data && data.platform === "BOTH") {
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

  const { result } = analysis;
  const metaCampaigns = filterByPlatform(result.campaignAnalyses, "meta");
  const googleCampaigns = filterByPlatform(result.campaignAnalyses, "google");
  const metaPlatform = result.overallReport.platformComparison?.meta;
  const googlePlatform = result.overallReport.platformComparison?.google;

  const metaAvgScore =
    metaCampaigns.length > 0
      ? metaCampaigns.reduce((s, c) => s + c.score, 0) / metaCampaigns.length
      : 0;
  const googleAvgScore =
    googleCampaigns.length > 0
      ? googleCampaigns.reduce((s, c) => s + c.score, 0) /
        googleCampaigns.length
      : 0;

  return (
    <>
      <Header title={`${analysis.clientName} — Platform Karşılaştırması`} />
      <PlatformLayout analysisId={id} hasMeta hasGoogle>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-xl font-bold">Meta Ads vs Google Ads</h2>
            <p className="text-indigo-100 text-sm mt-1">
              Platform bazlı performans karşılaştırması
            </p>
          </div>

          {/* Platform headers */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="font-medium text-blue-700">Meta Ads</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                vs
              </span>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
                <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <span className="font-medium text-red-700">Google Ads</span>
              </div>
            </div>
          </div>

          {/* Score comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skor Karşılaştırması</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CompareMetric
                label="Ort. Skor"
                metaValue={metaAvgScore}
                googleValue={googleAvgScore}
              />
              <CompareMetric
                label="Kampanya Sayısı"
                metaValue={metaCampaigns.length}
                googleValue={googleCampaigns.length}
              />
              {metaPlatform && googlePlatform && (
                <>
                  <CompareMetric
                    label="Ort. ROAS"
                    metaValue={metaPlatform.avgRoas}
                    googleValue={googlePlatform.avgRoas}
                    suffix="x"
                  />
                  <CompareMetric
                    label="Toplam Harcama"
                    metaValue={metaPlatform.totalSpend}
                    googleValue={googlePlatform.totalSpend}
                    suffix=" ₺"
                    inverse
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Platform assessments side by side */}
          {metaPlatform && googlePlatform && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700">Meta</Badge>
                    Değerlendirme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {metaPlatform.assessment}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-700">Google</Badge>
                    Değerlendirme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {googlePlatform.assessment}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Campaigns by platform */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Meta Kampanyaları ({metaCampaigns.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metaCampaigns.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-blue-50/50 rounded"
                    >
                      <span className="text-sm truncate flex-1">
                        {c.campaignName}
                      </span>
                      <Badge
                        className={
                          c.score >= 70
                            ? "bg-green-100 text-green-700"
                            : c.score >= 50
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }
                      >
                        {c.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Google Kampanyaları ({googleCampaigns.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {googleCampaigns.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-red-50/50 rounded"
                    >
                      <span className="text-sm truncate flex-1">
                        {c.campaignName}
                      </span>
                      <Badge
                        className={
                          c.score >= 70
                            ? "bg-green-100 text-green-700"
                            : c.score >= 50
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }
                      >
                        {c.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PlatformLayout>
    </>
  );
}
