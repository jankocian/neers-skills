import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { site } from "~/lib/site";

// File-based metadata OVERRIDES the `metadata` object — with this file present,
// drop `openGraph.images` from app/layout.tsx or it will be ignored anyway.
//
// Requires no `output: "export"` — static export breaks OG generation.
// Hard limits, enforced at build: og <= 8MB, twitter <= 5MB.

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Satori cannot resolve next/font. Read the woff/ttf off disk.
  // A variable woff2 will NOT work here — Satori needs a static instance.
  const font = await readFile(
    join(process.cwd(), "src/app/fonts/Brand-SemiBold.ttf"),
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: 80,
        // Literal values, not tokens: Satori has no Tailwind, no CSS vars.
        background: "#fafaf9",
        color: "#1c1b1a",
        fontFamily: "Brand",
      }}
    >
      <div style={{ fontSize: 72, letterSpacing: "-0.03em", lineHeight: 1 }}>
        {site.name}
      </div>
      <div style={{ fontSize: 32, marginTop: 24, color: "#57534e" }}>
        {site.description}
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Brand", data: font, style: "normal", weight: 600 }],
    },
  );
}
