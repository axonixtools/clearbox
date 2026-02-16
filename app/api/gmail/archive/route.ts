import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { archiveEmails } from "@/lib/gmail";
import { checkClearAllowance, normalizeUserEmail, recordClearedEmails } from "@/lib/pricing";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { messageIds } = body as { messageIds: string[] };

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: "No email IDs provided." },
        { status: 400 }
      );
    }

    const allowance = await checkClearAllowance(userEmail, messageIds.length);
    if (!allowance.allowed) {
      return NextResponse.json(
        {
          error: allowance.message,
          code: "FREE_CLEAR_LIMIT_REACHED",
          usage: allowance.usage,
        },
        { status: 402 },
      );
    }

    const result = await archiveEmails(session.accessToken, messageIds);
    const usage =
      result.archived > 0 ? await recordClearedEmails(userEmail, result.archived) : allowance.usage;

    return NextResponse.json({
      archived: result.archived,
      failed: result.failed,
      message:
        result.failed > 0
          ? `Archived ${result.archived} emails. ${result.failed} failed.`
          : `Successfully archived ${result.archived} emails.`,
      usage,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err.message === "SESSION_EXPIRED") {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }
    console.error("Archive error:", error);
    return NextResponse.json(
      { error: "Failed to archive emails. Please try again." },
      { status: 500 }
    );
  }
}
