"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-6">
        <span className="text-white font-bold text-lg">AL</span>
      </div>
      <AlertTriangle className="w-10 h-10 text-amber-500 mb-4" />
      <h1 className="text-xl font-bold mb-2">Bir sorun olustu</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
        Beklenmeyen bir hata meydana geldi. Sayfayi yenilemeyi deneyin veya ana
        sayfaya donun.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tekrar Dene
        </Button>
        <Link href="/dashboard">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
