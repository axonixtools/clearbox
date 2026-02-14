"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/landing/Navbar";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { CategoryCard } from "@/components/dashboard/CategoryCard";
import { RoastDisplay } from "@/components/dashboard/RoastDisplay";
import { CelebrationScreen } from "@/components/dashboard/CelebrationScreen";
import { FinanceInsights } from "@/components/dashboard/FinanceInsights";
import { Footer } from "@/components/landing/Footer";
import { EmailStats } from "@/lib/categorize";
import type { EmailMetadata } from "@/lib/gmail";
import styles from "./dashboard.module.css";

type DashboardState = "WELCOME" | "SCANNING" | "RESULTS" | "ROASTING" | "CELEBRATED";
type CategoryType = "newsletters" | "social" | "receipts" | "other";
type EmailBuckets = {
  newsletters: EmailMetadata[];
  social: EmailMetadata[];
  receipts: EmailMetadata[];
  other: EmailMetadata[];
};

type CachedScan = {
  emails: EmailBuckets;
  scannedAt: string;
};

const SCAN_STORAGE_KEY = "clearbox-last-scan";

function cacheScan(emails: EmailBuckets, scannedAt: string) {
  if (typeof window === "undefined") return;
  const payload: CachedScan = { emails, scannedAt };
  sessionStorage.setItem(SCAN_STORAGE_KEY, JSON.stringify(payload));
}

function updateCachedEmails(emails: EmailBuckets) {
  if (typeof window === "undefined") return;

  const raw = sessionStorage.getItem(SCAN_STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw) as CachedScan;
    cacheScan(emails, parsed.scannedAt || new Date().toISOString());
  } catch {
    cacheScan(emails, new Date().toISOString());
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [state, setState] = useState<DashboardState>("WELCOME");
  const [emails, setEmails] = useState<EmailBuckets | null>(null);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [shameScore, setShameScore] = useState<{ score: number; label: string; description: string } | null>(
    null,
  );
  const [scanMeta, setScanMeta] = useState<{ scannedAt: string; initialTotal: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialTotal = scanMeta?.initialTotal ?? stats?.total ?? 0;
  const cleanedCount = Math.max(initialTotal - (stats?.total ?? 0), 0);
  const completion = initialTotal > 0 ? Math.round((cleanedCount / initialTotal) * 100) : 100;
  const activeCategories = stats
    ? [stats.newsletters, stats.social, stats.receipts, stats.other].filter((count) => count > 0).length
    : 0;
  const lastScanLabel = scanMeta
    ? new Date(scanMeta.scannedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "just now";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleScan = async () => {
    setState("SCANNING");
    setError(null);

    try {
      const res = await fetch("/api/gmail/scan");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to scan emails");
      }

      const data = await res.json();
      setEmails(data.emails);
      setStats(data.stats);
      setShameScore(data.shameScore);
      const scannedAt = new Date().toISOString();
      setScanMeta({ scannedAt, initialTotal: data.stats.total });
      cacheScan(data.emails, scannedAt);
      setState("RESULTS");
    } catch (err: unknown) {
      const caught = err as { message?: string };
      setError(caught.message || "Failed to scan emails");
      setState("WELCOME");
    }
  };

  const handleResolveEmails = (messageIds: string[], category: CategoryType) => {
    if (!emails || !stats) return;

    const newEmails: EmailBuckets = { ...emails };
    const existingInCategory = newEmails[category];
    const idsToRemove = new Set(messageIds);
    const updatedCategoryEmails = existingInCategory.filter((email) => !idsToRemove.has(email.id));
    const removedCount = existingInCategory.length - updatedCategoryEmails.length;
    newEmails[category] = updatedCategoryEmails;
    setEmails(newEmails);
    updateCachedEmails(newEmails);

    const newStats = { ...stats };
    newStats[category] = updatedCategoryEmails.length;
    newStats.total = Math.max(0, newStats.total - removedCount);
    setStats(newStats);

    if (newStats.total === 0) {
      setState("CELEBRATED");
    }
  };

  if (status === "loading") {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingCard}>
          <div className="skeleton h-10 w-52 mb-5" />
          <div className="skeleton h-4 w-80 mb-3" />
          <div className="skeleton h-4 w-64 mb-10" />
          <div className="skeleton h-11 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardLayout}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          {state === "WELCOME" && (
            <section className={`${styles.stateCard} animate-fade-in-up`}>
              <p className={styles.kicker}>Dashboard</p>
              <h1 className={styles.title}>
                Ready for an inbox reset{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}?
              </h1>
              <p className={styles.subtitle}>
                Scan your unread email, review smart categories, and clean everything in focused batches.
              </p>
              <div className={styles.actionsRow}>
                <button onClick={handleScan} className="btn btn-primary btn-xl animate-pulse-glow">
                  Scan unread emails
                </button>
              </div>
              {error && <p className={styles.error}>{error}</p>}
            </section>
          )}

          {state === "SCANNING" && (
            <section className={`${styles.stateCard} ${styles.scanningCard} animate-fade-in`}>
              <div className={styles.spinner} aria-hidden />
              <h2 className={styles.title}>Scanning your inbox</h2>
              <p className={styles.subtitle}>
                Pulling unread counts and category previews. This usually takes a few seconds.
              </p>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} />
              </div>
            </section>
          )}

          {(state === "RESULTS" || state === "ROASTING") && stats && shameScore && (
            <section className="animate-fade-in">
              <header className={styles.dashboardHeader}>
                <p className={styles.kicker}>Analysis complete</p>
                <h1 className={styles.title}>Your inbox damage report</h1>
                <p className={styles.subtitle}>
                  Review category totals, generate your roast, then archive what you no longer need.
                </p>
              </header>

              <div className={styles.headerTools}>
                <div className={styles.summaryPills}>
                  <p className={styles.summaryPill}>Progress {completion}% complete</p>
                  <p className={styles.summaryPill}>
                    {cleanedCount.toLocaleString()} cleaned / {initialTotal.toLocaleString()} scanned
                  </p>
                  <p className={styles.summaryPill}>Active categories {activeCategories}/4</p>
                  <p className={styles.summaryPill}>Last scan {lastScanLabel}</p>
                </div>
                <button onClick={handleScan} className="btn btn-secondary">
                  Rescan inbox
                </button>
              </div>

              <StatsOverview stats={stats} shameScore={shameScore} onStartRoast={() => setState("ROASTING")} />

              {state === "ROASTING" && <RoastDisplay stats={stats} onDone={() => {}} />}

              <section className={styles.categoriesWrap}>
                <p className={styles.sectionLabel}>Email categories and finance</p>
                <div className={styles.categoriesGrid}>
                  <CategoryCard
                    type="newsletters"
                    emails={emails?.newsletters || []}
                    onResolve={handleResolveEmails}
                  />
                  <CategoryCard type="social" emails={emails?.social || []} onResolve={handleResolveEmails} />
                  <CategoryCard type="receipts" emails={emails?.receipts || []} onResolve={handleResolveEmails} />
                  <CategoryCard type="other" emails={emails?.other || []} onResolve={handleResolveEmails} />
                  <FinanceInsights
                    emails={[
                      ...(emails?.newsletters || []),
                      ...(emails?.social || []),
                      ...(emails?.receipts || []),
                      ...(emails?.other || []),
                    ]}
                  />
                </div>
              </section>
            </section>
          )}

          {state === "CELEBRATED" && stats && <CelebrationScreen stats={stats} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
