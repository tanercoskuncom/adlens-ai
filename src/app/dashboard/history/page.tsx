"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analysisStore, type SavedAnalysis } from "@/store/analysisStore";
import { toast } from "sonner";
import {
  History,
  Trash2,
  ExternalLink,
  Upload,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

type PlatformFilter = "ALL" | "META" | "GOOGLE" | "BOTH";
type ScoreFilter = "all" | "high" | "mid" | "low";

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("ALL");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setAnalyses(analysisStore.getAll());
  }, []);

  const filteredAnalyses = useMemo(() => {
    return analyses.filter((a) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const match =
          a.clientName.toLowerCase().includes(q) ||
          a.fileName.toLowerCase().includes(q) ||
          (a.result.campaignAnalyses ?? []).some((c) =>
            (c.campaignName ?? "").toLowerCase().includes(q)
          );
        if (!match) return false;
      }

      // Platform
      if (platformFilter !== "ALL" && a.platform !== platformFilter) {
        return false;
      }

      // Score
      const score = a.result.overallReport.overallScore;
      if (scoreFilter === "high" && score < 70) return false;
      if (scoreFilter === "mid" && (score < 40 || score >= 70)) return false;
      if (scoreFilter === "low" && score >= 40) return false;

      return true;
    });
  }, [analyses, search, platformFilter, scoreFilter]);

  const handleDelete = (id: string) => {
    if (!confirm("Bu analizi silmek istediginize emin misiniz?")) return;
    analysisStore.remove(id);
    setAnalyses(analysisStore.getAll());
    toast.success("Analiz silindi");
  };

  const handleClearAll = () => {
    if (
      !confirm(
        "Tum analizleri silmek istediginize emin misiniz? Bu islem geri alinamaz."
      )
    )
      return;
    analysisStore.clear();
    setAnalyses([]);
    toast.success("Tüm analizler silindi");
  };

  const hasActiveFilters =
    search !== "" || platformFilter !== "ALL" || scoreFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setPlatformFilter("ALL");
    setScoreFilter("all");
  };

  const platformBadge: Record<string, { label: string; className: string }> = {
    META: { label: "Meta Ads", className: "bg-blue-100 text-blue-700" },
    GOOGLE: { label: "Google Ads", className: "bg-red-100 text-red-700" },
    BOTH: {
      label: "Meta + Google",
      className: "bg-purple-100 text-purple-700",
    },
  };

  const healthBadge: Record<string, { label: string; className: string }> = {
    critical: { label: "Kritik", className: "bg-red-100 text-red-700" },
    needs_improvement: {
      label: "Gelistirilmeli",
      className: "bg-amber-100 text-amber-700",
    },
    good: { label: "Iyi", className: "bg-green-100 text-green-700" },
    excellent: { label: "Mukemmel", className: "bg-blue-100 text-blue-700" },
  };

  return (
    <>
      <Header title="Analiz Gecmisi" />
      <div className="p-6 space-y-4">
        {analyses.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12 text-gray-400">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm mb-4">
                  Henuz analiz gecmisi bulunmuyor.
                </p>
                <Link href="/dashboard/new">
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Ilk Analizini Baslat
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Header + Actions */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {analyses.length} Analiz
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Tumunu Sil
                </Button>
                <Link href="/dashboard/new">
                  <Button size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Yeni Analiz
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search + Filter Toggle */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Musteri, dosya veya kampanya adi ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1.5"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtre
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </Button>
            </div>

            {/* Filter Bar */}
            {showFilters && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Platform</p>
                  <div className="flex gap-1">
                    {(
                      [
                        { key: "ALL", label: "Tumu" },
                        { key: "META", label: "Meta" },
                        { key: "GOOGLE", label: "Google" },
                        { key: "BOTH", label: "Her Ikisi" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setPlatformFilter(opt.key)}
                        className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                          platformFilter === opt.key
                            ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-px h-10 bg-gray-200" />

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">
                    Skor Araligi
                  </p>
                  <div className="flex gap-1">
                    {(
                      [
                        { key: "all", label: "Tumu" },
                        { key: "high", label: "70+" },
                        { key: "mid", label: "40-69" },
                        { key: "low", label: "0-39" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setScoreFilter(opt.key)}
                        className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                          scoreFilter === opt.key
                            ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <>
                    <div className="w-px h-10 bg-gray-200" />
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                      Temizle
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Results Count */}
            {hasActiveFilters && (
              <p className="text-xs text-gray-500">
                {filteredAnalyses.length} / {analyses.length} analiz
                gosteriliyor
              </p>
            )}

            {/* Analysis List */}
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Filtrelere uygun analiz bulunamadi.</p>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 text-sm mt-2 hover:underline"
                >
                  Filtreleri temizle
                </button>
              </div>
            ) : (
              filteredAnalyses.map((a) => {
                const p =
                  platformBadge[a.platform] || platformBadge.META;
                const h =
                  healthBadge[a.result.overallReport.accountHealth] ||
                  healthBadge.good;
                const score = a.result.overallReport.overallScore;
                const scoreColor =
                  score >= 70
                    ? "text-green-700 bg-green-50"
                    : score >= 40
                      ? "text-amber-700 bg-amber-50"
                      : "text-red-700 bg-red-50";

                return (
                  <Card
                    key={a.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${scoreColor}`}
                          >
                            {score}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {a.clientName}
                              </h3>
                              <Badge className={p.className}>{p.label}</Badge>
                              <Badge className={h.className}>{h.label}</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>
                                {a.result.campaignAnalyses.length} kampanya
                              </span>
                              <span>{a.fileName}</span>
                              <span>
                                {new Date(a.createdAt).toLocaleDateString(
                                  "tr-TR",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/analysis/${a.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Detay
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(a.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </>
        )}
      </div>
    </>
  );
}
