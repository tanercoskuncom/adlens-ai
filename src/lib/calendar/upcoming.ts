import events from "./tr-events.json";

export interface UpcomingEvent {
  name: string;
  date: Date;
  daysLeft: number;
  impact: string;
  suggestion: string;
  sectors: string[];
}

/**
 * Önümüzdeki N gün içindeki etkinlikleri döndürür.
 * Varsayılan: 60 gün
 */
export function getUpcomingEvents(
  daysAhead = 60,
  sector?: string
): UpcomingEvent[] {
  const now = new Date();
  const currentYear = now.getFullYear();

  const upcoming: UpcomingEvent[] = [];

  for (const event of events.events) {
    // Bu yıl ve gelecek yıl için kontrol et
    for (const year of [currentYear, currentYear + 1]) {
      const eventDate = new Date(year, event.month - 1, event.day);
      const diffMs = eventDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysLeft > 0 && daysLeft <= daysAhead) {
        // Sektör filtresi
        if (sector && !event.sectors.includes(sector) && !event.sectors.includes("general")) {
          continue;
        }

        upcoming.push({
          name: event.name,
          date: eventDate,
          daysLeft,
          impact: event.impact,
          suggestion: event.suggestion,
          sectors: event.sectors,
        });
      }
    }
  }

  // En yakın etkinlik önce
  return upcoming.sort((a, b) => a.daysLeft - b.daysLeft);
}
