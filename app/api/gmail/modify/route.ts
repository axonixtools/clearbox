import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applyBulkEmailAction, type EmailBulkAction } from "@/lib/gmail";

const VALID_ACTIONS: EmailBulkAction[] = ["archive", "markRead", "spam", "trash"];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in again." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { messageIds, action } = body as { messageIds: string[]; action: EmailBulkAction };

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json({ error: "No email IDs provided." }, { status: 400 });
    }

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const result = await applyBulkEmailAction(session.accessToken, messageIds, action);

    const actionLabel =
      action === "archive" ? "archived" : action === "markRead" ? "marked read" : action === "spam" ? "moved to spam" : "trashed";

    return NextResponse.json({
      processed: result.processed,
      failed: result.failed,
      message:
        result.failed > 0
          ? `${result.processed} emails ${actionLabel}. ${result.failed} failed.`
          : `Successfully ${actionLabel} ${result.processed} emails.`,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err.message === "SESSION_EXPIRED") {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 },
      );
    }
    console.error("Modify error:", error);
    return NextResponse.json(
      { error: "Failed to process selected emails. Please try again." },
      { status: 500 },
    );
  }
}
