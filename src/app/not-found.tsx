import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-6">
        <span className="text-white font-bold text-lg">AL</span>
      </div>
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-xl font-semibold mb-2">Sayfa Bulunamadi</h2>
      <p className="text-sm text-gray-500 mb-6">
        Aradiginiz sayfa mevcut degil veya tasindi.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfa
          </Button>
        </Link>
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
