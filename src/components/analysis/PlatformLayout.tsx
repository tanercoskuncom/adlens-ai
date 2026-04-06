"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Platform = "overview" | "meta" | "google" | "compare" | "report";

interface PlatformTab {
  key: Platform;
  label: string;
  href: string;
  color: string;
  activeClass: string;
}

interface Props {
  analysisId: string;
  hasMeta?: boolean;
  hasGoogle?: boolean;
  children: React.ReactNode;
}

export function PlatformLayout({
  analysisId,
  hasMeta = true,
  hasGoogle = true,
  children,
}: Props) {
  const pathname = usePathname();
  const base = `/dashboard/analysis/${analysisId}`;

  const tabs: PlatformTab[] = [
    {
      key: "overview",
      label: "Genel Özet",
      href: base,
      color: "text-gray-700",
      activeClass: "border-gray-700 bg-gray-50",
    },
  ];

  if (hasMeta) {
    tabs.push({
      key: "meta",
      label: "Meta Ads",
      href: `${base}/meta`,
      color: "text-blue-600",
      activeClass: "border-blue-600 bg-blue-50",
    });
  }

  if (hasGoogle) {
    tabs.push({
      key: "google",
      label: "Google Ads",
      href: `${base}/google`,
      color: "text-red-600",
      activeClass: "border-red-600 bg-red-50",
    });
  }

  if (hasMeta && hasGoogle) {
    tabs.push({
      key: "compare",
      label: "Karşılaştırma",
      href: `${base}/compare`,
      color: "text-indigo-600",
      activeClass: "border-indigo-600 bg-indigo-50",
    });
  }

  tabs.push({
    key: "report",
    label: "Performans Raporu",
    href: `${base}/report`,
    color: "text-emerald-600",
    activeClass: "border-emerald-600 bg-emerald-50",
  });

  return (
    <div>
      <div className="border-b px-6 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? `${tab.activeClass} ${tab.color} border-current`
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
