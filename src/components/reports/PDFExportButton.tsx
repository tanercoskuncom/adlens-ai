"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generateAnalysisPDF } from "@/lib/pdf/generator";
import type { FullAnalysisResult } from "@/types/analysis";

interface PDFExportButtonProps {
  result: FullAnalysisResult;
  clientName: string;
  dateRange?: string;
  mode?: "technical" | "client";
}

export function PDFExportButton({
  result,
  clientName,
  dateRange,
  mode = "technical",
}: PDFExportButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    setGenerating(true);
    try {
      const doc = generateAnalysisPDF(result, {
        clientName,
        dateRange,
        mode,
      });
      const filename = `AdLens-${clientName.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("PDF oluşturulurken bir hata oluştu.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={generating}
      className="gap-2"
    >
      {generating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {mode === "client" ? "Müşteri Raporu" : "PDF İndir"}
    </Button>
  );
}
