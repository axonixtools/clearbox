"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Download, Share2, Trophy } from "lucide-react";
import { EmailStats } from "@/lib/categorize";
import { downloadElementAsImage, shareOnTwitter } from "@/lib/share";
import styles from "./dashboard-components.module.css";

interface CelebrationScreenProps {
  stats: EmailStats;
}

const CELEBRATION_CAPTURE_ID = "clearbox-victory-capture";

export function CelebrationScreen({ stats }: CelebrationScreenProps) {
  const [actionNotice, setActionNotice] = useState("");

  useEffect(() => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleShare = () => {
    const shareText = `I hit Inbox Zero with ClearBox and cleared ${stats.total.toLocaleString()} unread emails.`;
    shareOnTwitter(shareText);
    setActionNotice("Opened share dialog.");
  };

  const handleDownload = async () => {
    const fileName = `clearbox-inbox-zero-${new Date().toISOString().slice(0, 10)}`;
    await downloadElementAsImage(CELEBRATION_CAPTURE_ID, fileName);
    setActionNotice("Downloaded victory image.");
  };

  return (
    <div className={`${styles.celebrationWrapper} animate-fade-in`}>
      <div id={CELEBRATION_CAPTURE_ID} className={styles.celebrationCard}>
        <div className={styles.trophyIcon}>
          <Trophy className="h-7 w-7" />
        </div>
        <h1 className={styles.celebTitle}>Inbox Zero achieved</h1>
        <p className={styles.celebSubtitle}>
          You just cleared {stats.total.toLocaleString()} emails. Your inbox is now clean and under control.
        </p>

        <div className={styles.finalStats}>
          <div className={styles.finalStatItem}>
            <span className={styles.finalStatLabel}>Before</span>
            <span className={styles.finalStatVal}>{stats.total.toLocaleString()}</span>
          </div>
          <span className={styles.finalStatDivider}>{"->"}</span>
          <div className={styles.finalStatItem}>
            <span className={styles.finalStatLabel}>After</span>
            <span className={styles.finalStatVal} style={{ color: "var(--brand-700)" }}>
              0
            </span>
          </div>
        </div>

        <div className={styles.victoryActions}>
          <button className="btn btn-primary btn-xl w-full" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share your victory
          </button>
          <button className="btn btn-secondary w-full" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download image
          </button>
          <button onClick={() => window.location.reload()} className="btn btn-ghost w-full">
            Start another cleanup
          </button>
        </div>

        {actionNotice ? (
          <p className={styles.actionNotice} aria-live="polite">
            {actionNotice}
          </p>
        ) : null}
      </div>
    </div>
  );
}
