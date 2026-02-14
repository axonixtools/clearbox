import type { EmailMetadata } from "./gmail";

export type FinanceDirection = "incoming" | "outgoing";
export type FinanceCurrency = "PKR" | "USD" | "EUR" | "GBP" | "INR" | "AED" | "OTHER";

export type FinanceTransaction = {
  id: string;
  dateKey: string;
  direction: FinanceDirection;
  amount: number;
  currency: FinanceCurrency;
  provider: string;
  subject: string;
  from: string;
  fromDomain: string;
};

export type DailyFinanceSummary = {
  dateKey: string;
  incoming: number;
  outgoing: number;
  count: number;
};

export type ProviderFinanceSummary = {
  provider: string;
  incoming: number;
  outgoing: number;
  net: number;
  count: number;
};

type FinanceFilter = {
  currency?: FinanceCurrency | "ALL";
  provider?: string | "ALL";
  direction?: "all" | FinanceDirection;
};

const INCOMING_HINTS = [
  "refund",
  "credited",
  "payment received",
  "deposit",
  "cashback",
  "payout",
  "income",
  "salary",
  "received",
  "transfer in",
  "amount added",
];

const OUTGOING_HINTS = [
  "charged",
  "payment due",
  "invoice",
  "order",
  "subscription",
  "debited",
  "receipt",
  "purchase",
  "spent",
  "pay now",
  "renewed",
  "bill",
  "transfer sent",
  "withdrawal",
  "deducted",
];

const FINANCE_HINTS = [
  ...INCOMING_HINTS,
  ...OUTGOING_HINTS,
  "usd",
  "dollar",
  "pkr",
  "rs",
  "eur",
  "gbp",
  "inr",
  "aed",
  "balance",
  "total",
  "amount",
  "bank",
  "wallet",
  "transaction",
];

const AMOUNT_REGEX =
  /(?:\u20A8|\u20B9|\u20AC|\u00A3|\$|pkr|usd|eur|gbp|inr|aed|rs\.?)?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi;

const PROVIDER_RULES: Array<{ provider: string; patterns: RegExp[] }> = [
  { provider: "NayaPay", patterns: [/\bnayapay\b/i] },
  { provider: "SadaPay", patterns: [/\bsadapay\b/i] },
  { provider: "JazzCash", patterns: [/\bjazzcash\b/i] },
  { provider: "Easypaisa", patterns: [/\beasypaisa\b/i] },
  { provider: "ABL", patterns: [/\babl\b/i, /\ballied bank\b/i] },
  { provider: "UBL", patterns: [/\bubl\b/i, /\bunited bank\b/i] },
  { provider: "HBL", patterns: [/\bhbl\b/i, /\bhabib bank\b/i] },
  { provider: "MCB", patterns: [/\bmcb\b/i, /\bmuslim commercial bank\b/i] },
  { provider: "Meezan Bank", patterns: [/\bmeezan\b/i] },
  { provider: "Bank Alfalah", patterns: [/\balfalah\b/i] },
  { provider: "Faysal Bank", patterns: [/\bfaysal\b/i] },
  { provider: "Askari Bank", patterns: [/\baskari\b/i] },
  { provider: "Standard Chartered", patterns: [/\bstandard chartered\b/i, /\bscb\b/i] },
  { provider: "JS Bank", patterns: [/\bjs bank\b/i, /\bjsbank\b/i] },
  { provider: "PayPal", patterns: [/\bpaypal\b/i] },
  { provider: "Stripe", patterns: [/\bstripe\b/i] },
  { provider: "Wise", patterns: [/\bwise\b/i] },
  { provider: "Visa", patterns: [/\bvisa\b/i] },
  { provider: "Mastercard", patterns: [/\bmastercard\b/i] },
];

const CURRENCY_PREFIX: Record<FinanceCurrency, string> = {
  PKR: "Rs",
  USD: "$",
  EUR: "EUR",
  GBP: "GBP",
  INR: "Rs",
  AED: "AED",
  OTHER: "",
};

function toISODate(dateRaw: string): string {
  const parsed = new Date(dateRaw);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

function extractLargestAmount(text: string): number | null {
  const matches = [...text.matchAll(AMOUNT_REGEX)];
  if (!matches.length) return null;

  const amounts = matches
    .map((match) => Number.parseFloat((match[1] || "").replace(/,/g, "")))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!amounts.length) return null;
  return Math.max(...amounts);
}

function inferDirection(text: string): FinanceDirection | null {
  if (INCOMING_HINTS.some((hint) => text.includes(hint))) return "incoming";
  if (OUTGOING_HINTS.some((hint) => text.includes(hint))) return "outgoing";
  return null;
}

function detectCurrency(text: string): FinanceCurrency {
  if (/\u20A8|\brs\.?\b|\bpkr\b/i.test(text)) return "PKR";
  if (/\u20AC|\beur\b/i.test(text)) return "EUR";
  if (/\u00A3|\bgbp\b/i.test(text)) return "GBP";
  if (/\u20B9|\binr\b/i.test(text)) return "INR";
  if (/\baed\b/i.test(text)) return "AED";
  if (/\$|\busd\b/i.test(text)) return "USD";
  return "OTHER";
}

function formatProviderFromDomain(domain: string): string {
  const normalized = domain.toLowerCase().replace(/^www\./, "");
  if (!normalized) return "Other";

  const pieces = normalized.split(".");
  const root = pieces.length >= 2 ? pieces[pieces.length - 2] : pieces[0];
  if (!root) return "Other";
  if (root.length <= 4) return root.toUpperCase();
  return `${root[0].toUpperCase()}${root.slice(1)}`;
}

function detectProvider(email: EmailMetadata): string {
  const source = `${email.from} ${email.fromDomain} ${email.subject} ${email.snippet || ""}`.toLowerCase();

  for (const rule of PROVIDER_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(source))) {
      return rule.provider;
    }
  }

  if (email.fromDomain) {
    return formatProviderFromDomain(email.fromDomain);
  }

  const firstWord = email.from.replace(/<.*>/, "").trim().split(/\s+/)[0];
  return firstWord || "Other";
}

function isLikelyFinanceEmail(haystack: string, amount: number | null): boolean {
  if (!amount) return false;
  if (FINANCE_HINTS.some((hint) => haystack.includes(hint))) return true;
  return amount >= 1;
}

export function formatFinanceAmount(value: number, currency: FinanceCurrency): string {
  const normalized = value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const prefix = CURRENCY_PREFIX[currency];

  if (!prefix) return normalized;
  if (prefix.length === 1 || prefix === "$") return `${prefix}${normalized}`;
  return `${prefix} ${normalized}`;
}

export function extractFinanceTransactions(emails: EmailMetadata[]): FinanceTransaction[] {
  const transactions: FinanceTransaction[] = [];

  for (const email of emails) {
    const text = `${email.subject} ${email.snippet || ""}`;
    const haystack = text.toLowerCase();
    const amount = extractLargestAmount(text);

    if (!isLikelyFinanceEmail(haystack, amount)) continue;

    transactions.push({
      id: email.id,
      dateKey: toISODate(email.date),
      direction: inferDirection(haystack) ?? "outgoing",
      amount: amount || 0,
      currency: detectCurrency(text),
      provider: detectProvider(email),
      subject: email.subject,
      from: email.from,
      fromDomain: email.fromDomain,
    });
  }

  return transactions.sort((a, b) => (a.dateKey > b.dateKey ? -1 : 1));
}

export function filterFinanceTransactions(
  transactions: FinanceTransaction[],
  filters: FinanceFilter = {},
): FinanceTransaction[] {
  return transactions.filter((transaction) => {
    if (filters.currency && filters.currency !== "ALL" && transaction.currency !== filters.currency) {
      return false;
    }
    if (filters.provider && filters.provider !== "ALL" && transaction.provider !== filters.provider) {
      return false;
    }
    if (filters.direction && filters.direction !== "all" && transaction.direction !== filters.direction) {
      return false;
    }
    return true;
  });
}

export function getCurrencyGroups(transactions: FinanceTransaction[]): FinanceCurrency[] {
  const countMap = new Map<FinanceCurrency, number>();

  for (const transaction of transactions) {
    countMap.set(transaction.currency, (countMap.get(transaction.currency) || 0) + 1);
  }

  return [...countMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([currency]) => currency);
}

export function getProviderGroups(transactions: FinanceTransaction[]): string[] {
  const countMap = new Map<string, number>();

  for (const transaction of transactions) {
    countMap.set(transaction.provider, (countMap.get(transaction.provider) || 0) + 1);
  }

  return [...countMap.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([provider]) => provider);
}

export function summarizeFinanceByDay(transactions: FinanceTransaction[]): DailyFinanceSummary[] {
  const dayMap = new Map<string, DailyFinanceSummary>();

  for (const transaction of transactions) {
    const existing = dayMap.get(transaction.dateKey) ?? {
      dateKey: transaction.dateKey,
      incoming: 0,
      outgoing: 0,
      count: 0,
    };

    if (transaction.direction === "incoming") {
      existing.incoming += transaction.amount;
    } else {
      existing.outgoing += transaction.amount;
    }

    existing.count += 1;
    dayMap.set(transaction.dateKey, existing);
  }

  return [...dayMap.values()].sort((a, b) => (a.dateKey > b.dateKey ? -1 : 1));
}

export function summarizeFinanceByProvider(transactions: FinanceTransaction[]): ProviderFinanceSummary[] {
  const providerMap = new Map<string, ProviderFinanceSummary>();

  for (const transaction of transactions) {
    const existing = providerMap.get(transaction.provider) ?? {
      provider: transaction.provider,
      incoming: 0,
      outgoing: 0,
      net: 0,
      count: 0,
    };

    if (transaction.direction === "incoming") {
      existing.incoming += transaction.amount;
    } else {
      existing.outgoing += transaction.amount;
    }

    existing.count += 1;
    existing.net = existing.incoming - existing.outgoing;
    providerMap.set(transaction.provider, existing);
  }

  return [...providerMap.values()].sort((a, b) => b.count - a.count || a.provider.localeCompare(b.provider));
}

export function getFinanceTotals(transactions: FinanceTransaction[]) {
  let incomingTotal = 0;
  let outgoingTotal = 0;

  for (const transaction of transactions) {
    if (transaction.direction === "incoming") {
      incomingTotal += transaction.amount;
    } else {
      outgoingTotal += transaction.amount;
    }
  }

  return {
    incomingTotal,
    outgoingTotal,
    netTotal: incomingTotal - outgoingTotal,
  };
}
