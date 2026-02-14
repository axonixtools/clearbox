import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { archiveEmails } from "@/lib/gmail";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in again." },
        { status: 401 }
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

    const result = await archiveEmails(session.accessToken, messageIds);

    return NextResponse.json({
      archived: result.archived,
      failed: result.failed,
      message:
        result.failed > 0
          ? `Archived ${result.archived} emails. ${result.failed} failed.`
          : `Successfully archived ${result.archived} emails.`,
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
