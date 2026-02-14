"use client";

import { Flame } from "lucide-react";
import { EmailStats } from "@/lib/categorize";
import styles from "./dashboard-components.module.css";

interface StatsOverviewProps {
  stats: EmailStats;
  shameScore: { score: number; label: string; description: string };
  onStartRoast: () => void;
}

export function StatsOverview({ stats, shameScore, onStartRoast }: StatsOverviewProps) {
  const safeScore = Math.max(0, Math.min(100, shameScore.score));
  const arcLength = 157.1;
  const arcOffset = arcLength - (safeScore / 100) * arcLength;

  return (
    <div className={styles.statsWrapper}>
      <div className={styles.shameCard}>
        <div className={styles.gaugeHeader}>
          <p className={styles.gaugeKicker}>Inbox Saint meter</p>
          <span className={styles.gaugeBadge}>{safeScore}/100</span>
        </div>

        <div className={styles.gaugeContainer}>
          <svg className={styles.gauge} viewBox="0 0 120 72" aria-hidden>
            <defs>
              <linearGradient id="clearbox-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--brand-500)" />
                <stop offset="100%" stopColor="var(--brand-700)" />
              </linearGradient>
            </defs>
            <path
              className={styles.gaugeBg}
              d="M10,60 A50,50 0 0,1 110,60"
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              className={styles.gaugeValue}
              d="M10,60 A50,50 0 0,1 110,60"
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              style={{ strokeDasharray: arcLength, strokeDashoffset: arcOffset }}
            />
          </svg>
          <div className={styles.scoreValueWrap}>
            <div className={styles.scoreValue}>{safeScore}</div>
            <div className={styles.scoreSuffix}>score</div>
          </div>
        </div>

        <div className={styles.shameInfo}>
          <h3 className={styles.shameLabel}>{shameScore.label}</h3>
          <p className={styles.shameDesc}>{shameScore.description}</p>
        </div>

        <button onClick={onStartRoast} className="btn btn-primary btn-xl w-full mt-6">
          <Flame className="h-4 w-4" />
          Roast my habits
        </button>
      </div>

      <div className={styles.numericalStats}>
        <div className={styles.statBox}>
          <span className={styles.statVal}>{stats.total.toLocaleString()}</span>
          <span className={styles.statLabel}>Total unread</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statVal}>{stats.newsletters.toLocaleString()}</span>
          <span className={styles.statLabel}>Newsletters</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statVal}>{stats.social.toLocaleString()}</span>
          <span className={styles.statLabel}>Social</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statVal}>{stats.receipts.toLocaleString()}</span>
          <span className={styles.statLabel}>Receipts</span>
        </div>
      </div>
    </div>
  );
}
