"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FileDropzone, type UploadedFile } from "@/components/upload/FileDropzone";
import { GDPRConsent } from "@/components/upload/GDPRConsent";
import { analysisStore } from "@/store/analysisStore";
import { creditStore } from "@/store/creditStore";
import { toast } from "sonner";
import { Upload, Settings2, AlertTriangle } from "lucide-react";

const TEMPLATES = [
  { value: "ecommerce", label: "E-ticaret" },
  { value: "lead_gen", label: "Lead Generation" },
  { value: "brand", label: "Marka Bilinirliği" },
  { value: "app", label: "Uygulama" },
  { value: "b2b", label: "B2B" },
  { value: "general", label: "Genel" },
];

type AnalysisStep =
  | "upload"
  | "config"
  | "analyzing"
  | "done"
  | "error";

export default function NewAnalysisPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [gdprConfirmed, setGdprConfirmed] = useState(false);
  const [clientName, setClientName] = useState("");
  const [template, setTemplate] = useState("general");
  const [step, setStep] = useState<AnalysisStep>("upload");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [error, setError] = useState("");

  const readyFiles = files.filter((f) => f.status === "ready");
  const canProceed = readyFiles.length > 0 && gdprConfirmed;

  // Kredi kontrolü (tahmini kampanya sayısı — gerçek sayı API'den gelecek)
  const estimatedCampaigns = readyFiles.length * 5; // dosya başına ~5 kampanya tahmini
  const creditCheck = creditStore.canAnalyze(estimatedCampaigns);

  const startAnalysis = async () => {
    if (!canProceed) return;

    if (!creditCheck.allowed) {
      setError(creditCheck.reason || "Yeterli kredi yok.");
      setStep("error");
      return;
    }

    setStep("analyzing");
    setProgress(0);
    setError("");

    try {
      const steps = [
        { pct: 10, msg: "Dosyalar okunuyor..." },
        { pct: 25, msg: "Veriler normalize ediliyor..." },
        { pct: 40, msg: "Kampanyalar analiz ediliyor..." },
        { pct: 70, msg: "Genel rapor oluşturuluyor..." },
        { pct: 85, msg: "Aksiyon planı hazırlanıyor..." },
        { pct: 95, msg: "Yeni kampanya önerileri oluşturuluyor..." },
      ];

      for (const s of steps.slice(0, 2)) {
        setProgress(s.pct);
        setProgressMessage(s.msg);
        await new Promise((r) => setTimeout(r, 500));
      }

      for (const { file } of readyFiles) {
        setProgress(40);
        setProgressMessage("Kampanyalar AI ile analiz ediliyor...");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("language", "tr");
        formData.append("clientName", clientName || "Müşteri");
        formData.append("template", template);

        const res = await fetch("/api/analysis", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Analiz başarısız");
        }

        for (const s of steps.slice(2)) {
          setProgress(s.pct);
          setProgressMessage(s.msg);
          await new Promise((r) => setTimeout(r, 300));
        }

        // Kredi harca
        creditStore.spend(data.data.campaignAnalyses?.length || estimatedCampaigns);

        // Sonucu localStorage'a kaydet
        const platforms = readyFiles.map((f) => f.platform);
        const platform = platforms.includes("META") && platforms.includes("GOOGLE")
          ? "BOTH" as const
          : platforms[0] === "META" ? "META" as const : "GOOGLE" as const;

        const analysisId = analysisStore.add({
          clientName: clientName || "Müşteri",
          platform,
          template,
          language: "tr",
          result: data.data,
          fileName: file.name,
        });

        setProgress(100);
        setProgressMessage("Analiz tamamlandı! Yönlendiriliyorsunuz...");
        setStep("done");
        toast.success("Analiz tamamlandı!", {
          description: `${clientName || "Müşteri"} raporu hazır.`,
        });

        setTimeout(() => {
          router.push(`/dashboard/analysis/${analysisId}`);
        }, 1000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setStep("error");
      toast.error("Analiz başarısız", { description: message });
    }
  };

  return (
    <>
      <Header title="Yeni Analiz" />
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Step: Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              1. Excel Dosyası Yükle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileDropzone files={files} onFilesChange={setFiles} />
          </CardContent>
        </Card>

        {/* Step: Config */}
        {readyFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                2. Analiz Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Müşteri Adı (opsiyonel)</Label>
                <Input
                  id="clientName"
                  placeholder="Örn: ABC Şirketi"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Sektör Şablonu</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTemplate(t.value)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        template === t.value
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KVKK */}
        <GDPRConsent onConfirm={setGdprConfirmed} />

        {/* Progress */}
        {(step === "analyzing" || step === "done") && (
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{progressMessage}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setStep("upload")}
            >
              Tekrar Dene
            </Button>
          </div>
        )}

        {/* Credit Warning */}
        {readyFiles.length > 0 && !creditCheck.allowed && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Yetersiz Kredi
              </p>
              <p className="text-xs text-amber-600 mt-1">
                {creditCheck.reason}
              </p>
            </div>
          </div>
        )}

        {/* Start Button */}
        {step !== "analyzing" && step !== "done" && (
          <div className="space-y-2">
            <Button
              onClick={startAnalysis}
              disabled={!canProceed || !creditCheck.allowed}
              className="w-full gap-2"
              size="lg"
            >
              <Upload className="w-4 h-4" />
              Analizi Başlat ({readyFiles.length} dosya)
            </Button>
            {readyFiles.length > 0 && creditCheck.allowed && (
              <p className="text-xs text-center text-gray-400">
                Bu analiz {creditCheck.cost} kredi harcayacak &middot;{" "}
                {creditStore.getRemaining()} kredi kaldı
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
