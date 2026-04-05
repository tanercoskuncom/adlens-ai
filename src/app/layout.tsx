import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AdLens AI — Reklamlarına farklı bir gözle bak",
    template: "%s | AdLens AI",
  },
  description:
    "Meta Ads ve Google Ads verilerini yükle, yapay zeka destekli analiz ve aksiyon planı al. Dakikalar içinde kampanya performans raporu.",
  keywords: [
    "reklam analizi",
    "meta ads",
    "google ads",
    "yapay zeka",
    "kampanya optimizasyonu",
    "ROAS",
    "dijital pazarlama",
    "reklam raporu",
  ],
  authors: [{ name: "AdLens AI" }],
  openGraph: {
    title: "AdLens AI — Reklamlarına farklı bir gözle bak",
    description:
      "Meta Ads ve Google Ads verilerini yükle, yapay zeka destekli analiz ve aksiyon planı al.",
    type: "website",
    locale: "tr_TR",
    siteName: "AdLens AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "AdLens AI — Reklamlarına farklı bir gözle bak",
    description:
      "Meta Ads ve Google Ads verilerini yükle, AI destekli analiz al.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
