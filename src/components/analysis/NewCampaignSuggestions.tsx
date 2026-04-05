"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, DollarSign, Clock } from "lucide-react";
import type { NewCampaignSuggestion } from "@/types/analysis";

interface Props {
  suggestions: NewCampaignSuggestion[];
}

export function NewCampaignSuggestions({ suggestions }: Props) {
  if (!suggestions.length) return null;

  const platformColor: Record<string, string> = {
    Meta: "bg-blue-100 text-blue-700",
    Google: "bg-red-100 text-red-700",
    "Her İkisi": "bg-purple-100 text-purple-700",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Yeni Kampanya Önerileri ({suggestions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((s, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{s.title}</h3>
              <div className="flex gap-2">
                <Badge className={platformColor[s.platform] || "bg-gray-100"}>
                  {s.platform}
                </Badge>
                <Badge variant="outline">{s.campaignType}</Badge>
              </div>
            </div>

            <p className="text-sm text-gray-600">{s.objective}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Hedef Kitle</p>
                  <p className="font-medium">{s.targetAudience}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Aylık Bütçe</p>
                  <p className="font-medium">
                    {s.estimatedBudget.monthly.toLocaleString()}{" "}
                    {s.estimatedBudget.currency}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Tahmini ROAS</p>
                <p className="font-medium">
                  {s.estimatedRoas.min}x - {s.estimatedRoas.max}x
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Sonuç Süresi</p>
                  <p className="font-medium">{s.timeToResults}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Neden şimdi?</p>
              <p className="text-sm text-gray-600">{s.rationale}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Kurulum Adımları</p>
              <ol className="text-sm text-gray-600 space-y-1">
                {s.setupSteps.map((step, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="text-gray-400 shrink-0">{j + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-wrap gap-1">
              {s.kpis.map((kpi, j) => (
                <Badge key={j} variant="outline" className="text-xs">
                  {kpi}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
