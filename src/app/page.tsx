import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Upload,
  Zap,
  FileSpreadsheet,
  Target,
  TrendingUp,
  Shield,
  Users,
  Building2,
  Briefcase,
  User,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileSpreadsheet,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Otomatik Platform Tespiti",
    desc: "Meta Ads veya Google Ads formatini otomatik tanir. Sutun esleme, veri validasyonu ve normalizasyon dahil.",
  },
  {
    icon: BarChart3,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "AI Kampanya Analizi",
    desc: "Her kampanya icin ayri performans degerlendirmesi, guclu/zayif yonler, anomali tespiti ve sektor karsilastirmasi.",
  },
  {
    icon: Zap,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    title: "Aksiyon Plani",
    desc: "Acil ve aylik aksiyon onerileri, durdurulmasi gereken kampanyalar ve butce dagitim tavsiyeleri.",
  },
  {
    icon: Target,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Yeni Kampanya Onerileri",
    desc: "Mevcut performansa gore yeni kampanya yapilari, hedefleme ve butce dagitim onerileri.",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    title: "Donem Karsilastirmasi",
    desc: "Gecmis analizlerle karsilastirma, trend skorlari ve iyilesme/kotulesme gostergeleri.",
  },
  {
    icon: Shield,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    title: "KVKK/GDPR Uyumlu",
    desc: "Ham Excel dosyalari sunucuda saklanmaz. Sadece analiz sonuclari kaydedilir. Veri guvenligi oncelik.",
  },
];

const SEGMENTS = [
  {
    icon: User,
    title: "Freelancer'lar",
    desc: "Birden fazla musteriyi tek basina yoneten dijital pazarlama uzmanlari",
  },
  {
    icon: Briefcase,
    title: "KOBi & E-ticaret",
    desc: "Kendi reklamlarini kendisi yoneten girisimciler ve kucuk isletmeler",
  },
  {
    icon: Building2,
    title: "Reklam Ajanslari",
    desc: "Multi-user, musteri bazli erisim yoneten ekipler icin tam cozum",
  },
  {
    icon: Users,
    title: "Kurumsal Ekipler",
    desc: "In-house buyuk pazarlama ekipleri, white-label ve ozel domain ihtiyaci",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    credits: "3 analiz/ay",
    highlight: false,
    features: [
      "Max 20 kampanya/analiz",
      "1 kullanici",
      "Temel rapor",
      "Kredi karti gerekmez",
    ],
  },
  {
    name: "Solo",
    price: "$19",
    period: "/ay",
    credits: "30 analiz/ay",
    highlight: false,
    features: [
      "Max 30 kampanya/analiz",
      "1 kullanici",
      "PDF export",
      "Analiz gecmisi",
    ],
  },
  {
    name: "Agency",
    price: "$79",
    period: "/ay",
    credits: "150 analiz/ay",
    highlight: true,
    features: [
      "Max 50 kampanya/analiz",
      "10 kullanici",
      "Musteri yonetimi",
      "Markali PDF",
      "Rol yonetimi",
    ],
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/ay",
    credits: "500 analiz/ay",
    highlight: false,
    features: [
      "Sinirsiz kampanya",
      "Sinirsiz kullanici",
      "Kendi API key",
      "White-label",
      "Custom domain",
    ],
  },
];

const FAQ = [
  {
    q: "Hangi reklam platformlari destekleniyor?",
    a: "Simdilik Meta Ads (Facebook/Instagram) ve Google Ads desteklenmektedir. TikTok ve LinkedIn Ads yakin zamanda eklenecek.",
  },
  {
    q: "Excel dosyam hangi formatta olmali?",
    a: "Meta Ads Manager veya Google Ads'ten standart export edilen .xlsx veya .csv dosyalari dogrudan desteklenir. Platform ve sutunlar otomatik tanimlanir.",
  },
  {
    q: "Verilerim guvenli mi?",
    a: "Ham Excel dosyalari sunucuda saklanmaz, sadece RAM'de islenir. Yalnizca analiz sonuclari kaydedilir. KVKK/GDPR uyumlu altyapi kullanilmaktadir.",
  },
  {
    q: "Analiz kredisi nedir?",
    a: "Her analiz, kampanya sayisina gore 1-5 kredi harcar. Kucuk analiz (1-5 kampanya) 1 kredi, orta (6-20) 3 kredi, buyuk (20+) 5 kredi.",
  },
  {
    q: "Kullanilmayan krediler bir sonraki aya devredilir mi?",
    a: "Hayir, analiz kredileri ertesi aya aktarilmaz. Her ay baslangicta sifirlanir.",
  },
  {
    q: "Kendi Claude API key'imi kullanabilir miyim?",
    a: "Evet, Enterprise planinda kendi Anthropic API key'inizi baglayarak maliyet kontrolunu tamamen elinizde tutabilirsiniz.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AL</span>
            </div>
            <span className="font-semibold text-lg">AdLens AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900">
              Ozellikler
            </a>
            <a href="#pricing" className="hover:text-gray-900">
              Fiyatlandirma
            </a>
            <a href="#faq" className="hover:text-gray-900">
              SSS
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Giris Yap</Button>
            </Link>
            <Link href="/register">
              <Button>Ucretsiz Basla</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant="outline" className="gap-1.5 py-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            Claude AI Destekli
          </Badge>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Reklamlarına farklı
          <br />
          bir gözle bak.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          Meta Ads ve Google Ads verilerini yükle, yapay zeka destekli
          derinlemesine analiz ve aksiyon plani al. Dakikalar icinde.
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              <Upload className="w-4 h-4" />
              Ucretsiz Dene
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="gap-2">
              Demo Gor
            </Button>
          </Link>
        </div>

        {/* Platform chips */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Badge className="bg-blue-100 text-blue-700 gap-1.5">
            Meta Ads
          </Badge>
          <Badge className="bg-red-100 text-red-700 gap-1.5">
            Google Ads
          </Badge>
          <Badge variant="outline" className="text-gray-400 gap-1.5">
            TikTok Ads (Yakinda)
          </Badge>
          <Badge variant="outline" className="text-gray-400 gap-1.5">
            LinkedIn Ads (Yakinda)
          </Badge>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Nasil Calisir?
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            3 basit adimda reklam hesabinizin tam analizini alin
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Excel Yukle</h3>
              <p className="text-gray-500 text-sm">
                Meta Ads veya Google Ads&apos;ten export ettiginiz Excel
                dosyasini surukleyip birakin. Platform otomatik taninir.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Analiz</h3>
              <p className="text-gray-500 text-sm">
                Claude AI her kampanyanizi ayri ayri analiz eder. Guclu yonler,
                sorunlar ve sektor karsilastirmasi sunar.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4 mx-auto">
                <span className="text-orange-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Aksiyona Gec</h3>
              <p className="text-gray-500 text-sm">
                Acil aksiyon plani, yeni kampanya onerileri ve PDF rapor alin.
                Hemen uygulayin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Ozellikler
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Reklam analizinin ihtiyac duydugu her sey, tek platformda
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div
                    className={`w-12 h-12 rounded-lg ${f.iconBg} flex items-center justify-center mb-4`}
                  >
                    <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Kimler Icin?
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Freelancer&apos;dan kurumsal ekiplere, her olcekte reklam yonetimi
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SEGMENTS.map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm text-center"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 mx-auto">
                  <s.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Fiyatlandirma
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Ihtiyaciniza uygun plani secin. Kredi karti gerekmez.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl p-6 border-2 ${
                  plan.highlight
                    ? "border-blue-500 bg-blue-50/30 relative"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      En Populer
                    </Badge>
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{plan.credits}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.price === "$0" ? "Ucretsiz Basla" : "Plani Sec"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Sikca Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group bg-white rounded-lg border border-gray-200"
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium">
                  {item.q}
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-sm text-gray-500">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Reklam analizine hemen baslayin
          </h2>
          <p className="text-gray-500 mb-8">
            Ucretsiz hesap olusturun, ilk 3 analiziniz bedava.
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              <Upload className="w-4 h-4" />
              Ucretsiz Hesap Olustur
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">AL</span>
              </div>
              <span className="text-sm font-medium">AdLens AI</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <span>Gizlilik Politikasi</span>
              <span>Kullanim Kosullari</span>
              <span>KVKK Aydinlatma Metni</span>
            </div>
            <p className="text-xs text-gray-400">
              &copy; 2026 AdLens AI — Reklamlarına farklı bir gözle bak.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
