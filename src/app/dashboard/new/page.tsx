"use client";

import { useState, useEffect } from "react";
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
import { settingsStore } from "@/store/settingsStore";
import { toast } from "sonner";
import {
  Upload,
  Settings2,
  AlertTriangle,
  Plug,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
} from "lucide-react";

const TEMPLATES = [
  { value: "ecommerce", label: "E-ticaret" },
  { value: "lead_gen", label: "Lead Generation" },
  { value: "brand", label: "Marka Bilinirliği" },
  { value: "app", label: "Uygulama" },
  { value: "b2b", label: "B2B" },
  { value: "general", label: "Genel" },
];

type AnalysisStep = "upload" | "config" | "analyzing" | "done" | "error";
type SourceMode = "excel" | "meta";

interface MetaAccount {
  id: string;
  name: string;
  currency: string;
  business_name?: string;
}

export default function NewAnalysisPage() {
  const router = useRouter();

  // Genel state
  const [sourceMode, setSourceMode] = useState<SourceMode>("excel");
  const [clientName, setClientName] = useState("");
  const [template, setTemplate] = useState("general");
  const [step, setStep] = useState<AnalysisStep>("upload");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [error, setError] = useState("");
  const [gdprConfirmed, setGdprConfirmed] = useState(false);

  // Excel state
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // Meta API state
  const [metaToken, setMetaToken] = useState("");
  const [metaAccounts, setMetaAccounts] = useState<MetaAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [metaConnected, setMetaConnected] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaUser, setMetaUser] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    until: new Date().toISOString().split("T")[0],
  });
  const [activeOnly, setActiveOnly] = useState(true);

  // Kayıtlı Meta token varsa otomatik bağlan
  useEffect(() => {
    const saved = settingsStore.get();
    if (saved.metaToken) {
      setMetaToken(saved.metaToken);
      setMetaUser(saved.metaUserName);
      // Hesapları otomatik yükle
      fetch("/api/meta/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: saved.metaToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMetaAccounts(data.accounts);
            setMetaConnected(true);
            setSourceMode("meta");
          }
        })
        .catch(() => {
          // Token süresi dolmuş olabilir
        });
    }
  }, []);

  const readyFiles = files.filter((f) => f.status === "ready");
  const canProceedExcel = readyFiles.length > 0 && gdprConfirmed;
  const canProceedMeta = metaConnected && selectedAccount && gdprConfirmed;
  const canProceed = sourceMode === "excel" ? canProceedExcel : canProceedMeta;

  const estimatedCampaigns = sourceMode === "excel" ? readyFiles.length * 5 : 10;
  const creditCheck = creditStore.canAnalyze(estimatedCampaigns);

  // Meta hesap bağla
  const connectMeta = async () => {
    if (!metaToken.trim()) {
      toast.error("Access token giriniz");
      return;
    }

    setMetaLoading(true);
    try {
      const res = await fetch("/api/meta/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: metaToken }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Bağlantı başarısız");
      }

      setMetaAccounts(data.accounts);
      setMetaUser(data.user?.name || "");
      setMetaConnected(true);
      // Token'ı kaydet
      settingsStore.set({ metaToken, metaUserName: data.user?.name || "" });
      toast.success("Meta hesabı bağlandı!", {
        description: `${data.accounts.length} reklam hesabı bulundu.`,
      });
    } catch (err) {
      toast.error("Meta bağlantı hatası", {
        description: err instanceof Error ? err.message : "Token geçersiz olabilir",
      });
    } finally {
      setMetaLoading(false);
    }
  };

  // Excel analizi
  const startExcelAnalysis = async () => {
    setStep("analyzing");
    setProgress(0);

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

      const res = await fetch("/api/analysis", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Analiz başarısız");
      }

      for (const s of steps.slice(2)) {
        setProgress(s.pct);
        setProgressMessage(s.msg);
        await new Promise((r) => setTimeout(r, 300));
      }

      creditStore.spend(data.data.campaignAnalyses?.length || estimatedCampaigns);

      const platforms = readyFiles.map((f) => f.platform);
      const platform =
        platforms.includes("META") && platforms.includes("GOOGLE")
          ? ("BOTH" as const)
          : platforms[0] === "META"
            ? ("META" as const)
            : ("GOOGLE" as const);

      const analysisId = analysisStore.add({
        clientName: clientName || "Müşteri",
        platform,
        template,
        language: "tr",
        result: data.data,
        fileName: file.name,
      });

      return analysisId;
    }
  };

  // Meta API analizi
  const startMetaAnalysis = async () => {
    setStep("analyzing");
    setProgress(0);

    setProgress(10);
    setProgressMessage("Meta API'den veriler çekiliyor...");
    await new Promise((r) => setTimeout(r, 300));

    setProgress(30);
    setProgressMessage("Kampanya metrikleri alınıyor...");

    const res = await fetch("/api/meta/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: metaToken,
        accountId: selectedAccount,
        since: dateRange.since,
        until: dateRange.until,
        clientName: clientName || "Müşteri",
        language: "tr",
        template,
        activeOnly,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Meta analizi başarısız");
    }

    setProgress(60);
    setProgressMessage("AI analizi tamamlanıyor...");
    await new Promise((r) => setTimeout(r, 300));

    setProgress(85);
    setProgressMessage("Rapor oluşturuluyor...");
    await new Promise((r) => setTimeout(r, 300));

    creditStore.spend(data.data.campaignAnalyses?.length || estimatedCampaigns);

    const accountName = metaAccounts.find((a) => a.id === selectedAccount)?.name || "Meta";

    const analysisId = analysisStore.add({
      clientName: clientName || accountName,
      platform: "META",
      template,
      language: "tr",
      result: data.data,
      fileName: `Meta API — ${accountName}`,
    });

    return analysisId;
  };

  const startAnalysis = async () => {
    if (!canProceed || !creditCheck.allowed) return;

    setError("");

    try {
      const analysisId = sourceMode === "excel"
        ? await startExcelAnalysis()
        : await startMetaAnalysis();

      setProgress(100);
      setProgressMessage("Analiz tamamlandı! Yönlendiriliyorsunuz...");
      setStep("done");
      toast.success("Analiz tamamlandı!", {
        description: `${clientName || "Müşteri"} raporu hazır.`,
      });

      setTimeout(() => {
        router.push(`/dashboard/analysis/${analysisId}`);
      }, 1000);
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

        {/* Kaynak Seçimi */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSourceMode("excel")}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              sourceMode === "excel"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <FileSpreadsheet className={`w-6 h-6 ${sourceMode === "excel" ? "text-blue-600" : "text-gray-400"}`} />
            <div className="text-left">
              <p className={`text-sm font-semibold ${sourceMode === "excel" ? "text-blue-700" : "text-gray-700"}`}>
                Excel Yükle
              </p>
              <p className="text-xs text-gray-400">Meta/Google export dosyası</p>
            </div>
          </button>
          <button
            onClick={() => setSourceMode("meta")}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              sourceMode === "meta"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Plug className={`w-6 h-6 ${sourceMode === "meta" ? "text-blue-600" : "text-gray-400"}`} />
            <div className="text-left">
              <p className={`text-sm font-semibold ${sourceMode === "meta" ? "text-blue-700" : "text-gray-700"}`}>
                Meta ile Bağlan
              </p>
              <p className="text-xs text-gray-400">Direkt API bağlantısı</p>
            </div>
          </button>
        </div>

        {/* Excel Mode */}
        {sourceMode === "excel" && (
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
        )}

        {/* Meta Mode */}
        {sourceMode === "meta" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="w-5 h-5" />
                1. Meta Hesabını Bağla
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!metaConnected ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="metaToken">Meta Access Token</Label>
                    <Input
                      id="metaToken"
                      type="password"
                      placeholder="EAAxxxxxxx..."
                      value={metaToken}
                      onChange={(e) => setMetaToken(e.target.value)}
                    />
                    <p className="text-xs text-gray-400">
                      Meta Business Suite &gt; Business Settings &gt; System Users &gt; Generate Token
                    </p>
                  </div>
                  <Button onClick={connectMeta} disabled={metaLoading || !metaToken.trim()} className="w-full gap-2">
                    {metaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />}
                    {metaLoading ? "Bağlanıyor..." : "Hesabı Bağla"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      {metaUser} olarak bağlandı — {metaAccounts.length} hesap
                    </span>
                    <button
                      className="ml-auto text-xs text-gray-400 hover:text-gray-600"
                      onClick={() => { setMetaConnected(false); setMetaAccounts([]); setSelectedAccount(""); }}
                    >
                      Bağlantıyı kes
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label>Reklam Hesabı</Label>
                    <select
                      value={selectedAccount}
                      onChange={(e) => {
                        setSelectedAccount(e.target.value);
                        const acc = metaAccounts.find((a) => a.id === e.target.value);
                        if (acc && !clientName) setClientName(acc.name);
                      }}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                      <option value="">Hesap seçin...</option>
                      {metaAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} {acc.business_name ? `(${acc.business_name})` : ""} — {acc.currency}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="since">Başlangıç</Label>
                      <Input
                        id="since"
                        type="date"
                        value={dateRange.since}
                        onChange={(e) => setDateRange({ ...dateRange, since: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="until">Bitiş</Label>
                      <Input
                        id="until"
                        type="date"
                        value={dateRange.until}
                        onChange={(e) => setDateRange({ ...dateRange, until: e.target.value })}
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeOnly}
                      onChange={(e) => setActiveOnly(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Sadece aktif kampanyalar</span>
                  </label>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Config */}
        {(readyFiles.length > 0 || (metaConnected && selectedAccount)) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                2. Analiz Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Müşteri Adı</Label>
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
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setStep("upload")}>
              Tekrar Dene
            </Button>
          </div>
        )}

        {/* Credit Warning */}
        {canProceed && !creditCheck.allowed && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Yetersiz Kredi</p>
              <p className="text-xs text-amber-600 mt-1">{creditCheck.reason}</p>
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
              {sourceMode === "meta" ? <Plug className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {sourceMode === "meta"
                ? "Meta Verilerini Analiz Et"
                : `Analizi Başlat (${readyFiles.length} dosya)`}
            </Button>
            {canProceed && creditCheck.allowed && (
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
