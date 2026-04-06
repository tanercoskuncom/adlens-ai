const STORAGE_KEY = "adlens_settings";

export interface AppSettings {
  workspaceName: string;
  language: "tr" | "en";
  turkeyMarket: boolean;
  weeklyEmail: boolean;
  metaToken: string;
  metaUserName: string;
}

const DEFAULTS: AppSettings = {
  workspaceName: "Workspace",
  language: "tr",
  turkeyMarket: true,
  weeklyEmail: false,
  metaToken: "",
  metaUserName: "",
};

function load(): AppSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function save(settings: AppSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const settingsStore = {
  get(): AppSettings {
    return load();
  },

  set(partial: Partial<AppSettings>) {
    const current = load();
    const updated = { ...current, ...partial };
    save(updated);
    return updated;
  },

  reset() {
    save(DEFAULTS);
    return DEFAULTS;
  },
};
