import type { FullAnalysisResult } from "@/types/analysis";

export interface SavedAnalysis {
  id: string;
  clientName: string;
  platform: "META" | "GOOGLE" | "BOTH";
  template: string;
  language: "tr" | "en";
  result: FullAnalysisResult;
  createdAt: string;
  fileName: string;
}

const STORAGE_KEY = "adlens_analyses";

function getAll(): SavedAnalysis[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(analyses: SavedAnalysis[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
}

export const analysisStore = {
  getAll,

  getById(id: string): SavedAnalysis | undefined {
    return getAll().find((a) => a.id === id);
  },

  add(analysis: Omit<SavedAnalysis, "id" | "createdAt">): string {
    const all = getAll();
    const id = crypto.randomUUID();
    const entry: SavedAnalysis = {
      ...analysis,
      id,
      createdAt: new Date().toISOString(),
    };
    all.unshift(entry);
    save(all);
    return id;
  },

  remove(id: string) {
    const all = getAll().filter((a) => a.id !== id);
    save(all);
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
