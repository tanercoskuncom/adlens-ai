"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, TrendingUp, Lightbulb } from "lucide-react";
import { getUpcomingEvents, type UpcomingEvent } from "@/lib/calendar/upcoming";

interface Props {
  sector?: string;
  limit?: number;
}

export function UpcomingEvents({ sector, limit = 3 }: Props) {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    setEvents(getUpcomingEvents(60, sector).slice(0, limit));
  }, [sector, limit]);

  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="w-5 h-5 text-indigo-500" />
          Yaklasan Firsatlar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event, i) => (
          <div key={i} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{event.name}</span>
                <Badge
                  className={
                    event.daysLeft <= 7
                      ? "bg-red-100 text-red-700"
                      : event.daysLeft <= 21
                        ? "bg-amber-100 text-amber-700"
                        : "bg-indigo-100 text-indigo-700"
                  }
                >
                  {event.daysLeft} gun
                </Badge>
              </div>
              <span className="text-xs text-gray-400">
                {event.date.toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600">{event.impact}</p>
              </div>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600">{event.suggestion}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
