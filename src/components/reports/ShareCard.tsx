"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Share2, Download, Copy, Check } from "lucide-react";
import type { FullAnalysisResult } from "@/types/analysis";

interface Props {
  result: FullAnalysisResult;
  clientName: string;
}

export function ShareCard({ result, clientName }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const { overallReport, campaignAnalyses, actionPlan } = result;
  const score = overallReport.overallScore;

  const scoreColor =
    score >= 80
      ? "#3b82f6"
      : score >= 60
        ? "#22c55e"
        : score >= 40
          ? "#f59e0b"
          : "#ef4444";

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      // html2canvas dinamik import
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        width: 540,
        height: 540,
      });
      const link = document.createElement("a");
      link.download = `adlens-${clientName.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      toast.error("Görsel oluşturulamadı");
    }
  };

  const handleCopyText = () => {
    const text = `${clientName} — Reklam Performans Ozeti

Skor: ${score}/100
Kampanya: ${campaignAnalyses.length} adet
Acil Aksiyon: ${actionPlan.urgentActions.length}
En Iyi: ${overallReport.topPerformer.campaignName}

AdLens AI ile analiz edildi
adlens.ai`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Metin panoya kopyalandı");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
        <Share2 className="w-4 h-4" />
        Paylas
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raporu Paylas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Preview card */}
          <div
            ref={cardRef}
            className="w-[270px] mx-auto p-6 bg-white rounded-xl border-2"
            style={{ borderColor: scoreColor }}
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-[8px]">AL</span>
                </div>
                <span className="font-semibold text-sm">AdLens AI</span>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Reklam Performansi</p>
                <p className="font-bold text-lg">{clientName}</p>
              </div>

              <div
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: `${scoreColor}15` }}
              >
                <span
                  className="text-3xl font-bold"
                  style={{ color: scoreColor }}
                >
                  {score}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-400">Kampanya</p>
                  <p className="font-bold">{campaignAnalyses.length}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-400">Acil Aksiyon</p>
                  <p className="font-bold">{actionPlan.urgentActions.length}</p>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                adlens.ai
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              className="flex-1 gap-2"
              size="sm"
            >
              <Download className="w-4 h-4" />
              PNG Indir
            </Button>
            <Button
              onClick={handleCopyText}
              variant="outline"
              className="flex-1 gap-2"
              size="sm"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Kopyalandi" : "Metin Kopyala"}
            </Button>
          </div>

          <p className="text-[10px] text-gray-400 text-center">
            Kampanya adlari ve detay metrikleri paylasilmaz, sadece ozet skor
            gosterilir.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
