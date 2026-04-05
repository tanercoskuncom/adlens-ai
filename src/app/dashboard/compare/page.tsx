"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analysisStore, type SavedAnalysis } from "@/store/analysisStore";
import {
  GitCompareArrows,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Upload,
} from "lucide-react";
import Link from "next/link";

function DiffValue({ label, prev, curr, suffix, inverse }: {
  label: string;
  prev: number;
  curr: number;
  suffix?: string;
  inverse?: boolean;
}) {
  const diff = curr - prev;
  const pct = prev !== 0 ? ((diff / prev) * 100).toFixed(1) : "—";
  const isPositive = inverse ? diff < 0 : diff > 0;

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          {prev.toFixed(2)}{suffix}
        </span>
        <ArrowRight className="w-3 h-3 text-gray-300" />
        <span className="text-sm font-bold">{curr.toFixed(2)}{suffix}</span>
        {pct !== "—" && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(Number(pct))}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");

  useEffect(() => {
    setAnalyses(analysisStore.getAll());
  }, []);

  const analysisA = analyses.find((a) => a.id === selectedA);
  const analysisB = analyses.find((a) => a.id === selectedB);
  const canCompare = analysisA && analysisB && selectedA !== selectedB;

  if (analyses.length < 2) {
    return (
      <>
        <Header title="Dönem Karşılaştırması" />
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <GitCompareArrows className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-400 mb-4">
                Karşılaştırma yapabilmek için en az 2 analiz gerekiyor.
              </p>
              <Link href="/dashboard/new">
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Yeni Analiz Başlat
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dönem Karşılaştırması" />
      <div className="p-6 space-y-6">
        {/* Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-500">
                Önceki Dönem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyses.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedA(a.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedA === a.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {a.clientName}
                      </span>
                      <Badge variant="outline">
                        {a.result.overallReport.overallScore}/100
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(a.createdAt).toLocaleDateString("tr-TR")} &middot;{" "}
                      {a.result.campaignAnalyses.length} kampanya
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-500">
                Şimdiki Dönem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyses.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedB(a.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedB === a.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {a.clientName}
                      </span>
                      <Badge variant="outline">
                        {a.result.overallReport.overallScore}/100
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(a.createdAt).toLocaleDateString("tr-TR")} &middot;{" "}
                      {a.result.campaignAnalyses.length} kampanya
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Results */}
        {canCompare && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompareArrows className="w-5 h-5" />
                Karşılaştırma Sonuçları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score comparison */}
              <div className="flex items-center justify-center gap-8 py-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Önceki</p>
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                      analysisA.result.overallReport.overallScore >= 60
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {analysisA.result.overallReport.overallScore}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {analysisA.clientName}
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-300" />
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Şimdiki</p>
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                      analysisB.result.overallReport.overallScore >= 60
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {analysisB.result.overallReport.overallScore}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {analysisB.clientName}
                  </p>
                </div>
              </div>

              {/* Metric diffs */}
              <div className="grid md:grid-cols-2 gap-3">
                <DiffValue
                  label="Genel Skor"
                  prev={analysisA.result.overallReport.overallScore}
                  curr={analysisB.result.overallReport.overallScore}
                />
                <DiffValue
                  label="Kampanya Sayısı"
                  prev={analysisA.result.campaignAnalyses.length}
                  curr={analysisB.result.campaignAnalyses.length}
                />
                <DiffValue
                  label="Acil Aksiyonlar"
                  prev={analysisA.result.actionPlan.urgentActions.length}
                  curr={analysisB.result.actionPlan.urgentActions.length}
                  inverse
                />
                <DiffValue
                  label="Durdurulacak Kampanya"
                  prev={analysisA.result.actionPlan.campaignsToStop.length}
                  curr={analysisB.result.actionPlan.campaignsToStop.length}
                  inverse
                />
              </div>

              {/* Health comparison */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <Badge
                  className={
                    analysisA.result.overallReport.accountHealth === "good" ||
                    analysisA.result.overallReport.accountHealth === "excellent"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }
                >
                  {analysisA.result.overallReport.accountHealth}
                </Badge>
                <ArrowRight className="w-4 h-4 text-gray-300" />
                <Badge
                  className={
                    analysisB.result.overallReport.accountHealth === "good" ||
                    analysisB.result.overallReport.accountHealth === "excellent"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }
                >
                  {analysisB.result.overallReport.accountHealth}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
