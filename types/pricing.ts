export type PricingPlan = "free" | "pro";

export interface PricingUsage {
  plan: PricingPlan;
  clearedEmails: number;
  clearLimit: number | null;
  remainingClears: number | null;
  limitReached: boolean;
  upgradeUrl: string | null;
}

export interface ScanRateUsage {
  scansUsedToday: number;
  scansRemainingToday: number;
  scanLimitPerDay: number;
  limitReached: boolean;
  resetAt: string;
}
