import type { PricingUsage, ScanRateUsage } from "@/types/pricing";

const DEFAULT_FREE_CLEAR_LIMIT = 10_000;
const DEFAULT_SCAN_LIMIT_PER_DAY = 20;
const USAGE_KEY_PREFIX = "clearbox:pricing:cleared:";
const SCAN_RATE_KEY_PREFIX = "clearbox:rate:scan:";

type UpstashResponse = {
  result: string | number | null;
};

type UsageStoreGlobals = typeof globalThis & {
  __clearboxUsageStore?: Map<string, number>;
};

const usageStoreGlobals = globalThis as UsageStoreGlobals;
const fallbackUsageStore =
  usageStoreGlobals.__clearboxUsageStore ??
  (usageStoreGlobals.__clearboxUsageStore = new Map<string, number>());

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function getFreeClearLimit(): number {
  return parsePositiveInteger(process.env.CLEARBOX_FREE_CLEAR_LIMIT, DEFAULT_FREE_CLEAR_LIMIT);
}

function getUpgradeUrl(): string | null {
  const configured = process.env.CLEARBOX_UPGRADE_URL?.trim();
  return configured ? configured : null;
}

function getScanLimitPerDay(): number {
  return parsePositiveInteger(process.env.CLEARBOX_SCAN_LIMIT_PER_DAY, DEFAULT_SCAN_LIMIT_PER_DAY);
}

function getPaidEmailSet(): Set<string> {
  const configured = process.env.CLEARBOX_PRO_EMAILS ?? process.env.PAID_USER_EMAILS ?? "";

  return new Set(
    configured
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

function getUsageKey(email: string): string {
  return `${USAGE_KEY_PREFIX}${email}`;
}

function getScanRateKey(email: string, dateKey: string): string {
  return `${SCAN_RATE_KEY_PREFIX}${email}:${dateKey}`;
}

function parseUsageCount(value: string | number | null): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 0;
}

function getUpstashConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim();
  if (!url || !token) return null;

  return {
    url: url.replace(/\/+$/, ""),
    token,
  };
}

async function getUsageCountFromStore(email: string): Promise<number> {
  return getCounterValueFromStore(getUsageKey(email));
}

async function incrementUsageCountInStore(email: string, incrementBy: number): Promise<number> {
  return incrementCounterValueInStore(getUsageKey(email), incrementBy);
}

async function getCounterValueFromStore(key: string): Promise<number> {
  const upstash = getUpstashConfig();

  if (upstash) {
    try {
      const response = await fetch(`${upstash.url}/get/${encodeURIComponent(key)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${upstash.token}`,
        },
        cache: "no-store",
      });

      if (response.ok) {
        const payload = (await response.json()) as UpstashResponse;
        return parseUsageCount(payload.result);
      }

      console.error(`Usage GET failed (${response.status})`);
    } catch (error) {
      console.error("Usage GET request failed:", error);
    }
  }

  return fallbackUsageStore.get(key) || 0;
}

async function incrementCounterValueInStore(key: string, incrementBy: number): Promise<number> {
  const upstash = getUpstashConfig();

  if (upstash) {
    try {
      const response = await fetch(
        `${upstash.url}/incrby/${encodeURIComponent(key)}/${incrementBy}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${upstash.token}`,
          },
          cache: "no-store",
        },
      );

      if (response.ok) {
        const payload = (await response.json()) as UpstashResponse;
        return parseUsageCount(payload.result);
      }

      console.error(`Usage INCRBY failed (${response.status})`);
    } catch (error) {
      console.error("Usage INCRBY request failed:", error);
    }
  }

  const current = fallbackUsageStore.get(key) || 0;
  const next = current + incrementBy;
  fallbackUsageStore.set(key, next);
  return next;
}

function buildUsageSnapshot(email: string, clearedEmails: number): PricingUsage {
  const isPro = getPaidEmailSet().has(email);
  const upgradeUrl = getUpgradeUrl();

  if (isPro) {
    return {
      plan: "pro",
      clearedEmails,
      clearLimit: null,
      remainingClears: null,
      limitReached: false,
      upgradeUrl,
    };
  }

  const clearLimit = getFreeClearLimit();
  const remainingClears = Math.max(clearLimit - clearedEmails, 0);

  return {
    plan: "free",
    clearedEmails,
    clearLimit,
    remainingClears,
    limitReached: remainingClears <= 0,
    upgradeUrl,
  };
}

function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

function buildLimitReachedMessage(usage: PricingUsage): string {
  if (usage.plan === "pro" || usage.clearLimit === null) {
    return "Action blocked by pricing policy.";
  }

  const upgradeHint = usage.upgradeUrl ? " Upgrade to continue clearing emails." : "";
  return `You reached the free limit of ${formatCount(usage.clearLimit)} cleared emails.${upgradeHint}`;
}

function buildRemainingMessage(requestedCount: number, remaining: number, usage: PricingUsage): string {
  const upgradeHint = usage.upgradeUrl ? " Select fewer emails or upgrade to continue." : " Select fewer emails to continue.";

  return `This action needs ${formatCount(requestedCount)} clears, but you only have ${formatCount(remaining)} free clears left.${upgradeHint}`;
}

export function normalizeUserEmail(email: string | null | undefined): string | null {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
}

function getUtcDateKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function getNextUtcMidnightIso(now: Date): string {
  const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return nextMidnight.toISOString();
}

function buildScanRateSnapshot(scansUsedToday: number, limit: number, resetAt: string): ScanRateUsage {
  return {
    scansUsedToday,
    scansRemainingToday: Math.max(limit - scansUsedToday, 0),
    scanLimitPerDay: limit,
    limitReached: scansUsedToday >= limit,
    resetAt,
  };
}

function formatUtcResetTime(iso: string): string {
  return iso.replace(".000Z", "Z");
}

function buildScanRateLimitMessage(scanRate: ScanRateUsage): string {
  return `You reached the scan limit of ${formatCount(scanRate.scanLimitPerDay)} scans today. Try again after ${formatUtcResetTime(scanRate.resetAt)}.`;
}

export async function getPricingUsage(email: string): Promise<PricingUsage> {
  const normalizedEmail = normalizeUserEmail(email);
  if (!normalizedEmail) {
    throw new Error("MISSING_USER_EMAIL");
  }

  const usageCount = await getUsageCountFromStore(normalizedEmail);
  return buildUsageSnapshot(normalizedEmail, usageCount);
}

export async function checkClearAllowance(
  email: string,
  requestedCount: number,
): Promise<{ allowed: true; usage: PricingUsage } | { allowed: false; usage: PricingUsage; message: string }> {
  const usage = await getPricingUsage(email);

  if (usage.plan === "pro") {
    return { allowed: true, usage };
  }

  const remaining = usage.remainingClears || 0;
  if (remaining <= 0) {
    return {
      allowed: false,
      usage,
      message: buildLimitReachedMessage(usage),
    };
  }

  if (requestedCount > remaining) {
    return {
      allowed: false,
      usage,
      message: buildRemainingMessage(requestedCount, remaining, usage),
    };
  }

  return { allowed: true, usage };
}

export async function recordClearedEmails(email: string, processedCount: number): Promise<PricingUsage> {
  const normalizedEmail = normalizeUserEmail(email);
  if (!normalizedEmail) {
    throw new Error("MISSING_USER_EMAIL");
  }

  if (processedCount <= 0) {
    return getPricingUsage(normalizedEmail);
  }

  const updatedUsageCount = await incrementUsageCountInStore(normalizedEmail, processedCount);
  return buildUsageSnapshot(normalizedEmail, updatedUsageCount);
}

export async function checkAndRecordScanAllowance(
  email: string,
): Promise<{ allowed: true; scanRate: ScanRateUsage } | { allowed: false; scanRate: ScanRateUsage; message: string }> {
  const normalizedEmail = normalizeUserEmail(email);
  if (!normalizedEmail) {
    throw new Error("MISSING_USER_EMAIL");
  }

  const now = new Date();
  const dateKey = getUtcDateKey(now);
  const scanLimit = getScanLimitPerDay();
  const resetAt = getNextUtcMidnightIso(now);
  const scanRateKey = getScanRateKey(normalizedEmail, dateKey);

  const scansUsedToday = await incrementCounterValueInStore(scanRateKey, 1);
  const scanRate = buildScanRateSnapshot(scansUsedToday, scanLimit, resetAt);

  if (scansUsedToday > scanLimit) {
    return {
      allowed: false,
      scanRate,
      message: buildScanRateLimitMessage(scanRate),
    };
  }

  return {
    allowed: true,
    scanRate,
  };
}
