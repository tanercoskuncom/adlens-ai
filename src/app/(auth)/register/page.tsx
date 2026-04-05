"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kayıt başarısız");
        return;
      }

      // Kayıt başarılı, otomatik giriş yap
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Kayıt oldu ama giriş yapılamadı, login sayfasına yönlendir
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Kayıt sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">AL</span>
          </div>
          <h1 className="text-2xl font-bold">AdLens AI</h1>
          <p className="text-gray-500 mt-1">Yeni hesap oluşturun</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kayıt Ol</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@ajans.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Şifreyi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Kayıt yapılıyor...
                  </>
                ) : (
                  "Kayıt Ol"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Giriş yapın
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
