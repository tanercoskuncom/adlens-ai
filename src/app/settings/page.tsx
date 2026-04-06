"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { creditStore, PLANS, type PlanType } from "@/store/creditStore";
import { settingsStore, type AppSettings } from "@/store/settingsStore";
import { Save, Sparkles, Check, Plug, CheckCircle, Loader2, Unplug, BarChart3 } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(settingsStore.get());
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsTotal, setCreditsTotal] = useState(3);
  const [metaTokenInput, setMetaTokenInput] = useState("");
  const [metaLoading, setMetaLoading] = useState(false);
  const [ga4Loading, setGa4Loading] = useState(false);

  useEffect(() => {
    setSettings(settingsStore.get());
    const state = creditStore.getState();
    const plan = creditStore.getPlan();
    setCurrentPlan(state.plan);
    setCreditsUsed(state.used);
    setCreditsTotal(plan.monthlyCredits);

    // Handle GA4 OAuth callback params
    const params = new URLSearchParams(window.location.search);
    if (params.get("ga4_success") === "1") {
      const updated = settingsStore.set({
        ga4AccessToken: params.get("ga4_access_token") || "",
        ga4RefreshToken: params.get("ga4_refresh_token") || "",
        ga4Email: params.get("ga4_email") || "",
        ga4Name: params.get("ga4_name") || "",
      });
      setSettings(updated);
      toast.success("Google Analytics baglandi!", {
        description: `${params.get("ga4_email")} hesabi baglandi.`,
      });
      // Clean URL
      window.history.replaceState({}, "", "/settings");
    }
    if (params.get("ga4_error")) {
      toast.error("Google Analytics baglanti hatasi", {
        description: params.get("ga4_error") || "",
      });
      window.history.replaceState({}, "", "/settings");
    }
  }, []);

  const connectMeta = async () => {
    if (!metaTokenInput.trim()) return;
    setMetaLoading(true);
    try {
      const res = await fetch("/api/meta/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: metaTokenInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Bağlantı başarısız");

      const updated = settingsStore.set({
        metaToken: metaTokenInput,
        metaUserName: data.user?.name || "",
      });
      setSettings(updated);
      setMetaTokenInput("");
      toast.success("Meta hesabı bağlandı!", {
        description: `${data.user?.name} olarak ${data.accounts.length} hesap erişimi var.`,
      });
    } catch (err) {
      toast.error("Meta bağlantı hatası", {
        description: err instanceof Error ? err.message : "Token geçersiz olabilir",
      });
    } finally {
      setMetaLoading(false);
    }
  };

  const connectGA4 = async () => {
    setGa4Loading(true);
    try {
      const res = await fetch("/api/ga4/auth");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "OAuth URL alinamadi");
      }
    } catch (err) {
      toast.error("Google Analytics baglanti hatasi", {
        description: err instanceof Error ? err.message : "Bir hata olustu",
      });
      setGa4Loading(false);
    }
  };

  const disconnectGA4 = () => {
    const updated = settingsStore.set({
      ga4AccessToken: "",
      ga4RefreshToken: "",
      ga4Email: "",
      ga4Name: "",
      ga4PropertyId: "",
      ga4PropertyName: "",
    });
    setSettings(updated);
    toast.success("Google Analytics baglantisi kesildi");
  };

  const disconnectMeta = () => {
    const updated = settingsStore.set({ metaToken: "", metaUserName: "" });
    setSettings(updated);
    toast.success("Meta bağlantısı kesildi");
  };

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlanChange = (plan: PlanType) => {
    creditStore.setPlan(plan);
    setCurrentPlan(plan);
    const newPlan = PLANS[plan];
    setCreditsTotal(newPlan.monthlyCredits);
    toast.success(`Plan değiştirildi: ${newPlan.label}`);
  };

  const handleSave = () => {
    settingsStore.set(settings);
    toast.success("Ayarlar kaydedildi");
  };

  return (
    <>
      <Header title="Ayarlar" />
      <div className="p-6 max-w-2xl space-y-6">
        {/* Plan & Credits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Plan & Kredi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Usage */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bu Ay Kullanım</span>
                <span className="text-sm text-gray-500">
                  {creditsUsed} / {creditsTotal} kredi
                </span>
              </div>
              <Progress
                value={creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0}
              />
              <p className="text-xs text-gray-400">
                Kalan: {Math.max(0, creditsTotal - creditsUsed)} kredi &middot;
                Her ay 1&apos;inde sıfırlanır
              </p>
            </div>

            <Separator />

            {/* Plan Selection */}
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(PLANS) as [PlanType, typeof PLANS.free][]).map(
                ([key, plan]) => (
                  <button
                    key={key}
                    onClick={() => handlePlanChange(key)}
                    className={`relative p-4 rounded-lg border-2 text-left transition-colors ${
                      currentPlan === key
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {currentPlan === key && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{plan.label}</span>
                      {key === "agency" && (
                        <Badge className="bg-purple-100 text-purple-700 text-[10px]">
                          Popüler
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg font-bold">
                      {plan.price === 0 ? "Ücretsiz" : `$${plan.price}/ay`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {plan.monthlyCredits} kredi/ay
                    </p>
                    <ul className="mt-2 space-y-1">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <li
                          key={i}
                          className="text-xs text-gray-500 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-green-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              )}
            </div>

            <p className="text-xs text-gray-400 text-center">
              Plan değişiklikleri hemen geçerli olur. Ödeme sistemi yakında aktif
              olacak.
            </p>
          </CardContent>
        </Card>

        {/* Workspace */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace Ayarları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wsName">Workspace Adı</Label>
              <Input
                id="wsName"
                value={settings.workspaceName}
                onChange={(e) => updateSetting("workspaceName", e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Analiz Dili</Label>
              <div className="flex gap-2">
                {(["tr", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => updateSetting("language", lang)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                      settings.language === lang
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {lang === "tr" ? "Türkçe" : "English"}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Tercihler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Türkiye Pazarı</p>
                <p className="text-xs text-gray-500">
                  TL benchmark&apos;ları ve Türkiye e-ticaret takvimi aktif olur
                </p>
              </div>
              <Switch
                checked={settings.turkeyMarket}
                onCheckedChange={(v) => updateSetting("turkeyMarket", v)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Haftalık E-posta Özeti</p>
                <p className="text-xs text-gray-500">
                  Her Pazartesi sabahı aksiyon listesi e-postası
                </p>
              </div>
              <Switch
                checked={settings.weeklyEmail}
                onCheckedChange={(v) => updateSetting("weeklyEmail", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Meta Bağlantısı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="w-5 h-5 text-blue-500" />
              Meta Ads Bağlantısı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.metaToken ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      {settings.metaUserName || "Meta"} hesabı bağlı
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Token kayıtlı — yeni analizlerde otomatik kullanılacak
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectMeta}
                    className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Unplug className="w-3 h-3" />
                    Kes
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="metaToken">Meta Access Token</Label>
                  <Input
                    id="metaToken"
                    type="password"
                    placeholder="EAAxxxxxxx..."
                    value={metaTokenInput}
                    onChange={(e) => setMetaTokenInput(e.target.value)}
                  />
                  <p className="text-xs text-gray-400">
                    Meta Business Suite &rarr; Business Settings &rarr; System Users &rarr; Generate Token
                  </p>
                </div>
                <Button
                  onClick={connectMeta}
                  disabled={metaLoading || !metaTokenInput.trim()}
                  className="w-full gap-2"
                >
                  {metaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />}
                  {metaLoading ? "Bağlanıyor..." : "Meta Hesabını Bağla"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Google Analytics Baglantisi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              Google Analytics 4 Baglantisi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.ga4RefreshToken ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      {settings.ga4Email || settings.ga4Name || "Google"} hesabi bagli
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      {settings.ga4PropertyName
                        ? `Property: ${settings.ga4PropertyName}`
                        : "Property secimi yapilmadi — rapor olusturma sirasinda secilebilir"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectGA4}
                    className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Unplug className="w-3 h-3" />
                    Kes
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Google hesabinizla baglanti kurarak GA4 verilerinizi performans raporlarinda kullanabilirsiniz.
                </p>
                <Button
                  onClick={connectGA4}
                  disabled={ga4Loading}
                  className="w-full gap-2"
                >
                  {ga4Loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                  {ga4Loading ? "Yonlendiriliyor..." : "Google ile Baglan"}
                </Button>
                <p className="text-xs text-gray-400">
                  Google OAuth2 ile guvenli baglanti. Sadece Analytics okuma yetkisi istenir.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* API Key */}
        <Card>
          <CardHeader>
            <CardTitle>API Ayarları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Anthropic API Key (opsiyonel)</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-ant-api03-..."
                disabled
              />
              <p className="text-xs text-gray-400">
                Agency planında kendi API key&apos;inizi kullanabilirsiniz.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button className="gap-2" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Kaydet
        </Button>
      </div>
    </>
  );
}
