"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  History,
  GitCompareArrows,
  Settings,
  Users,
  Building2,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { creditStore } from "@/store/creditStore";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Yeni Analiz",
    href: "/dashboard/new",
    icon: Upload,
  },
  {
    label: "Gecmis",
    href: "/dashboard/history",
    icon: History,
  },
  {
    label: "Karsilastir",
    href: "/dashboard/compare",
    icon: GitCompareArrows,
  },
];

const SETTINGS_ITEMS = [
  {
    label: "Kullanicilar",
    href: "/settings/users",
    icon: Users,
  },
  {
    label: "Musteriler",
    href: "/settings/clients",
    icon: Building2,
  },
  {
    label: "Ayarlar",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [credits, setCredits] = useState({ remaining: 0, total: 0, plan: "" });

  useEffect(() => {
    setCredits({
      remaining: creditStore.getRemaining(),
      total: creditStore.getTotal(),
      plan: creditStore.getPlan().label,
    });
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/settings") return pathname === "/settings";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 border-r bg-white flex flex-col h-screen">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">AL</span>
          </div>
          <span className="font-semibold text-lg">AdLens AI</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-3">
          Analiz
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-3 pt-6">
          Yonetim
        </p>
        {SETTINGS_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-3">
        {/* Credit info */}
        <div className="px-3 py-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              {credits.plan}
            </span>
            <span className="text-xs font-medium">
              {credits.remaining}/{credits.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{
                width: `${credits.total > 0 ? Math.max(2, ((credits.total - credits.remaining) / credits.total) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {credits.remaining} kredi kaldi
          </p>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-700">
              {(session?.user?.name || session?.user?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.name || session?.user?.email || "Kullanici"}
            </p>
            <p className="text-xs text-gray-400 truncate">{credits.plan} Plan</p>
          </div>
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Cikis Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="text-xs text-gray-400 text-center">
          AdLens AI v1.0
        </div>
      </div>
    </aside>
  );
}
