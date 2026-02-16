import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateReplyDraft } from "@/lib/chat";
import type { EmailMetadata } from "@/lib/gmail";
import { checkAndRecordReplyAllowance, normalizeUserEmail } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in again." },
        { status: 401 },
      );
    }

    const userEmail = normalizeUserEmail(session.user?.email);
    if (!userEmail) {
      return NextResponse.json(
        { error: "Could not determine your account email. Please sign out and sign in again." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { email, instruction } = body as {
      email?: EmailMetadata;
      instruction?: string;
    };

    if (!email?.id || !email.subject) {
      return NextResponse.json({ error: "Email details are required." }, { status: 400 });
    }

    const allowance = await checkAndRecordReplyAllowance(userEmail);
    if (!allowance.allowed) {
      return NextResponse.json(
        {
          error: allowance.message,
          code: "AI_REPLY_RATE_LIMIT_REACHED",
          replyRate: allowance.replyRate,
        },
        { status: 429 },
      );
    }

    const draft = await generateReplyDraft(email, instruction);
    if (!draft) {
      return NextResponse.json(
        { error: "AI response was empty. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ draft });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Chat response error:", error);
    return NextResponse.json(
      { error: err.message || "Failed to generate AI response." },
      { status: 500 },
    );
  }
}
