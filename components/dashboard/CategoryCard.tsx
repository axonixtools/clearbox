"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Inbox, MailCheck, Newspaper, ReceiptText, Search, ShieldAlert, Users } from "lucide-react";
import type { EmailBulkAction, EmailMetadata } from "@/lib/gmail";
import styles from "./dashboard-components.module.css";

interface CategoryCardProps {
  type: "newsletters" | "social" | "receipts" | "other";
  emails: EmailMetadata[];
  onResolve: (messageIds: string[], category: "newsletters" | "social" | "receipts" | "other") => void;
}

const CATEGORY_MAP = {
  newsletters: {
    icon: Newspaper,
    label: "Newsletters",
    desc: "Subscriptions, blog updates, and promo streams",
  },
  social: {
    icon: Users,
    label: "Social",
    desc: "Mentions, likes, follows, and platform alerts",
  },
  receipts: {
    icon: ReceiptText,
    label: "Receipts",
    desc: "Invoices, order confirmations, and payment notices",
  },
  other: {
    icon: Inbox,
    label: "Other",
    desc: "Everything else that does not match core categories",
  },
} as const;

function parseApiError(raw: string): string {
  try {
    const payload = JSON.parse(raw) as { error?: string };
    if (payload?.error) return payload.error;
  } catch {
    // Fall through to raw text.
  }
  return raw || "Request failed.";
}

export function CategoryCard({ type, emails, onResolve }: CategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [aiPrompt, setAiPrompt] = useState("Draft a short, polite reply.");
  const [aiDraft, setAiDraft] = useState("");
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  const info = CATEGORY_MAP[type];
  const hasEmails = emails.length > 0;

  useEffect(() => {
    setSelectedIds(new Set(emails.map((email) => email.id)));
  }, [emails]);

  const filteredEmails = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return emails;

    return emails.filter((email) =>
      `${email.from} ${email.subject} ${email.snippet || ""}`.toLowerCase().includes(term),
    );
  }, [emails, query]);

  const visibleSelectedCount = filteredEmails.filter((email) => selectedIds.has(email.id)).length;
  const selectedVisibleIds = filteredEmails.filter((email) => selectedIds.has(email.id)).map((email) => email.id);
  const selectedEmailForAssistant = filteredEmails.find((email) => selectedIds.has(email.id)) || null;

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectFiltered = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      filteredEmails.forEach((email) => next.add(email.id));
      return next;
    });
  };

  const clearFiltered = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      filteredEmails.forEach((email) => next.delete(email.id));
      return next;
    });
  };

  const handleBulkAction = async (action: EmailBulkAction) => {
    if (selectedVisibleIds.length === 0) {
      setNotice("Select at least one email first.");
      return;
    }

    setIsProcessing(true);
    setNotice("");

    try {
      const res = await fetch("/api/gmail/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIds: selectedVisibleIds, action }),
      });

      if (!res.ok) {
        const rawError = await res.text();
        throw new Error(parseApiError(rawError));
      }

      const payload = (await res.json()) as { message?: string };
      onResolve(selectedVisibleIds, type);
      setNotice(payload.message || "Action completed.");
    } catch (error: unknown) {
      const caught = error as { message?: string };
      setNotice(caught.message || "Failed to process selected emails.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateReply = async () => {
    if (!selectedEmailForAssistant) {
      setNotice("Select one email to generate an AI reply.");
      return;
    }

    setIsGeneratingDraft(true);
    setAiDraft("");
    setNotice("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedEmailForAssistant,
          instruction: aiPrompt,
        }),
      });

      if (!res.ok) {
        const rawError = await res.text();
        throw new Error(parseApiError(rawError));
      }

      const payload = (await res.json()) as { draft: string };
      setAiDraft(payload.draft);
      setNotice("Generated AI draft reply.");
    } catch (error: unknown) {
      const caught = error as { message?: string };
      setNotice(caught.message || "Failed to generate AI reply.");
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const copyDraft = async () => {
    if (!aiDraft) return;
    try {
      await navigator.clipboard.writeText(aiDraft);
      setNotice("Draft copied to clipboard.");
    } catch {
      setNotice("Could not copy automatically. Please copy manually.");
    }
  };

  return (
    <article className={`${styles.categoryCard} ${isProcessing ? styles.archiving : ""}`}>
      <div className={styles.categoryHeader}>
        <div className={styles.categoryInfo}>
          <span className={styles.categoryIcon}>
            <info.icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className={styles.categoryLabel}>{info.label}</h3>
            <p className={styles.categoryCount}>{emails.length.toLocaleString()} emails</p>
            <p className={styles.categoryDescription}>{info.desc}</p>
          </div>
        </div>

        <div className={styles.categoryActions}>
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="btn btn-secondary"
            disabled={!hasEmails}
          >
            {hasEmails ? (isExpanded ? "Hide details" : "Manage emails") : "No emails"}
          </button>
        </div>
      </div>

      {!hasEmails && (
        <div className={styles.emptyCategory}>
          <p>No emails in this category for this scan.</p>
        </div>
      )}

      {isExpanded && hasEmails && (
        <div className={styles.emailList}>
          <div className={styles.emailTools}>
            <label className={styles.searchWrap}>
              <Search className="h-4 w-4" />
              <input
                className={styles.searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search sender, subject, snippet..."
              />
            </label>

            <div className={styles.selectionTools}>
              <button className="btn btn-ghost" onClick={selectFiltered}>
                Select visible
              </button>
              <button className="btn btn-ghost" onClick={clearFiltered}>
                Unselect visible
              </button>
              <span className={styles.selectionCount}>{visibleSelectedCount} selected</span>
            </div>
          </div>

          <div className={styles.actionTools}>
            <button className="btn btn-secondary" onClick={() => handleBulkAction("markRead")}>
              <MailCheck className="h-4 w-4" />
              Mark read
            </button>
            <button className="btn btn-secondary" onClick={() => handleBulkAction("archive")}>
              Archive
            </button>
            <button className="btn btn-secondary" onClick={() => handleBulkAction("spam")}>
              <ShieldAlert className="h-4 w-4" />
              Remove as spam
            </button>
          </div>

          <div className={styles.emailRows}>
            {filteredEmails.length === 0 ? (
              <p className={styles.emptyState}>No emails match your search.</p>
            ) : (
              filteredEmails.map((email) => (
                <label key={email.id} className={styles.emailSelectableRow}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(email.id)}
                    onChange={() => toggleSelect(email.id)}
                  />
                  <div>
                    <p className={styles.emailSender}>{email.from}</p>
                    <p className={styles.emailSubject}>{email.subject}</p>
                    {email.snippet ? <p className={styles.emailSnippet}>{email.snippet}</p> : null}
                  </div>
                </label>
              ))
            )}
          </div>

          <div className={styles.aiAssistant}>
            <div className={styles.aiAssistantHeader}>
              <Bot className="h-4 w-4" />
              <h4>AI reply assistant</h4>
            </div>
            <p className={styles.aiAssistantHint}>
              Generates a reply draft for one selected email (first selected in current filtered list).
            </p>
            <textarea
              className={styles.aiPromptInput}
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              rows={2}
            />
            <div className={styles.aiAssistantActions}>
              <button className="btn btn-primary" onClick={handleGenerateReply} disabled={isGeneratingDraft}>
                {isGeneratingDraft ? "Generating..." : "Generate AI response"}
              </button>
              {aiDraft ? (
                <button className="btn btn-secondary" onClick={copyDraft}>
                  Copy draft
                </button>
              ) : null}
            </div>
            {aiDraft ? <pre className={styles.aiDraft}>{aiDraft}</pre> : null}
          </div>

          {notice ? <p className={styles.actionNotice}>{notice}</p> : null}
        </div>
      )}
    </article>
  );
}
