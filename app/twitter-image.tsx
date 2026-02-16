import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "ClearBox social preview image";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(140deg, #04141f 0%, #062235 45%, #0a5566 100%)",
          color: "#f5fbff",
          fontFamily: "Inter, Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "rgba(15, 195, 180, 0.2)",
            top: -170,
            right: -110,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: "70px 76px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: "rgba(13, 168, 155, 0.24)",
                border: "1px solid rgba(128, 237, 228, 0.35)",
              }}
            />
            <div style={{ fontSize: 30, fontWeight: 800 }}>ClearBox</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 840 }}>
            <div style={{ fontSize: 72, lineHeight: 1.05, fontWeight: 800, letterSpacing: -1.2 }}>
              Triage Unread Gmail in Minutes
            </div>
            <div style={{ fontSize: 30, lineHeight: 1.35, color: "rgba(231, 247, 255, 0.92)" }}>
              Cut inbox noise with AI-driven categorization and fast bulk actions.
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {["Inbox Cleaner", "AI Assistant", "Privacy First"].map((item) => (
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
