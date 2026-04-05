"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { badgeStore, type Badge } from "@/store/badgeStore";
import { Award } from "lucide-react";

export function BadgeWall() {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    setBadges(badgeStore.getAll());
  }, []);

  const earned = badges.filter((b) => b.earned);
  if (earned.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="w-5 h-5 text-amber-500" />
          Rozetler
          <span className="text-xs text-gray-400 font-normal">
            {earned.length}/{badges.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                badge.earned
                  ? `${badge.color} border-current/20`
                  : "bg-gray-50 text-gray-300 border-gray-100"
              }`}
              title={
                badge.earned
                  ? `${badge.name} — ${badge.description}`
                  : `Kilitli: ${badge.description}`
              }
            >
              <span className={`text-lg ${!badge.earned ? "grayscale opacity-30" : ""}`}>
                {badge.icon}
              </span>
              <div>
                <p className="text-xs font-medium leading-tight">{badge.name}</p>
                {badge.earned && badge.earnedDate && (
                  <p className="text-[10px] opacity-60">
                    {new Date(badge.earnedDate).toLocaleDateString("tr-TR")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
