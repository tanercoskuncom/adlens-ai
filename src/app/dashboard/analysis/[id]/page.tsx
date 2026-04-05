"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { ActionPanel } from "@/components/analysis/ActionPanel";
import { NewCampaignSuggestions } from "@/components/analysis/NewCampaignSuggestions";
import { PDFExportButton } from "@/components/reports/PDFExportButton";
import { ShareCard } from "@/components/reports/ShareCard";
import { analysisStore, type SavedAnalysis } from "@/store/analysisStore";
import { PlatformLayout } from "@/components/analysis/PlatformLayout";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import {
  BarChart3,
  Target,
  Zap,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-blue-600"
      : score >= 60
        ? "text-green-600"
        : score >= 40
          ? "text-amber-600"
          : "text-red-600";
  const bg =
    score >= 80
      ? "bg-blue-50"
      : score >= 60
        ? "bg-green-50"
        : score >= 40
          ? "bg-amber-50"
          : "bg-red-50";

  return (
    <div
      className={`w-24 h-24 rounded-full ${bg} flex flex-col items-center justify-center`}
    >
      <span className={`text-3xl font-bold ${color}`}>{score}</span>
      <span className="text-xs text-gray-400">/100</span>
    </div>
  );
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = analysisStore.getById(id);
    setAnalysis(data || null);
    setLoading(false);
  }, [id]);

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
              <p className="text-gray-500">
                Bu analiz bulunamadı veya silinmiş olabilir.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const { result, clientName, platform } = analysis;
  const { overallReport, actionPlan, campaignAnalyses, newCampaignSuggestions } =
    result;

  const hasMeta = platform === "META" || platform === "BOTH";
  const hasGoogle = platform === "GOOGLE" || platform === "BOTH";

  const healthConfig: Record<string, { label: string; className: string }> = {
    critical: { label: "Kritik", className: "bg-red-100 text-red-700" },
    needs_improvement: {
      label: "Geliştirilmeli",
      className: "bg-amber-100 text-amber-700",
    },
    good: { label: "İyi", className: "bg-green-100 text-green-700" },
    excellent: { label: "Mükemmel", className: "bg-blue-100 text-blue-700" },
  };
  const health =
    healthConfig[overallReport.accountHealth] || healthConfig.good;

  return (
    <>
      <Header title={`${clientName} — Analiz Detayı`} />
      <PlatformLayout analysisId={id} hasMeta={hasMeta} hasGoogle={hasGoogle}>
      <div className="p-6 space-y-6">
        {/* Score + Summary + PDF Export */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <ScoreRing score={overallReport.overallScore} />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{clientName}</h2>
                  <Badge className={health.className}>{health.label}</Badge>
                  <Badge variant="outline">{analysis.platform}</Badge>
                </div>
                <p className="text-gray-600">{overallReport.overallSummary}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {overallReport.keyInsights.map((insight, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {insight}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <PDFExportButton
                  result={result}
                  clientName={clientName}
                  mode="technical"
                />
                <PDFExportButton
                  result={result}
                  clientName={clientName}
                  mode="client"
                />
                <ShareCard result={result} clientName={clientName} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mini KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">Kampanya Sayısı</span>
              </div>
              <span className="text-xl font-bold">
                {campaignAnalyses.length}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500">En İyi</span>
              </div>
              <span className="text-sm font-bold truncate block">
                {overallReport.topPerformer.campaignName}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500">En Kötü</span>
              </div>
              <span className="text-sm font-bold truncate block">
                {overallReport.worstPerformer.campaignName}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-500">Acil Aksiyon</span>
              </div>
              <span className="text-xl font-bold">
                {actionPlan.urgentActions.length}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Kampanyalar / Aksiyonlar / Öneriler */}
        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns">
              Kampanyalar ({campaignAnalyses.length})
            </TabsTrigger>
            <TabsTrigger value="actions">
              Aksiyonlar (
              {actionPlan.urgentActions.length +
                actionPlan.monthlyActions.length}
              )
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              Yeni Öneriler ({newCampaignSuggestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Kampanya Performansları</CardTitle>
              </CardHeader>
              <CardContent>
                <CampaignTable campaigns={campaignAnalyses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="mt-4">
            <ActionPanel actionPlan={actionPlan} />
          </TabsContent>

          <TabsContent value="suggestions" className="mt-4">
            <NewCampaignSuggestions suggestions={newCampaignSuggestions} />
          </TabsContent>
        </Tabs>

        {/* Bütçe Verimliliği */}
        {overallReport.budgetEfficiency && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bütçe Verimliliği</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {overallReport.budgetEfficiency}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Yaklaşan Fırsatlar */}
        <UpcomingEvents sector={analysis.template} limit={3} />
      </div>
      </PlatformLayout>
    </>
  );
}
