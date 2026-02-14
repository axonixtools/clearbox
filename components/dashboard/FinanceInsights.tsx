"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Landmark, ReceiptText } from "lucide-react";
import type { EmailMetadata } from "@/lib/gmail";
import {
  extractFinanceTransactions,
  filterFinanceTransactions,
  formatFinanceAmount,
  getCurrencyGroups,
  getFinanceTotals,
  summarizeFinanceByProvider,
} from "@/lib/finance";
import styles from "./finance-insights.module.css";

interface FinanceInsightsProps {
  emails: EmailMetadata[];
}

export function FinanceInsights({ emails }: FinanceInsightsProps) {
  const transactions = extractFinanceTransactions(emails);
  const currencies = getCurrencyGroups(transactions);
  const activeCurrency = currencies[0] || "OTHER";
  const currencyTransactions = filterFinanceTransactions(transactions, { currency: activeCurrency });
  const totals = getFinanceTotals(currencyTransactions);
  const topProviders = summarizeFinanceByProvider(currencyTransactions).slice(0, 3);

  if (transactions.length === 0) {
    return (
      <article className={styles.financeCard}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Finance center</p>
            <h3 className={styles.title}>No finance activity found yet</h3>
            <p className={styles.subtitle}>
              Open the details page to refresh scan and manage provider groups like ABL, UBL, and NayaPay.
            </p>
          </div>
          <Link href="/dashboard/finance" className="btn btn-secondary">
            Open details
            <ChevronRight className="h-4 w-4" />
          </Link>
        </header>
      </article>
    );
  }

  return (
    <article className={styles.financeCard}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Finance center</p>
          <h3 className={styles.title}>Provider-based money view</h3>
          <p className={styles.subtitle}>
            Grouped by bank and wallet. Active currency: <strong>{activeCurrency}</strong>.
          </p>
        </div>
        <Link href="/dashboard/finance" className="btn btn-secondary">
          Open details
          <ChevronRight className="h-4 w-4" />
        </Link>
      </header>

      <div className={styles.statGrid}>
        <article className={styles.statCard}>
          <ArrowUpRight className="h-4 w-4 text-[var(--brand-700)]" />
          <p>Incoming</p>
          <h4>{formatFinanceAmount(totals.incomingTotal, activeCurrency)}</h4>
        </article>
        <article className={styles.statCard}>
          <ArrowDownRight className="h-4 w-4 text-[var(--accent-600)]" />
          <p>Outgoing</p>
          <h4>{formatFinanceAmount(totals.outgoingTotal, activeCurrency)}</h4>
        </article>
        <article className={styles.statCard}>
          <Landmark className="h-4 w-4 text-[var(--text-muted)]" />
          <p>Providers</p>
          <h4>{topProviders.length.toLocaleString()}</h4>
        </article>
        <article className={styles.statCard}>
          <ReceiptText className="h-4 w-4 text-[var(--text-muted)]" />
          <p>Transactions</p>
          <h4>{currencyTransactions.length.toLocaleString()}</h4>
        </article>
      </div>

      <div className={styles.providerPreview}>
        {topProviders.length === 0 ? (
          <p className={styles.emptyText}>No provider groups found in this currency.</p>
        ) : (
          topProviders.map((provider) => (
            <article key={provider.provider} className={styles.providerRow}>
              <div>
                <p className={styles.providerName}>{provider.provider}</p>
                <p className={styles.providerCount}>{provider.count.toLocaleString()} emails</p>
              </div>
              <p className={styles.providerNet}>Net {formatFinanceAmount(provider.net, activeCurrency)}</p>
            </article>
          ))
        )}
      </div>
    </article>
  );
}
