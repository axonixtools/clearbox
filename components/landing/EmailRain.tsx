"use client";

import { useState } from "react";
import styles from "./landing.module.css";

export function EmailRain() {
  const [emails] = useState<{ id: number; left: string; delay: string; duration: string }[]>(() => {
    // Generate static rain pattern on mount (lazy initialization to avoid effect)
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${15 + Math.random() * 10}s`,
    }));
  });

  return (
    <div className={styles.emailRain}>
      {emails.map((e) => (
        <div
          key={e.id}
          className={styles.fallingEmail}
          style={{
            left: e.left,
            animationDelay: e.delay,
            animationDuration: e.duration,
          }}
        >
          📧
        </div>
      ))}
    </div>
  );
}
