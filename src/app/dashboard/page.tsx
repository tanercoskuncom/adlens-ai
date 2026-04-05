"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analysisStore, type SavedAnalysis } from "@/store/analysisStore";
import { creditStore } from "@/store/creditStore";
import { DEMO_RESULT } from "@/lib/demo/demoData";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { ScoreHistory } from "@/components/dashboard/ScoreHistory";
import { BadgeWall } from "@/components/dashboard/BadgeWall";
import { toast } from "sonner";
import {
  Upload,
  BarChart3,
  TrendingUp,
  Zap,
  ExternalLink,
  Play,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);

  useEffect(() => {
    setAnalyses(analysisStore.getAll());
  }, []);

  const handleDemo = () => {
    const id = analysisStore.add({
      clientName: "Demo Müşteri",
      platform: "BOTH",
      template: "ecommerce",
      language: "tr",
      fileName: "demo-data.xlsx",
      result: DEMO_RESULT,
    });
    toast.success("Demo analiz oluşturuldu");
    router.push(`/dashboard/analysis/${id}`);
  };

  const totalAnalyses = analyses.length;
  const avgScore =
    totalAnalyses > 0
      ? Math.round(
          analyses.reduce(
            (sum, a) => sum + a.result.overallReport.overallScore,
            0
          ) / totalAnalyses
        )
      : 0;
  const totalUrgent = analyses.reduce(
    (sum, a) => sum + a.result.actionPlan.urgentActions.length,
    0
  );
  const creditsRemaining = creditStore.getRemaining();
  const creditsTotal = creditStore.getTotal();

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            AdLens AI&apos;a Hoş Geldiniz
          </h2>
          <p className="text-blue-100 mb-4">
            Meta Ads ve Google Ads verilerinizi yükleyin, yapay zeka destekli
            analiz ve aksiyon önerileri alın.
          </p>
          <div className="flex gap-3">
            <Link href="/dashboard/new">
              <Button variant="secondary" className="gap-2">
                <Upload className="w-4 h-4" />
                Yeni Analiz Başlat
              </Button>
            </Link>
            <Button
              variant="secondary"
              className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={handleDemo}
            >
              <Play className="w-4 h-4" />
              Demo Dene
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Toplam Analiz
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAnalyses}</div>
              <p className="text-xs text-gray-500">
                {totalAnalyses === 0
                  ? "Henüz analiz yapılmadı"
                  : `${analyses[0]?.clientName} son analiz`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Ortalama Skor
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalAnalyses > 0 ? avgScore : "—"}
              </div>
              <p className="text-xs text-gray-500">
                {totalAnalyses > 0 ? "/100 puan" : "Veri bekleniyor"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Acil Aksiyonlar
              </CardTitle>
              <Zap className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUrgent}</div>
              <p className="text-xs text-gray-500">
                {totalUrgent === 0
                  ? "Bekleyen aksiyon yok"
                  : "Bu hafta yapılmalı"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Kalan Kredi
              </CardTitle>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{creditsRemaining}</div>
              <p className="text-xs text-gray-500">
                {creditsTotal} kredi/ay
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Score History */}
        <ScoreHistory />

        {/* Recent Analyses */}
        <Card>
          <CardHeader>
            <CardTitle>Son Analizler</CardTitle>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Henüz analiz yapılmadı. İlk analizinizi başlatın!
                </p>
                <Link href="/dashboard/new">
                  <Button variant="outline" className="mt-4 gap-2">
                    <Upload className="w-4 h-4" />
                    Excel Yükle
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.slice(0, 5).map((a) => (
                  <Link
                    key={a.id}
                    href={`/dashboard/analysis/${a.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                          a.result.overallReport.overallScore >= 60
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {a.result.overallReport.overallScore}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{a.clientName}</p>
                        <p className="text-xs text-gray-400">
                          {a.result.campaignAnalyses.length} kampanya &middot;{" "}
                          {new Date(a.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          a.platform === "META"
                            ? "bg-blue-100 text-blue-700"
                            : a.platform === "GOOGLE"
                              ? "bg-red-100 text-red-700"
                              : "bg-purple-100 text-purple-700"
                        }
                      >
                        {a.platform === "BOTH"
                          ? "Meta + Google"
                          : a.platform === "META"
                            ? "Meta"
                            : "Google"}
                      </Badge>
                      <ExternalLink className="w-4 h-4 text-gray-300" />
                    </div>
                  </Link>
                ))}
                {analyses.length > 5 && (
                  <Link href="/dashboard/history">
                    <Button variant="ghost" className="w-full text-sm">
                      Tüm analizleri gör ({analyses.length})
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges + Events */}
        <div className="grid md:grid-cols-2 gap-6">
          <BadgeWall />
          <UpcomingEvents limit={2} />
        </div>
      </div>
    </>
  );
}
