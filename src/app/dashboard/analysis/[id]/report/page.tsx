"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { analysisStore, type SavedAnalysis } from "@/store/analysisStore";
import { ReportCover } from "@/components/reports/sections/ReportCover";
import { ReportSectionHeader } from "@/components/reports/sections/ReportSectionHeader";
import { ReportOverview } from "@/components/reports/sections/ReportOverview";
import { ReportMetaOverview } from "@/components/reports/sections/ReportMetaOverview";
import { ReportCampaignTable } from "@/components/reports/sections/ReportCampaignTable";
import { ReportScoreChart } from "@/components/reports/sections/ReportScoreChart";
import { ReportObjectiveBreakdown } from "@/components/reports/sections/ReportObjectiveBreakdown";
import { ReportActionPlan } from "@/components/reports/sections/ReportActionPlan";
import { ReportNewCampaigns } from "@/components/reports/sections/ReportNewCampaigns";
import { ReportGA4Overview } from "@/components/reports/sections/ReportGA4Overview";
import { ReportGA4Demographics } from "@/components/reports/sections/ReportGA4Demographics";
import { settingsStore } from "@/store/settingsStore";
import type { GA4ReportData } from "@/lib/ga4/client";
import {
  Download,
  Loader2,
  AlertCircle,
  BarChart3,
  Target,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [ga4Data, setGa4Data] = useState<GA4ReportData | null>(null);
  const [ga4Loading, setGa4Loading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = analysisStore.getById(id);
    setAnalysis(data || null);
    setLoading(false);

    // Try to load GA4 data if connected
    const settings = settingsStore.get();
    if (settings.ga4RefreshToken && settings.ga4PropertyId) {
      setGa4Loading(true);
      fetch("/api/ga4/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: settings.ga4AccessToken,
          refreshToken: settings.ga4RefreshToken,
          propertyId: settings.ga4PropertyId,
          startDate: "30daysAgo",
          endDate: "today",
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            setGa4Data(res.report);
            if (res.newAccessToken) {
              settingsStore.set({ ga4AccessToken: res.newAccessToken });
            }
          }
        })
        .catch(console.error)
        .finally(() => setGa4Loading(false));
    }
  }, [id]);

  const handlePDFExport = async () => {
    if (!reportRef.current) return;
    setExporting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const reportEl = reportRef.current;
      const sections = reportEl.querySelectorAll<HTMLElement>(".report-page-section");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 8;
      const contentWidth = pdfWidth - margin * 2;

      let firstPage = true;

      for (const section of sections) {
        const canvas = await html2canvas(section, {
          scale: 2,
          backgroundColor: "#111827",
          useCORS: true,
          logging: false,
        });

        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (!firstPage) {
          pdf.addPage();
        }

        // If image is taller than a page, scale it to fit
        if (imgHeight > pdfHeight - margin * 2) {
          const scaledWidth = ((pdfHeight - margin * 2) * canvas.width) / canvas.height;
          const xOffset = (pdfWidth - scaledWidth) / 2;
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", xOffset, margin, scaledWidth, pdfHeight - margin * 2);
        } else {
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin, imgWidth, imgHeight);
        }

        firstPage = false;
      }

      // Footer on each page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(120, 120, 120);
        pdf.text(
          `AdLens AI | ${analysis?.clientName || ""} | Sayfa ${i}/${totalPages}`,
          pdfWidth / 2,
          pdfHeight - 5,
          { align: "center" }
        );
      }

      const filename = `AdLens-Rapor-${(analysis?.clientName || "").replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("PDF olusturulurken bir hata olustu.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Yukleniyor..." />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

  if (!analysis) {
    return (
      <>
        <Header title="Analiz Bulunamadi" />
        <div className="p-6 text-center py-20">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">Bu analiz bulunamadi veya silinmis olabilir.</p>
        </div>
      </>
    );
  }

  const { result, clientName, platform } = analysis;
  const { overallReport, actionPlan, campaignAnalyses, newCampaignSuggestions } = result;

  const metaCampaigns = campaignAnalyses.filter(
    (c) => !c.campaignName.toLowerCase().includes("google")
  );
  const googleCampaigns = campaignAnalyses.filter(
    (c) => c.campaignName.toLowerCase().includes("google")
  );

  const hasMeta = platform === "META" || platform === "BOTH" || metaCampaigns.length > 0;
  const hasGoogle = platform === "GOOGLE" || platform === "BOTH" || googleCampaigns.length > 0;

  return (
    <>
      <Header title={`${clientName} — Performans Raporu`} />

      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <Link href={`/dashboard/analysis/${id}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Analize Don
        </Link>
        <Button
          onClick={handlePDFExport}
          disabled={exporting}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {exporting ? "Olusturuluyor..." : "PDF Indir"}
        </Button>
      </div>

      {/* Report Content */}
      <div
        ref={reportRef}
        className="bg-gray-950 min-h-screen"
      >
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

          {/* Section 1: Cover */}
          <div className="report-page-section">
            <ReportCover
              clientName={clientName}
              dateRange={analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString("tr-TR", { month: "long", year: "numeric" }) : undefined}
            />
          </div>

          {/* Section 2: Overall Overview */}
          <div className="report-page-section">
            <ReportSectionHeader
              title="VERI ANALIZI"
              subtitle="Tum platform ve kampanyalarin genel degerlendirmesi"
              icon={<BarChart3 className="w-6 h-6" />}
            />
          </div>

          {/* Section 3: KPI Overview */}
          <div className="report-page-section">
            <ReportOverview result={result} clientName={clientName} />
          </div>

          {/* Section 4: Objective Breakdown */}
          {overallReport.objectiveBreakdown && (
            <div className="report-page-section">
              <ReportObjectiveBreakdown breakdown={overallReport.objectiveBreakdown} />
            </div>
          )}

          {/* GA4 Sections */}
          {ga4Loading && (
            <div className="report-page-section flex items-center justify-center py-12 bg-gray-800/40 rounded-xl">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400 mr-3" />
              <span className="text-gray-400">GA4 verileri yukleniyor...</span>
            </div>
          )}

          {ga4Data && (
            <>
              <div className="report-page-section">
                <ReportGA4Overview data={ga4Data} />
              </div>
              <div className="report-page-section">
                <ReportGA4Demographics data={ga4Data} />
              </div>
            </>
          )}

          {/* Section 5: Score Chart */}
          <div className="report-page-section">
            <ReportScoreChart
              campaigns={campaignAnalyses}
              title="Kampanya Skorlari"
            />
          </div>

          {/* Section 6-8: Meta Ads */}
          {hasMeta && (
            <>
              <div className="report-page-section">
                <ReportMetaOverview campaigns={platform === "META" ? campaignAnalyses : metaCampaigns} />
              </div>
              <div className="report-page-section">
                <ReportCampaignTable
                  campaigns={platform === "META" ? campaignAnalyses : metaCampaigns}
                  title="Meta Ads — Kampanya Performansi"
                  platform="META"
                />
              </div>
            </>
          )}

          {/* Section 9-10: Google Ads */}
          {hasGoogle && googleCampaigns.length > 0 && (
            <>
              <div className="report-page-section">
                <ReportSectionHeader
                  title="GOOGLE ADS"
                  subtitle={`${googleCampaigns.length} kampanya`}
                  icon={
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  }
                />
              </div>
              <div className="report-page-section">
                <ReportCampaignTable
                  campaigns={googleCampaigns}
                  title="Google Ads — Kampanya Performansi"
                  platform="GOOGLE"
                />
              </div>
            </>
          )}

          {/* Section 11: Action Plan */}
          <div className="report-page-section">
            <ReportSectionHeader
              title="AKSIYON PLANI"
              subtitle="Onceliklendirilmis aksiyonlar ve butce tavsiyeleri"
              icon={<Target className="w-6 h-6" />}
            />
          </div>
          <div className="report-page-section">
            <ReportActionPlan actionPlan={actionPlan} />
          </div>

          {/* Section 12: New Campaign Suggestions */}
          {newCampaignSuggestions.length > 0 && (
            <div className="report-page-section">
              <ReportNewCampaigns suggestions={newCampaignSuggestions} />
            </div>
          )}

          {/* Footer */}
          <div className="report-page-section text-center py-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              Bu rapor AdLens AI tarafindan otomatik olarak olusturulmustur.
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
