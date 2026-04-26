import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0a1626 0%, #0f2235 50%, #0a1626 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.3em",
            color: "#5eead4",
            textTransform: "uppercase",
            marginBottom: 32,
            border: "1px dashed rgba(94, 234, 212, 0.5)",
            padding: "8px 16px",
          }}
        >
          / Music · Time · Memory /
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 180,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 0.95,
          }}
        >
          <span>Cover</span>
          <span style={{ color: "#5eead4", fontSize: 96 }}>Guessr</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 32,
            color: "rgba(255,255,255,0.75)",
            maxWidth: 900,
          }}
        >
          {SITE_TAGLINE}.
        </div>
      </div>
    ),
    { ...size },
  );
}
