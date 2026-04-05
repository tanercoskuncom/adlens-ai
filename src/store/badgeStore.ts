import { analysisStore } from "./analysisStore";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedDate?: string;
}

type BadgeChecker = () => { earned: boolean; date?: string };

const BADGE_DEFINITIONS: {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  check: BadgeChecker;
}[] = [
  {
    id: "first_analysis",
    name: "Ilk Adim",
    description: "Ilk analizini tamamla",
    icon: "🎯",
    color: "bg-blue-100 text-blue-700",
    check: () => {
      const all = analysisStore.getAll();
      if (all.length > 0) {
        return { earned: true, date: all[all.length - 1].createdAt };
      }
      return { earned: false };
    },
  },
  {
    id: "five_analyses",
    name: "Deneyimli",
    description: "5 analiz tamamla",
    icon: "📊",
    color: "bg-green-100 text-green-700",
    check: () => {
      const all = analysisStore.getAll();
      if (all.length >= 5) {
        return { earned: true, date: all[all.length - 5].createdAt };
      }
      return { earned: false };
    },
  },
  {
    id: "high_score",
    name: "Yuksek Performans",
    description: "80+ skor alan bir analiz yap",
    icon: "⭐",
    color: "bg-amber-100 text-amber-700",
    check: () => {
      const all = analysisStore.getAll();
      const high = all.find(
        (a) => a.result.overallReport.overallScore >= 80
      );
      if (high) {
        return { earned: true, date: high.createdAt };
      }
      return { earned: false };
    },
  },
  {
    id: "consistent",
    name: "Istikrarli",
    description: "3 analiz ust uste 70+ skor",
    icon: "🏅",
    color: "bg-purple-100 text-purple-700",
    check: () => {
      const all = analysisStore.getAll();
      if (all.length < 3) return { earned: false };
      // En son 3 analiz
      const recent = all.slice(0, 3);
      const allAbove70 = recent.every(
        (a) => a.result.overallReport.overallScore >= 70
      );
      if (allAbove70) {
        return { earned: true, date: recent[0].createdAt };
      }
      return { earned: false };
    },
  },
  {
    id: "fast_growth",
    name: "Hizli Buyume",
    description: "Onceki analize gore +20 puan artis",
    icon: "🚀",
    color: "bg-indigo-100 text-indigo-700",
    check: () => {
      const all = analysisStore.getAll();
      if (all.length < 2) return { earned: false };
      for (let i = 0; i < all.length - 1; i++) {
        const curr = all[i].result.overallReport.overallScore;
        const prev = all[i + 1].result.overallReport.overallScore;
        if (curr - prev >= 20) {
          return { earned: true, date: all[i].createdAt };
        }
      }
      return { earned: false };
    },
  },
  {
    id: "rescue",
    name: "Kurtarma",
    description: "Kritik skoru (<40) sonraki analizde 60+'a cikar",
    icon: "🔥",
    color: "bg-red-100 text-red-700",
    check: () => {
      const all = analysisStore.getAll();
      if (all.length < 2) return { earned: false };
      for (let i = 0; i < all.length - 1; i++) {
        const curr = all[i].result.overallReport.overallScore;
        const prev = all[i + 1].result.overallReport.overallScore;
        if (prev < 40 && curr >= 60) {
          return { earned: true, date: all[i].createdAt };
        }
      }
      return { earned: false };
    },
  },
  {
    id: "multi_platform",
    name: "Coklu Platform",
    description: "Meta + Google birlesik analiz yap",
    icon: "🔗",
    color: "bg-teal-100 text-teal-700",
    check: () => {
      const all = analysisStore.getAll();
      const both = all.find((a) => a.platform === "BOTH");
      if (both) {
        return { earned: true, date: both.createdAt };
      }
      return { earned: false };
    },
  },
];

export const badgeStore = {
  getAll(): Badge[] {
    return BADGE_DEFINITIONS.map((def) => {
      const result = def.check();
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        color: def.color,
        earned: result.earned,
        earnedDate: result.date,
      };
    });
  },

  getEarned(): Badge[] {
    return this.getAll().filter((b) => b.earned);
  },

  getEarnedCount(): number {
    return this.getEarned().length;
  },

  getTotalCount(): number {
    return BADGE_DEFINITIONS.length;
  },
};
