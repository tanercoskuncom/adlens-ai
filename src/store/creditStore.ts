export type PlanType = "free" | "solo" | "agency" | "enterprise";

export interface PlanConfig {
  name: string;
  label: string;
  monthlyCredits: number;
  maxCampaignsPerAnalysis: number;
  maxUsers: number;
  price: number;
  features: string[];
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    name: "free",
    label: "Free",
    monthlyCredits: 3,
    maxCampaignsPerAnalysis: 20,
    maxUsers: 1,
    price: 0,
    features: [
      "Aylık 3 analiz",
      "Max 20 kampanya/analiz",
      "Temel rapor",
    ],
  },
  solo: {
    name: "solo",
    label: "Solo",
    monthlyCredits: 30,
    maxCampaignsPerAnalysis: 30,
    maxUsers: 1,
    price: 19,
    features: [
      "Aylık 30 analiz",
      "Max 30 kampanya/analiz",
      "PDF export",
      "Analiz geçmişi",
    ],
  },
  agency: {
    name: "agency",
    label: "Agency",
    monthlyCredits: 150,
    maxCampaignsPerAnalysis: 50,
    maxUsers: 10,
    price: 79,
    features: [
      "Aylık 150 analiz",
      "Max 50 kampanya/analiz",
      "10 kullanıcı",
      "Müşteri yönetimi",
      "Markalı PDF",
      "Rol yönetimi",
    ],
  },
  enterprise: {
    name: "enterprise",
    label: "Enterprise",
    monthlyCredits: 500,
    maxCampaignsPerAnalysis: Infinity,
    maxUsers: Infinity,
    price: 199,
    features: [
      "Aylık 500 analiz",
      "Sınırsız kampanya",
      "Sınırsız kullanıcı",
      "Kendi API key",
      "White-label",
      "Custom domain",
    ],
  },
};

export interface CreditState {
  plan: PlanType;
  used: number;
  resetDate: string; // ISO date — aylık reset tarihi
}

const STORAGE_KEY = "adlens_credits";

function getDefaultState(): CreditState {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    plan: "free",
    used: 0,
    resetDate: nextMonth.toISOString(),
  };
}

function getState(): CreditState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const state: CreditState = JSON.parse(raw);
    // Ay değişmişse reset
    if (new Date(state.resetDate) <= new Date()) {
      const reset = getDefaultState();
      reset.plan = state.plan;
      save(reset);
      return reset;
    }
    return state;
  } catch {
    return getDefaultState();
  }
}

function save(state: CreditState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Kampanya sayısına göre kredi maliyeti hesapla
 */
function getCreditCost(campaignCount: number): number {
  if (campaignCount <= 5) return 1;
  if (campaignCount <= 20) return 3;
  return 5;
}

export const creditStore = {
  getState,

  getPlan(): PlanConfig {
    return PLANS[getState().plan];
  },

  getRemaining(): number {
    const state = getState();
    const plan = PLANS[state.plan];
    return Math.max(0, plan.monthlyCredits - state.used);
  },

  getUsed(): number {
    return getState().used;
  },

  getTotal(): number {
    const state = getState();
    return PLANS[state.plan].monthlyCredits;
  },

  getCreditCost,

  /**
   * Analiz yapılabilir mi kontrol et
   */
  canAnalyze(campaignCount: number): {
    allowed: boolean;
    reason?: string;
    cost: number;
  } {
    const state = getState();
    const plan = PLANS[state.plan];
    const cost = getCreditCost(campaignCount);
    const remaining = plan.monthlyCredits - state.used;

    if (campaignCount > plan.maxCampaignsPerAnalysis) {
      return {
        allowed: false,
        reason: `Bu plan en fazla ${plan.maxCampaignsPerAnalysis} kampanya destekler. Planınızı yükseltin.`,
        cost,
      };
    }

    if (remaining < cost) {
      return {
        allowed: false,
        reason: `Yeterli kredi yok. ${cost} kredi gerekli, ${remaining} kaldı.`,
        cost,
      };
    }

    return { allowed: true, cost };
  },

  /**
   * Kredi harca
   */
  spend(campaignCount: number): boolean {
    const check = this.canAnalyze(campaignCount);
    if (!check.allowed) return false;

    const state = getState();
    state.used += check.cost;
    save(state);
    return true;
  },

  /**
   * Plan değiştir
   */
  setPlan(plan: PlanType) {
    const state = getState();
    state.plan = plan;
    save(state);
  },

  /**
   * Reset (test/demo amaçlı)
   */
  reset() {
    save(getDefaultState());
  },
};
