"use client";

import { useEffect, useState } from "react";
import { Bell, User, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { creditStore } from "@/store/creditStore";
import { useSession, signOut } from "next-auth/react";

interface HeaderProps {
  title?: string;
  credits?: { used: number; total: number };
}

export function Header({ title = "Dashboard", credits }: HeaderProps) {
  const { data: session } = useSession();
  const [creditInfo, setCreditInfo] = useState<{
    used: number;
    total: number;
    plan: string;
  } | null>(null);

  useEffect(() => {
    const state = creditStore.getState();
    const plan = creditStore.getPlan();
    setCreditInfo({
      used: state.used,
      total: plan.monthlyCredits,
      plan: plan.label,
    });
  }, []);

  const displayCredits = credits || (creditInfo ? { used: creditInfo.used, total: creditInfo.total } : null);

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        {creditInfo && (
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span className="text-xs">{creditInfo.plan}</span>
          </Badge>
        )}

        {displayCredits && (
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">
              {displayCredits.total - displayCredits.used}
            </span>
            <span>/{displayCredits.total} kredi</span>
          </div>
        )}

        <Button variant="ghost" size="icon">
          <Bell className="w-4 h-4" />
        </Button>

        {session ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Cikis Yap"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <User className="w-4 h-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
