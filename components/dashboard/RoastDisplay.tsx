"use client";

import { useRef, useState } from "react";
import { Download, RefreshCw, Share2 } from "lucide-react";
import { EmailStats } from "@/lib/categorize";
import { RoastSeverity } from "@/lib/claude";
import { downloadElementAsImage, shareOnTwitter } from "@/lib/share";
import styles from "./dashboard-components.module.css";

interface RoastDisplayProps {
  stats: EmailStats;
  onDone: () => void;
}

const ROAST_CAPTURE_ID = "clearbox-roast-capture";

export function RoastDisplay({ stats, onDone }: RoastDisplayProps) {
  const [severity, setSeverity] = useState<RoastSeverity>("medium");
  const [roastText, setRoastText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const generate = async () => {
    setIsGenerating(true);
    setIsDone(false);
    setRoastText("");
    setActionNotice("");

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats, severity, stream: true }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let message = "Failed to generate roast";

        if (contentType.includes("application/json")) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          if (payload?.error) {
            message = payload.error;
          }
        } else {
          const text = await response.text().catch(() => "");
          if (text.trim()) {
            message = text.trim();
          }
        }

        throw new Error(message);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setRoastText((prev) => prev + chunk);

          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }
      }

      setIsDone(true);
      onDone();
    } catch (error: unknown) {
      console.error("Roast generation failed:", error);
      const caught = error as { message?: string };
      setRoastText(
        `Error: ${caught.message || "Failed to generate roast. Check your model or API configuration and try again."}`,
      );
      setActionNotice("Roast generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (!roastText.trim()) return;
    const teaser = roastText.replace(/\s+/g, " ").trim().slice(0, 160);
    const shareText = `ClearBox roast (${severity}): ${teaser} ...`;
    shareOnTwitter(shareText);
    setActionNotice("Opened share dialog.");
  };

  const handleDownload = async () => {
    if (!roastText.trim()) return;
    const fileName = `clearbox-roast-${severity}-${new Date().toISOString().slice(0, 10)}`;
    await downloadElementAsImage(ROAST_CAPTURE_ID, fileName);
    setActionNotice("Downloaded roast image.");
  };

  return (
    <section className={`${styles.roastContainer} animate-fade-in`}>
      <div className={styles.roastControls}>
        <div className={styles.severitySelect}>
          <span className={styles.severityLabel}>Severity</span>
          {(["mild", "medium", "savage"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSeverity(level)}
              disabled={isGenerating}
              className={`${styles.severityBtn} ${severity === level ? styles.severityActive : ""}`}
            >
              {level}
            </button>
          ))}
        </div>

        {!isGenerating && !isDone && (
          <button onClick={generate} className="btn btn-primary">
            Start roast
          </button>
        )}

        {(isGenerating || isDone) && (
          <button onClick={generate} disabled={isGenerating} className="btn btn-secondary">
            <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating..." : "Re-run roast"}
          </button>
        )}
      </div>

      {(isGenerating || roastText) && (
        <div id={ROAST_CAPTURE_ID} className={styles.roastPaper} ref={scrollRef}>
          <div className={styles.roastCaptureHeader}>
            <span>ClearBox Roast</span>
            <span>{severity.toUpperCase()}</span>
          </div>
          <div className={styles.roastContent}>
            {roastText}
            {isGenerating && <span className={styles.cursor}>|</span>}
          </div>
        </div>
      )}

      {isDone && (
        <div className={`${styles.roastActions} animate-fade-in-up`}>
          <button className="btn btn-secondary" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share result
          </button>
          <button className="btn btn-secondary" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download image
          </button>
        </div>
      )}

      {actionNotice ? (
        <p className={styles.actionNotice} aria-live="polite">
          {actionNotice}
        </p>
      ) : null}
    </section>
  );
}
