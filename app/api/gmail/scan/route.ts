import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scanUnreadEmails } from "@/lib/gmail";
import { categorizeEmails, generateStats, calculateShameScore } from "@/lib/categorize";
import { checkAndRecordScanAllowance, getPricingUsage, normalizeUserEmail } from "@/lib/pricing";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in again." },
        { status: 401 }
      );
    }

    const userEmail = normalizeUserEmail(session.user?.email);
    if (!userEmail) {
      return NextResponse.json(
        { error: "Could not determine your account email. Please sign out and sign in again." },
        { status: 400 }
      );
    }

    const scanAllowance = await checkAndRecordScanAllowance(userEmail);
    if (!scanAllowance.allowed) {
      return NextResponse.json(
        {
          error: scanAllowance.message,
          code: "SCAN_RATE_LIMIT_REACHED",
          scanRate: scanAllowance.scanRate,
        },
        { status: 429 }
      );
    }

    const emails = await scanUnreadEmails(session.accessToken);
    const categorized = categorizeEmails(emails);
    const stats = generateStats(emails, categorized);
    const shameScore = calculateShameScore(stats);
    const usage = await getPricingUsage(userEmail);

    return NextResponse.json({
      emails: {
        newsletters: categorized.newsletters.map((e) => ({
          id: e.id,
          from: e.from,
          fromDomain: e.fromDomain,
          subject: e.subject,
          date: e.date,
          snippet: e.snippet,
        })),
        social: categorized.social.map((e) => ({
          id: e.id,
          from: e.from,
          fromDomain: e.fromDomain,
          subject: e.subject,
          date: e.date,
          snippet: e.snippet,
        })),
        receipts: categorized.receipts.map((e) => ({
          id: e.id,
          from: e.from,
          fromDomain: e.fromDomain,
          subject: e.subject,
          date: e.date,
          snippet: e.snippet,
        })),
        other: categorized.other.map((e) => ({
          id: e.id,
          from: e.from,
          fromDomain: e.fromDomain,
          subject: e.subject,
          date: e.date,
          snippet: e.snippet,
        })),
      },
      stats,
      shameScore,
      usage,
      scanRate: scanAllowance.scanRate,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err.message === "SESSION_EXPIRED") {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }
    if (err.message === "RATE_LIMITED") {
      return NextResponse.json(
        {
          error:
            "Gmail is rate limiting us. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Failed to scan emails. Please try again." },
      { status: 500 }
    );
  }
}
