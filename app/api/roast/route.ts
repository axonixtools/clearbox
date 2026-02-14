import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateRoast, generateRoastStream, RoastSeverity } from "@/lib/claude";
import { EmailStats } from "@/lib/categorize";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();
    const { stats, severity = "medium", stream = true } = body as {
      stats: EmailStats;
      severity?: RoastSeverity;
      stream?: boolean;
    };

    if (!stats || !stats.total) {
      return NextResponse.json(
        { error: "Email stats required for roast generation." },
        { status: 400 },
      );
    }

    if (stream) {
      try {
        const readableStream = await generateRoastStream(stats, severity);

        return new Response(readableStream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "Transfer-Encoding": "chunked",
          },
        });
      } catch (streamError) {
        console.error("Roast stream failed, falling back to non-stream response:", streamError);
        const fallbackRoast = await generateRoast(stats, severity);
        return new Response(fallbackRoast, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      }
    }

    const roast = await generateRoast(stats, severity);
    return NextResponse.json({ roast });
  } catch (error: unknown) {
    console.error("Roast generation error:", error);
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "The roast generator had a moment. Please try again." },
      { status: 500 },
    );
  }
}
