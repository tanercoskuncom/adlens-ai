"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Building2, BarChart3, Trash2 } from "lucide-react";

interface ClientItem {
  id: string;
  name: string;
  sector: string;
  analysisCount: number;
  lastAnalysis?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [newName, setNewName] = useState("");
  const [newSector, setNewSector] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const addClient = () => {
    if (!newName.trim()) return;
    setClients((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newName,
        sector: newSector || "Genel",
        analysisCount: 0,
      },
    ]);
    setNewName("");
    setNewSector("");
    setDialogOpen(false);
  };

  const removeClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <>
      <Header title="Müşteri Yönetimi" />
      <div className="p-6 max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Müşteriler</h2>
            <p className="text-sm text-gray-500">
              Müşterilerinizi ekleyin, analizleri müşteri bazlı takip edin
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button className="gap-2" />}>
              <Plus className="w-4 h-4" />
              Yeni Müşteri
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Müşteri Adı</Label>
                  <Input
                    placeholder="ABC Şirketi"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sektör</Label>
                  <Input
                    placeholder="E-ticaret, SaaS, Finans..."
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={addClient}>
                  Müşteri Ekle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-400 mb-4">
                Henüz müşteri eklenmemiş.
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                İlk Müşteriyi Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {clients.map((c) => (
              <Card key={c.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Badge variant="outline">{c.sector}</Badge>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            {c.analysisCount} analiz
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeClient(c.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
