"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Shield, Trash2 } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "ANALYST";
  status: "active" | "pending";
}

const ROLE_CONFIG = {
  SUPER_ADMIN: { label: "Süper Admin", className: "bg-purple-100 text-purple-700" },
  ADMIN: { label: "Admin", className: "bg-blue-100 text-blue-700" },
  ANALYST: { label: "Analist", className: "bg-gray-100 text-gray-700" },
};

export default function UsersPage() {
  const [members] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Siz",
      email: "admin@ajans.com",
      role: "SUPER_ADMIN",
      status: "active",
    },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "ANALYST">("ANALYST");

  return (
    <>
      <Header title="Kullanıcı Yönetimi" />
      <div className="p-6 max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Ekip Üyeleri</h2>
            <p className="text-sm text-gray-500">
              Workspace&apos;inize kullanıcı ekleyin ve rollerini yönetin
            </p>
          </div>

          <Dialog>
            <DialogTrigger render={<Button className="gap-2" />}>
              <UserPlus className="w-4 h-4" />
              Davet Et
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ekip Üyesi Davet Et</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>E-posta</Label>
                  <Input
                    type="email"
                    placeholder="analist@ajans.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <div className="flex gap-2">
                    {(["ADMIN", "ANALYST"] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => setInviteRole(role)}
                        className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                          inviteRole === role
                            ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        {ROLE_CONFIG[role].label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {inviteRole === "ADMIN"
                      ? "Tüm müşterileri görebilir, analiz yapabilir"
                      : "Sadece atandığı müşteri hesaplarına erişebilir"}
                  </p>
                </div>
                <Button className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  Davet Gönder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Members List */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {members.map((m) => {
                const r = ROLE_CONFIG[m.role];
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {m.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-gray-400">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={r.className}>{r.label}</Badge>
                      {m.status === "pending" && (
                        <Badge variant="outline" className="text-amber-600">
                          Bekliyor
                        </Badge>
                      )}
                      {m.role !== "SUPER_ADMIN" && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </Button>
                      )}
                      {m.role === "SUPER_ADMIN" && (
                        <Shield className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
