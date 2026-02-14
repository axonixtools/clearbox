import { google } from "googleapis";

export interface EmailMetadata {
  id: string;
  from: string;
  fromDomain: string;
  subject: string;
  date: string;
  snippet: string;
}

export type EmailBulkAction = "archive" | "markRead" | "spam" | "trash";

/**
 * Scan all unread emails from Gmail.
 * Fetches in batches of 100 (Gmail API limit per page).
 * Only reads metadata — never email body content.
 */
export async function scanUnreadEmails(
  accessToken: string,
  onProgress?: (count: number) => void,
): Promise<EmailMetadata[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth });
  const emails: EmailMetadata[] = [];
  let pageToken: string | undefined;
  let totalFetched = 0;
  const MAX_EMAILS = 1000; // Cap at 1000 for performance

  console.log("Starting Gmail scan...");

  try {
    // Paginate through all unread messages
    do {
      const listRes = await gmail.users.messages.list({
        userId: "me",
        q: "is:unread",
        maxResults: 100,
        pageToken,
      });

      const messages = listRes.data.messages || [];
      pageToken = listRes.data.nextPageToken || undefined;

      if (messages.length === 0) break;

      console.log(
        `Fetched list of ${messages.length} messages. Fetching metadata...`,
      );

      // Fetch metadata for each message in parallel batches of 20
      const batchSize = 20;
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        const details = await Promise.all(
          batch.map((msg) =>
            gmail.users.messages
              .get({
                userId: "me",
                id: msg.id!,
                format: "metadata",
                metadataHeaders: ["From", "Subject", "Date"],
              })
              .catch((err) => {
                console.error(`Error fetching message ${msg.id}:`, err.message);
                return null;
              }),
          ),
        );

        for (const detail of details) {
          if (!detail?.data?.payload?.headers) continue;

          const headers = detail.data.payload.headers;
          const from = headers.find((h) => h.name === "From")?.value || "";
          const subject =
            headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
          const date = headers.find((h) => h.name === "Date")?.value || "";

          // Extract domain from "Name <email@domain.com>" or "email@domain.com"
          const emailMatch =
            from.match(/<(.+?)>/) || from.match(/([^\s]+@[^\s]+)/);
          const email = emailMatch ? emailMatch[1] : from;
          const domainMatch = email.match(/@(.+)/);
          const fromDomain = domainMatch ? domainMatch[1].toLowerCase() : "";

          emails.push({
            id: detail.data.id!,
            from: from.replace(/<.*>/, "").trim() || email,
            fromDomain,
            subject,
            date,
            snippet: detail.data.snippet || "",
          });
        }

        totalFetched += batch.length;
        onProgress?.(totalFetched);

        if (emails.length >= MAX_EMAILS) {
          console.log(`Reached limit of ${MAX_EMAILS} emails. Stopping scan.`);
          return emails;
        }
      }

      console.log(`Progress: ${emails.length} emails processed.`);

      // Rate limit safety: brief pause between pages
      if (pageToken) {
        await new Promise((res) => setTimeout(res, 200));
      }
    } while (pageToken);
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 401) {
      throw new Error("SESSION_EXPIRED");
    }
    if (err.code === 429) {
      throw new Error("RATE_LIMITED");
    }
    throw error;
  }

  return emails;
}

/**
 * Archive emails by removing INBOX and UNREAD labels.
 * Uses Gmail's batch modify for efficiency.
 */
export async function archiveEmails(
  accessToken: string,
  messageIds: string[],
): Promise<{ archived: number; failed: number }> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth });
  let archived = 0;
  let failed = 0;

  // Gmail batchModify supports up to 1000 IDs per call
  const batchSize = 1000;

  for (let i = 0; i < messageIds.length; i += batchSize) {
    const batch = messageIds.slice(i, i + batchSize);

    try {
      await gmail.users.messages.batchModify({
        userId: "me",
        requestBody: {
          ids: batch,
          removeLabelIds: ["INBOX", "UNREAD"],
        },
      });
      archived += batch.length;
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 429) {
        // Rate limited — wait and retry
        await new Promise((res) => setTimeout(res, 2000));
        try {
          await gmail.users.messages.batchModify({
            userId: "me",
            requestBody: {
              ids: batch,
              removeLabelIds: ["INBOX", "UNREAD"],
            },
          });
          archived += batch.length;
        } catch {
          failed += batch.length;
        }
      } else {
        failed += batch.length;
      }
    }

    // Rate limit safety
    if (i + batchSize < messageIds.length) {
      await new Promise((res) => setTimeout(res, 300));
    }
  }

  return { archived, failed };
}

/**
 * Apply a bulk action to message IDs.
 * - archive: remove INBOX + UNREAD
 * - markRead: remove UNREAD
 * - spam: add SPAM, remove INBOX + UNREAD
 * - trash: permanently move to trash
 */
export async function applyBulkEmailAction(
  accessToken: string,
  messageIds: string[],
  action: EmailBulkAction,
): Promise<{ processed: number; failed: number }> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth });
  let processed = 0;
  let failed = 0;
  const batchSize = 1000;

  for (let i = 0; i < messageIds.length; i += batchSize) {
    const batch = messageIds.slice(i, i + batchSize);

    try {
      if (action === "trash") {
        await gmail.users.messages.batchDelete({
          userId: "me",
          requestBody: {
            ids: batch,
          },
        });
      } else {
        const requestBody =
          action === "archive"
            ? { ids: batch, removeLabelIds: ["INBOX", "UNREAD"] }
            : action === "markRead"
              ? { ids: batch, removeLabelIds: ["UNREAD"] }
              : {
                  ids: batch,
                  addLabelIds: ["SPAM"],
                  removeLabelIds: ["INBOX", "UNREAD"],
                };

        await gmail.users.messages.batchModify({
          userId: "me",
          requestBody,
        });
      }

      processed += batch.length;
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 429) {
        await new Promise((res) => setTimeout(res, 2000));
        try {
          if (action === "trash") {
            await gmail.users.messages.batchDelete({
              userId: "me",
              requestBody: {
                ids: batch,
              },
            });
          } else {
            const requestBody =
              action === "archive"
                ? { ids: batch, removeLabelIds: ["INBOX", "UNREAD"] }
                : action === "markRead"
                  ? { ids: batch, removeLabelIds: ["UNREAD"] }
                  : {
                      ids: batch,
                      addLabelIds: ["SPAM"],
                      removeLabelIds: ["INBOX", "UNREAD"],
                    };

            await gmail.users.messages.batchModify({
              userId: "me",
              requestBody,
            });
          }

          processed += batch.length;
        } catch {
          failed += batch.length;
        }
      } else {
        failed += batch.length;
      }
    }

    if (i + batchSize < messageIds.length) {
      await new Promise((res) => setTimeout(res, 300));
    }
  }

  return { processed, failed };
}
