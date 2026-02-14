import type { EmailMetadata } from "./gmail";

export type FinanceDirection = "incoming" | "outgoing";
export type FinanceCurrency = string;

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
  /(?:[\p{Sc}]|[a-z]{3}|rs\.?)?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/giu;

const CURRENCY_CODE_PREFIX_REGEX =
  /\b([a-z]{3})\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi;
const CURRENCY_CODE_SUFFIX_REGEX =
  /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*([a-z]{3})\b/gi;

const CURRENCY_SYMBOL_TO_CODE: Record<string, string> = {
  "R$": "BRL",
  "A$": "AUD",
  "C$": "CAD",
  "NZ$": "NZD",
  "HK$": "HKD",
  "S$": "SGD",
  "\u20AC": "EUR",
  "\u00A3": "GBP",
  "\u00A5": "JPY",
  "\u20B9": "INR",
  "\u20A9": "KRW",
  "\u20BD": "RUB",
  "\u20BA": "TRY",
  "\u20AB": "VND",
  "\u20A6": "NGN",
  "\u20B1": "PHP",
  "\u20B4": "UAH",
  "\u20AA": "ILS",
  "\u0E3F": "THB",
  "\u20A8": "PKR",
  "$": "USD",
};

const ORDERED_CURRENCY_SYMBOLS = Object.entries(CURRENCY_SYMBOL_TO_CODE).sort(
  (a, b) => b[0].length - a[0].length,
);

const intlWithSupportedValues = Intl as typeof Intl & {
  supportedValuesOf?: (key: string) => string[];
};

const ISO_CURRENCIES = new Set(
  (intlWithSupportedValues.supportedValuesOf?.("currency") || []).map((code) => code.toUpperCase()),
);

const SECOND_LEVEL_TLD_PARTS = new Set([
  "co",
  "com",
  "org",
  "net",
  "gov",
  "edu",
  "ac",
]);

const DOMAIN_NOISE_PARTS = new Set([
  "www",
  "mail",
  "email",
  "mailer",
  "m",
  "app",
  "apps",
  "secure",
  "auth",
  "accounts",
  "account",
  "alerts",
  "alert",
  "notify",
  "notifications",
  "notification",
  "news",
  "updates",
  "update",
  "support",
  "help",
  "info",
  "service",
  "services",
  "team",
]);

const PROVIDER_STOP_WORDS = new Set([
  "no",
  "noreply",
  "reply",
  "notification",
  "notifications",
  "alerts",
  "alert",
  "support",
  "team",
  "info",
  "account",
  "accounts",
  "service",
  "services",
  "system",
  "automated",
  "message",
  "messages",
  "update",
  "updates",
  "mail",
  "email",
  "customer",
  "care",
]);

const WORD_JOINERS = new Set(["and", "of", "the", "for"]);

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
  for (const match of text.matchAll(CURRENCY_CODE_PREFIX_REGEX)) {
    const code = (match[1] || "").toUpperCase();
    if (ISO_CURRENCIES.has(code)) {
      return code;
    }
  }

  for (const match of text.matchAll(CURRENCY_CODE_SUFFIX_REGEX)) {
    const code = (match[2] || "").toUpperCase();
    if (ISO_CURRENCIES.has(code)) {
      return code;
    }
  }

  for (const [symbol, code] of ORDERED_CURRENCY_SYMBOLS) {
    if (text.includes(symbol)) {
      return code;
    }
  }

  if (/\brs\.?\b/i.test(text)) return "PKR";
  return "OTHER";
}

function extractDomainRoot(domain: string): string {
  const normalized = domain.toLowerCase().replace(/^www\./, "").replace(/\.+$/, "");
  if (!normalized) return "";

  const parts = normalized.split(".").filter(Boolean);
  if (!parts.length) return "";

  let rootIndex = Math.max(parts.length - 2, 0);
  if (rootIndex > 0 && SECOND_LEVEL_TLD_PARTS.has(parts[rootIndex])) {
    rootIndex -= 1;
  }

  for (let index = rootIndex; index >= 0; index -= 1) {
    const candidate = parts[index];
    if (!DOMAIN_NOISE_PARTS.has(candidate)) {
      return candidate;
    }
  }

  return parts[rootIndex] || parts[0] || "";
}

function formatToken(word: string): string {
  if (!word) return "";
  if (/[A-Z]/.test(word.slice(1))) return word;
  if (word.length <= 4 && /[a-z]/i.test(word)) return word.toUpperCase();
  return `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`;
}

function formatProviderWords(raw: string[]): string {
  const formatted = raw
    .map((part, index) => {
      const cleaned = part.replace(/[^a-z0-9&+]/gi, "");
      if (!cleaned || /^\d+$/.test(cleaned)) return "";
      const lower = cleaned.toLowerCase();
      if (index > 0 && WORD_JOINERS.has(lower)) return lower;
      return formatToken(cleaned);
    })
    .filter(Boolean);

  if (!formatted.length) return "Other";
  return formatted.slice(0, 4).join(" ");
}

function formatProviderFromDomain(domain: string): string {
  const root = extractDomainRoot(domain);
  if (!root) return "Other";

  const compactRoot = root.endsWith("mail") && root.length > 6 ? root.slice(0, -4) : root;
  const words = compactRoot.split(/[-_]+/).filter(Boolean);
  return formatProviderWords(words);
}

function formatProviderFromSenderName(sender: string): string {
  const sanitized = sender
    .replace(/<[^>]*>/g, " ")
    .replace(/["'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!sanitized) return "Other";

  const words = sanitized
    .split(/[\s|:/\\()[\],.]+/)
    .map((part) => part.replace(/[^a-z0-9&+]/gi, ""))
    .filter(Boolean)
    .filter((part) => !PROVIDER_STOP_WORDS.has(part.toLowerCase()));

  if (!words.length) return "Other";
  return formatProviderWords(words);
}

function normalizeProviderForCompare(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function detectProvider(email: EmailMetadata): string {
  const domainProvider = formatProviderFromDomain(email.fromDomain);
  const senderProvider = formatProviderFromSenderName(email.from);
  const subjectProvider = formatProviderFromSenderName(email.subject);

  if (domainProvider !== "Other") {
    if (senderProvider !== "Other") {
      const senderNorm = normalizeProviderForCompare(senderProvider);
      const domainNorm = normalizeProviderForCompare(domainProvider);
      if (
        senderNorm &&
        domainNorm &&
        (senderNorm.includes(domainNorm) || domainNorm.includes(senderNorm))
      ) {
        return senderProvider.length >= domainProvider.length ? senderProvider : domainProvider;
      }
    }
    return domainProvider;
  }

  if (senderProvider !== "Other") return senderProvider;
  if (subjectProvider !== "Other") return subjectProvider;

  return "Other";
}

function isLikelyFinanceEmail(haystack: string, amount: number | null): boolean {
  if (!amount) return false;
  if (FINANCE_HINTS.some((hint) => haystack.includes(hint))) return true;
  return amount >= 1;
}

export function formatFinanceAmount(value: number, currency: FinanceCurrency): string {
  const code = currency.toUpperCase();
  if (code !== "OTHER" && ISO_CURRENCIES.has(code)) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      // Fall back to plain formatting below.
    }
  }

  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
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
