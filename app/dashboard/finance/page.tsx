"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Landmark,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import type { EmailMetadata } from "@/lib/gmail";
import type { PricingUsage } from "@/types/pricing";
import {
  type FinanceCurrency,
  type FinanceDirection,
  type FinanceTransaction,
  extractFinanceTransactions,
  filterFinanceTransactions,
  formatFinanceAmount,
  getCurrencyGroups,
  getFinanceTotals,
  getProviderGroups,
  summarizeFinanceByDay,
  summarizeFinanceByProvider,
} from "@/lib/finance";
import styles from "./finance.module.css";

type EmailBuckets = {
  newsletters: EmailMetadata[];
  social: EmailMetadata[];
  receipts: EmailMetadata[];
  other: EmailMetadata[];
};

type ScanResponse = {
  emails: EmailBuckets;
  usage?: PricingUsage;
};

type CachedScan = {
  emails: EmailBuckets;
  scannedAt: string;
};

const SCAN_STORAGE_KEY = "clearbox-last-scan";

function flattenBuckets(buckets: EmailBuckets): EmailMetadata[] {
  return [
    ...buckets.newsletters,
    ...buckets.social,
    ...buckets.receipts,
    ...buckets.other,
  ];
}

function toDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function parseApiError(raw: string): { message: string; usage?: PricingUsage } {
  try {
    const payload = JSON.parse(raw) as { error?: string; usage?: PricingUsage };
    if (payload?.error) return { message: payload.error, usage: payload.usage };
  } catch {
    // Fall back to plain text.
  }
  return { message: raw || "Request failed." };
}

function readCachedScan(): CachedScan | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SCAN_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CachedScan;
    if (!parsed?.emails) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedScan(cache: CachedScan) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SCAN_STORAGE_KEY, JSON.stringify(cache));
}

function pruneCachedScanByIds(idsToRemove: Set<string>) {
  const cached = readCachedScan();
  if (!cached) return;

  const next: EmailBuckets = {
    newsletters: cached.emails.newsletters.filter(
      (email) => !idsToRemove.has(email.id),
    ),
    social: cached.emails.social.filter((email) => !idsToRemove.has(email.id)),
    receipts: cached.emails.receipts.filter(
      (email) => !idsToRemove.has(email.id),
    ),
    other: cached.emails.other.filter((email) => !idsToRemove.has(email.id)),
  };

  writeCachedScan({
    emails: next,
    scannedAt: cached.scannedAt,
  });
}

export default function FinancePage() {
  const { status } = useSession();
  const router = useRouter();

  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);
  const [usage, setUsage] = useState<PricingUsage | null>(null);

  const [selectedCurrency, setSelectedCurrency] =
    useState<FinanceCurrency>("OTHER");
  const [selectedProvider, setSelectedProvider] = useState("ALL");
  const [flowFilter, setFlowFilter] = useState<"all" | FinanceDirection>("all");

  const currencies = useMemo(
    () => getCurrencyGroups(transactions),
    [transactions],
  );
  const activeCurrency = currencies.includes(selectedCurrency)
    ? selectedCurrency
    : currencies[0] || "OTHER";

  const currencyTransactions = useMemo(
    () => filterFinanceTransactions(transactions, { currency: activeCurrency }),
    [transactions, activeCurrency],
  );
  const providerGroups = useMemo(
    () => getProviderGroups(currencyTransactions),
    [currencyTransactions],
  );
  const providerTabs = useMemo(
    () => ["ALL", ...providerGroups],
    [providerGroups],
  );
  const activeProvider = providerTabs.includes(selectedProvider)
    ? selectedProvider
    : "ALL";

  const visibleTransactions = useMemo(
    () =>
      filterFinanceTransactions(currencyTransactions, {
        provider: activeProvider,
        direction: flowFilter,
      }),
    [currencyTransactions, activeProvider, flowFilter],
  );

  const totals = useMemo(
    () => getFinanceTotals(visibleTransactions),
    [visibleTransactions],
  );
  const fullCurrencyTotals = useMemo(
    () => getFinanceTotals(currencyTransactions),
    [currencyTransactions],
  );
  const daySummary = useMemo(
    () => summarizeFinanceByDay(visibleTransactions).slice(0, 14).reverse(),
    [visibleTransactions],
  );
  const providerSummary = useMemo(
    () => summarizeFinanceByProvider(currencyTransactions),
    [currencyTransactions],
  );
  const maxBarValue = useMemo(
    () =>
      Math.max(
        ...daySummary.map((day) => Math.max(day.incoming, day.outgoing)),
        1,
      ),
    [daySummary],
  );
  const isFreeLimitReached = usage?.plan === "free" && usage.limitReached;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (!currencies.length) return;
    if (!currencies.includes(selectedCurrency)) {
      setSelectedCurrency(currencies[0]);
    }
  }, [currencies, selectedCurrency]);

  useEffect(() => {
    if (!providerTabs.length) return;
    if (!providerTabs.includes(selectedProvider)) {
      setSelectedProvider("ALL");
    }
  }, [providerTabs, selectedProvider]);

  const refreshFromInbox = async () => {
    setIsRefreshing(true);
    setError(null);
    setNotice("");

    try {
      const res = await fetch("/api/gmail/scan");
      if (!res.ok) {
        throw new Error(parseApiError(await res.text()).message);
      }

      const data = (await res.json()) as ScanResponse;
      const scannedAt = new Date().toISOString();
      const nextTransactions = extractFinanceTransactions(
        flattenBuckets(data.emails),
      );
      setTransactions(nextTransactions);
      setLastScanAt(scannedAt);
      setUsage(data.usage || null);
      writeCachedScan({ emails: data.emails, scannedAt });
      setNotice("Finance scan updated.");
    } catch (caughtError: unknown) {
      const caught = caughtError as { message?: string };
      setError(caught.message || "Failed to refresh finance scan.");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;

    const cached = readCachedScan();
    if (cached) {
      setTransactions(
        extractFinanceTransactions(flattenBuckets(cached.emails)),
      );
      setLastScanAt(cached.scannedAt);
      setIsLoading(false);
      return;
    }

    void refreshFromInbox();
  }, [status]);

  const archiveProviderGroup = async (provider: string) => {
    if (isFreeLimitReached) {
      setError(
        usage?.upgradeUrl
          ? "Free clear limit reached. Upgrade your plan to continue."
          : "Free clear limit reached.",
      );
      return;
    }

    const ids = [
      ...new Set(
        currencyTransactions
          .filter((transaction) => transaction.provider === provider)
          .map((transaction) => transaction.id),
      ),
    ];

    if (ids.length === 0) {
      setNotice("No emails available in this provider group.");
      return;
    }

    setIsArchiving(true);
    setError(null);
    setNotice("");

    try {
      const res = await fetch("/api/gmail/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIds: ids, action: "archive" }),
      });

      if (!res.ok) {
        const parsedError = parseApiError(await res.text());
        if (parsedError.usage) {
          setUsage(parsedError.usage);
        }
        throw new Error(parsedError.message);
      }

      const payload = (await res.json()) as { message?: string; usage?: PricingUsage };
      if (payload.usage) {
        setUsage(payload.usage);
      }

      const idSet = new Set(ids);
      setTransactions((current) =>
        current.filter((transaction) => !idSet.has(transaction.id)),
      );
      pruneCachedScanByIds(idSet);
      setNotice(payload.message || `Archived ${ids.length.toLocaleString()} emails from ${provider}.`);
    } catch (caughtError: unknown) {
      const caught = caughtError as { message?: string };
      setError(caught.message || "Failed to archive provider group.");
    } finally {
      setIsArchiving(false);
    }
  };

  const archiveCurrentGroup = async () => {
    if (activeProvider === "ALL") return;
    await archiveProviderGroup(activeProvider);
  };

  const lastScanLabel = lastScanAt
    ? new Date(lastScanAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Not scanned yet";

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <Link href="/dashboard" className={styles.backLink}>
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <header className={styles.hero}>
            <div>
              <p className={styles.kicker}>Finance details</p>
              <h1 className={styles.title}>Provider-level finance control</h1>
              <p className={styles.subtitle}>
                Separate banks and wallets, combine everything in one view, and
                remove entire provider groups.
              </p>
            </div>
            <div className={styles.heroActions}>
              <button
                className="btn btn-secondary"
                onClick={refreshFromInbox}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh scan"}
              </button>
              <button
                className="btn btn-primary"
                onClick={archiveCurrentGroup}
                disabled={activeProvider === "ALL" || isArchiving || isFreeLimitReached}
              >
                <Trash2 className="h-4 w-4" />
                {isArchiving ? "Archiving..." : "Remove selected group"}
              </button>
            </div>
          </header>

          <div className={styles.metaRow}>
            <p className={styles.metaItem}>Last scan {lastScanLabel}</p>
            <p className={styles.metaItem}>Currency {activeCurrency}</p>
            <p className={styles.metaItem}>
              {currencyTransactions.length.toLocaleString()} finance emails
            </p>
          </div>

          {usage ? (
            <section className={styles.usagePanel}>
              <p className={styles.usageLabel}>{usage.plan === "pro" ? "Pro plan" : "Free plan usage"}</p>
              <p className={styles.usageValue}>
                {usage.plan === "free" && usage.clearLimit !== null
                  ? `${usage.clearedEmails.toLocaleString()} / ${usage.clearLimit.toLocaleString()} clears used`
                  : `${usage.clearedEmails.toLocaleString()} clears processed`}
              </p>
              <p className={styles.usageHint}>
                {usage.plan === "free" && usage.remainingClears !== null
                  ? `${usage.remainingClears.toLocaleString()} free clears remaining`
                  : "Unlimited clears active"}
              </p>
              {usage.limitReached && usage.upgradeUrl ? (
                <a href={usage.upgradeUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                  Upgrade plan
                </a>
              ) : null}
            </section>
          ) : null}

          {error ? <p className={styles.error}>{error}</p> : null}
          {notice ? <p className={styles.notice}>{notice}</p> : null}

          {isLoading ? (
            <section className={styles.loadingPanel}>
              <div className="skeleton h-5 w-44 mb-4" />
              <div className="skeleton h-4 w-72 mb-3" />
              <div className="skeleton h-4 w-60 mb-8" />
              <div className="skeleton h-11 w-40" />
            </section>
          ) : transactions.length === 0 ? (
            <section className={styles.emptyState}>
              <h2>No finance emails found yet</h2>
              <p>Run a fresh scan after your next inbox updates.</p>
              <button
                className="btn btn-secondary"
                onClick={refreshFromInbox}
                disabled={isRefreshing}
              >
                Refresh now
              </button>
            </section>
          ) : (
            <>
              <section className={styles.filtersPanel}>
                <label className={styles.filterField}>
                  <span>Currency</span>
                  <select
                    value={activeCurrency}
                    onChange={(event) =>
                      setSelectedCurrency(event.target.value as FinanceCurrency)
                    }
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.filterField}>
                  <span>Provider</span>
                  <select
                    value={activeProvider}
                    onChange={(event) =>
                      setSelectedProvider(event.target.value)
                    }
                  >
                    {providerTabs.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider === "ALL"
                          ? "All providers (combined)"
                          : provider}
                      </option>
                    ))}
                  </select>
                </label>

                <div className={styles.filterField}>
                  <span>Direction</span>
                  <div className={styles.flowButtons}>
                    <button
                      className={`btn btn-ghost ${flowFilter === "all" ? styles.filterActive : ""}`}
                      onClick={() => setFlowFilter("all")}
                    >
                      All
                    </button>
                    <button
                      className={`btn btn-ghost ${flowFilter === "incoming" ? styles.filterActive : ""}`}
                      onClick={() => setFlowFilter("incoming")}
                    >
                      Incoming
                    </button>
                    <button
                      className={`btn btn-ghost ${flowFilter === "outgoing" ? styles.filterActive : ""}`}
                      onClick={() => setFlowFilter("outgoing")}
                    >
                      Outgoing
                    </button>
                  </div>
                </div>
              </section>

              <section className={styles.providerTabs}>
                {providerTabs.map((provider) => (
                  <button
                    key={provider}
                    className={`${styles.providerTab} ${activeProvider === provider ? styles.providerTabActive : ""}`}
                    onClick={() => setSelectedProvider(provider)}
                  >
                    {provider === "ALL" ? "All providers" : provider}
                  </button>
                ))}
              </section>

              <section className={styles.statGrid}>
                <article className={styles.statCard}>
                  <ArrowUpRight className="h-4 w-4 text-[var(--brand-700)]" />
                  <p>Incoming</p>
                  <h3>
                    {formatFinanceAmount(totals.incomingTotal, activeCurrency)}
                  </h3>
                </article>
                <article className={styles.statCard}>
                  <ArrowDownRight className="h-4 w-4 text-[var(--accent-600)]" />
                  <p>Outgoing</p>
                  <h3>
                    {formatFinanceAmount(totals.outgoingTotal, activeCurrency)}
                  </h3>
                </article>
                <article className={styles.statCard}>
                  <Landmark className="h-4 w-4 text-[var(--text-muted)]" />
                  <p>Net</p>
                  <h3>
                    {formatFinanceAmount(totals.netTotal, activeCurrency)}
                  </h3>
                </article>
                <article className={styles.statCard}>
                  <CalendarDays className="h-4 w-4 text-[var(--text-muted)]" />
                  <p>Visible emails</p>
                  <h3>{visibleTransactions.length.toLocaleString()}</h3>
                </article>
              </section>

              <section className={styles.doublePanel}>
                <article className={styles.panel}>
                  <h2>Daily movement</h2>
                  <p className={styles.panelHint}>
                    Incoming and outgoing amounts by date.
                  </p>
                  <div className={styles.chartRows}>
                    {daySummary.length === 0 ? (
                      <p className={styles.emptyText}>
                        No entries in this filter.
                      </p>
                    ) : (
                      daySummary.map((day) => (
                        <div key={day.dateKey} className={styles.chartRow}>
                          <span className={styles.chartDate}>
                            {toDateLabel(day.dateKey)}
                          </span>
                          <div className={styles.chartBars}>
                            <div
                              className={styles.incomingBar}
                              style={{
                                width: `${Math.max((day.incoming / maxBarValue) * 100, day.incoming > 0 ? 6 : 0)}%`,
                              }}
                            />
                            <div
                              className={styles.outgoingBar}
                              style={{
                                width: `${Math.max((day.outgoing / maxBarValue) * 100, day.outgoing > 0 ? 6 : 0)}%`,
                              }}
                            />
                          </div>
                          <span className={styles.chartValue}>
                            +{formatFinanceAmount(day.incoming, activeCurrency)}{" "}
                            / -
                            {formatFinanceAmount(day.outgoing, activeCurrency)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </article>

                <article className={styles.panel}>
                  <h2>Provider groups</h2>
                  <p className={styles.panelHint}>
                    Archive one provider group at a time.
                  </p>
                  <div className={styles.providerRows}>
                    {providerSummary.length === 0 ? (
                      <p className={styles.emptyText}>
                        No provider groups in this currency.
                      </p>
                    ) : (
                      providerSummary.map((provider) => (
                        <article
                          key={provider.provider}
                          className={styles.providerRow}
                        >
                          <div>
                            <p className={styles.providerName}>
                              {provider.provider}
                            </p>
                            <p className={styles.providerMeta}>
                              {provider.count.toLocaleString()} emails
                            </p>
                          </div>
                          <div className={styles.providerStats}>
                            <span className={styles.incomingText}>
                              +
                              {formatFinanceAmount(
                                provider.incoming,
                                activeCurrency,
                              )}
                            </span>
                            <span className={styles.outgoingText}>
                              -
                              {formatFinanceAmount(
                                provider.outgoing,
                                activeCurrency,
                              )}
                            </span>
                            <span className={styles.netText}>
                              Net{" "}
                              {formatFinanceAmount(
                                provider.net,
                                activeCurrency,
                              )}
                            </span>
                            <button
                              className="btn btn-secondary"
                              onClick={() =>
                                archiveProviderGroup(provider.provider)
                              }
                              disabled={isArchiving || isFreeLimitReached}
                            >
                              Remove group
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </article>
              </section>

              <section className={styles.panel}>
                <h2>Detailed email transactions</h2>
                <p className={styles.panelHint}>
                  Showing {visibleTransactions.length.toLocaleString()} filtered
                  entries out of{" "}
                  {fullCurrencyTotals.incomingTotal +
                    fullCurrencyTotals.outgoingTotal >
                  0
                    ? currencyTransactions.length.toLocaleString()
                    : "0"}{" "}
                  in {activeCurrency}.
                </p>
                <div className={styles.transactionRows}>
                  {visibleTransactions.length === 0 ? (
                    <p className={styles.emptyText}>
                      No entries match current filters.
                    </p>
                  ) : (
                    visibleTransactions.slice(0, 120).map((transaction) => (
                      <article
                        key={transaction.id}
                        className={styles.transactionRow}
                      >
                        <div>
                          <p className={styles.transactionSubject}>
                            {transaction.subject}
                          </p>
                          <p className={styles.transactionMeta}>
                            {transaction.provider} |{" "}
                            {toDateLabel(transaction.dateKey)} |{" "}
                            {transaction.from}
                          </p>
                        </div>
                        <p
                          className={
                            transaction.direction === "incoming"
                              ? styles.incomingAmount
                              : styles.outgoingAmount
                          }
                        >
                          {transaction.direction === "incoming" ? "+" : "-"}
                          {formatFinanceAmount(
                            transaction.amount,
                            transaction.currency,
                          )}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
