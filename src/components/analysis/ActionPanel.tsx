"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Calendar, Clock, StopCircle } from "lucide-react";
import type { ActionPlan } from "@/types/analysis";

interface ActionPanelProps {
  actionPlan: ActionPlan;
}

function effortBadge(effort: string) {
  const config: Record<string, { label: string; className: string }> = {
    low: { label: "Kolay", className: "bg-green-100 text-green-700" },
    medium: { label: "Orta", className: "bg-amber-100 text-amber-700" },
    high: { label: "Zor", className: "bg-red-100 text-red-700" },
  };
  const c = config[effort] || config.medium;
  return (
    <Badge variant="outline" className={c.className}>
      {c.label}
    </Badge>
  );
}

export function ActionPanel({ actionPlan }: ActionPanelProps) {
  const [completedActions, setCompletedActions] = useState<Set<string>>(
    new Set()
  );

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Urgent Actions */}
      {actionPlan.urgentActions.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <Zap className="w-4 h-4" />
              Acil Aksiyonlar ({actionPlan.urgentActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {actionPlan.urgentActions.map((action, i) => {
              const id = `urgent-${i}`;
              const done = completedActions.has(id);
              return (
                <div
                  key={id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    done ? "bg-gray-50 opacity-60" : "bg-red-50"
                  }`}
                >
                  <Checkbox
                    checked={done}
                    onCheckedChange={() => toggleAction(id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-sm font-medium ${
                          done ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {action.title}
                      </span>
                      {effortBadge(action.effort)}
                    </div>
                    <p className="text-xs text-gray-500">{action.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>Kampanya: {action.campaign}</span>
                      <span>Etki: {action.expectedImpact}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Monthly Actions */}
      {actionPlan.monthlyActions.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700">
              <Calendar className="w-4 h-4" />
              Bu Ay Yapılacaklar ({actionPlan.monthlyActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {actionPlan.monthlyActions.map((action, i) => {
              const id = `monthly-${i}`;
              const done = completedActions.has(id);
              return (
                <div
                  key={id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    done ? "bg-gray-50 opacity-60" : "bg-amber-50"
                  }`}
                >
                  <Checkbox
                    checked={done}
                    onCheckedChange={() => toggleAction(id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-sm font-medium ${
                          done ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {action.title}
                      </span>
                      {effortBadge(action.effort)}
                    </div>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Long-term Actions */}
      {actionPlan.longtermActions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              Uzun Vadeli ({actionPlan.longtermActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {actionPlan.longtermActions.map((action, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{action.title}</span>
                <p className="text-xs text-gray-500 mt-1">
                  {action.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Campaigns to Stop */}
      {actionPlan.campaignsToStop.length > 0 && (
        <Card className="border-red-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-800">
              <StopCircle className="w-4 h-4" />
              Durdurulması Önerilen Kampanyalar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {actionPlan.campaignsToStop.map((c, i) => (
              <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="text-sm font-bold text-red-800">
                  {c.campaignName}
                </span>
                <p className="text-xs text-red-600 mt-1">{c.reason}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Bütçe aktarımı: {c.budgetReallocation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Budget Recommendation */}
      {actionPlan.budgetRecommendation && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bütçe Önerisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-2">
              <div className="text-center">
                <p className="text-xs text-gray-400">Mevcut</p>
                <p className="text-lg font-bold">
                  {actionPlan.budgetRecommendation.currentTotal.toLocaleString()}
                </p>
              </div>
              <span className="text-gray-300">→</span>
              <div className="text-center">
                <p className="text-xs text-gray-400">Önerilen</p>
                <p className="text-lg font-bold text-blue-600">
                  {actionPlan.budgetRecommendation.recommendedTotal.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {actionPlan.budgetRecommendation.rationale}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
