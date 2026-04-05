import jsPDF from "jspdf";
import type { FullAnalysisResult } from "@/types/analysis";

interface PDFOptions {
  clientName: string;
  dateRange?: string;
  language?: "tr" | "en";
  mode?: "technical" | "client";
}

export function generateAnalysisPDF(
  result: FullAnalysisResult,
  options: PDFOptions
): jsPDF {
  const { clientName, dateRange, language = "tr", mode = "technical" } = options;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const addPage = () => {
    doc.addPage();
    y = 20;
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > 270) addPage();
  };

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("AdLens AI", 14, 18);

  doc.setFontSize(10);
  doc.text(
    language === "tr" ? "Reklam Analiz Raporu" : "Ad Analysis Report",
    14,
    26
  );

  doc.setFontSize(9);
  doc.text(`${clientName}${dateRange ? ` | ${dateRange}` : ""}`, 14, 34);
  doc.text(new Date().toLocaleDateString("tr-TR"), pageWidth - 14, 34, {
    align: "right",
  });

  y = 55;
  doc.setTextColor(0, 0, 0);

  // Overall Score
  doc.setFontSize(14);
  doc.text(
    language === "tr" ? "Genel Performans" : "Overall Performance",
    14,
    y
  );
  y += 8;

  doc.setFontSize(28);
  const scoreColor = result.overallReport.overallScore >= 60 ? [34, 197, 94] : [239, 68, 68];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${result.overallReport.overallScore}/100`, 14, y + 2);
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(9);
  y += 14;
  const summaryLines = doc.splitTextToSize(
    result.overallReport.overallSummary,
    pageWidth - 28
  );
  doc.text(summaryLines, 14, y);
  y += summaryLines.length * 5 + 8;

  // Key Insights
  checkPageBreak(40);
  doc.setFontSize(12);
  doc.text(language === "tr" ? "Temel İçgörüler" : "Key Insights", 14, y);
  y += 7;

  doc.setFontSize(9);
  for (const insight of result.overallReport.keyInsights) {
    checkPageBreak(8);
    const lines = doc.splitTextToSize(`• ${insight}`, pageWidth - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 2;
  }
  y += 5;

  // Campaign Summary Table
  checkPageBreak(30);
  doc.setFontSize(12);
  doc.text(
    language === "tr" ? "Kampanya Skorları" : "Campaign Scores",
    14,
    y
  );
  y += 8;

  doc.setFontSize(8);
  doc.setFillColor(240, 240, 240);
  doc.rect(14, y - 4, pageWidth - 28, 7, "F");
  doc.text("Kampanya", 16, y);
  doc.text("Skor", 120, y);
  doc.text("Durum", 140, y);
  y += 7;

  for (const ca of result.campaignAnalyses) {
    checkPageBreak(7);
    doc.text(ca.campaignName.substring(0, 45), 16, y);
    doc.text(String(ca.score), 122, y);
    doc.text(ca.status, 140, y);
    y += 6;
  }
  y += 8;

  // Actions (technical mode only or simplified for client)
  if (mode === "technical") {
    // Urgent Actions
    if (result.actionPlan.urgentActions.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38);
      doc.text(language === "tr" ? "Acil Aksiyonlar" : "Urgent Actions", 14, y);
      doc.setTextColor(0, 0, 0);
      y += 7;

      doc.setFontSize(9);
      for (const action of result.actionPlan.urgentActions) {
        checkPageBreak(12);
        const lines = doc.splitTextToSize(
          `• ${action.title}: ${action.description}`,
          pageWidth - 28
        );
        doc.text(lines, 14, y);
        y += lines.length * 5 + 3;
      }
      y += 5;
    }

    // Monthly Actions
    if (result.actionPlan.monthlyActions.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.text(
        language === "tr" ? "Bu Ay Yapılacaklar" : "Monthly Actions",
        14,
        y
      );
      y += 7;

      doc.setFontSize(9);
      for (const action of result.actionPlan.monthlyActions) {
        checkPageBreak(12);
        const lines = doc.splitTextToSize(
          `• ${action.title}: ${action.description}`,
          pageWidth - 28
        );
        doc.text(lines, 14, y);
        y += lines.length * 5 + 3;
      }
      y += 5;
    }
  } else {
    // Client mode - simplified
    checkPageBreak(40);
    doc.setFontSize(12);
    doc.text(
      language === "tr" ? "Yapılanlar ve Sonraki Adımlar" : "Actions Taken & Next Steps",
      14,
      y
    );
    y += 8;

    doc.setFontSize(9);
    const clientSummary = [
      ...result.actionPlan.urgentActions.map((a) => a.title),
      ...result.actionPlan.monthlyActions.slice(0, 3).map((a) => a.title),
    ];
    for (const item of clientSummary) {
      checkPageBreak(8);
      doc.text(`• ${item}`, 14, y);
      y += 6;
    }
  }

  // New Campaign Suggestions
  if (result.newCampaignSuggestions.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.text(
      language === "tr" ? "Yeni Kampanya Önerileri" : "New Campaign Suggestions",
      14,
      y
    );
    y += 7;

    doc.setFontSize(9);
    for (const s of result.newCampaignSuggestions) {
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.text(`${s.title} (${s.platform})`, 14, y);
      y += 5;

      doc.setFontSize(9);
      const rationale = doc.splitTextToSize(s.rationale, pageWidth - 28);
      doc.text(rationale, 14, y);
      y += rationale.length * 5 + 5;
    }
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `AdLens AI | ${clientName} | Sayfa ${i}/${totalPages}`,
      pageWidth / 2,
      290,
      { align: "center" }
    );
  }

  return doc;
}
