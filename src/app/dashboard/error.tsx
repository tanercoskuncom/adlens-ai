"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
      <h2 className="text-lg font-semibold mb-2">Bir sorun olustu</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
        Sayfa yuklenirken beklenmeyen bir hata meydana geldi. Lutfen tekrar
        deneyin.
      </p>
      <Button onClick={reset} className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Tekrar Dene
      </Button>
    </div>
  );
}
