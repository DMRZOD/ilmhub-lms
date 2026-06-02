import { ImageResponse } from "next/og";

import { SITE_TITLE } from "@/lib/seo/site";

// Default Open Graph image for the whole site, generated at build/request time
// so no static asset is required. Monochrome brand: black canvas, white wordmark.
export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          padding: "80px",
        }}
      >
        <div style={{ fontSize: 140, fontWeight: 800, letterSpacing: "-0.04em" }}>
          IlmHub
        </div>
        <div style={{ fontSize: 46, color: "#d4d4d4", marginTop: 12 }}>
          IT kurslar onlayn ta&apos;lim platformasi
        </div>
        <div
          style={{
            marginTop: 48,
            width: 160,
            height: 8,
            backgroundColor: "#ffffff",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
