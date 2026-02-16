import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "ClearBox social preview image";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(140deg, #031a24 0%, #072836 42%, #0b4f61 100%)",
          color: "#f5fbff",
          fontFamily: "Inter, Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 540,
            height: 540,
            borderRadius: "50%",
            background: "rgba(15, 195, 180, 0.22)",
            top: -160,
            right: -140,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(255, 174, 66, 0.13)",
            bottom: -180,
            left: -90,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: "64px 74px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(13, 168, 155, 0.24)",
                border: "1px solid rgba(128, 237, 228, 0.35)",
              }}
            />
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 0.4 }}>ClearBox</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 820 }}>
            <div style={{ fontSize: 74, lineHeight: 1.04, fontWeight: 800, letterSpacing: -1.4 }}>
              Clean Your Gmail Inbox Faster
            </div>
            <div style={{ fontSize: 32, lineHeight: 1.35, color: "rgba(231, 247, 255, 0.92)" }}>
              AI triage, bulk actions, and privacy-first workflows for high unread counts.
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {["Google OAuth", "Bulk Cleanup", "Inbox Analytics"].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  padding: "10px 16px",
                  borderRadius: 999,
                  fontSize: 21,
                  border: "1px solid rgba(209, 241, 255, 0.35)",
                  background: "rgba(8, 38, 52, 0.6)",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
