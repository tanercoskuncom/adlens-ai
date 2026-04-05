"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LayoutDashboard,
  Upload,
  History,
  GitCompareArrows,
  Settings,
  Users,
  Building2,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Yeni Analiz", href: "/dashboard/new", icon: Upload },
  { label: "Gecmis", href: "/dashboard/history", icon: History },
  { label: "Karsilastir", href: "/dashboard/compare", icon: GitCompareArrows },
];

const SETTINGS_ITEMS = [
  { label: "Kullanicilar", href: "/settings/users", icon: Users },
  { label: "Musteriler", href: "/settings/clients", icon: Building2 },
  { label: "Ayarlar", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/settings") return pathname === "/settings";
    return pathname.startsWith(href);
  };

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">AL</span>
          </div>
          <span className="font-semibold">AdLens AI</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Spacer */}
      <div className="h-14" />

      {/* Overlay menu */}
      {open && (
        <div className="fixed inset-0 z-40 top-14 bg-white">
          <nav className="p-4 space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-3">
              Analiz
            </p>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}

            <div className="my-4 border-t" />

            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-3">
              Yonetim
            </p>
            {SETTINGS_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
