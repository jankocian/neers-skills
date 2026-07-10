import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import { MotionProvider } from "~/components/motion/motion-provider";
import { JsonLd, organizationSchema } from "~/lib/jsonld";
import { site } from "~/lib/site";
import "~/styles/globals.css";

// The brand face. This is the DEFAULT path — most brands use a Google font, and
// next/font/google downloads it at BUILD time and serves it from our own origin:
// no runtime request to Google, and a metric-matched fallback keeps font-swap
// CLS ~0.
//
// ▶ REPLACE Space_Grotesk with the real brand face:
//   · Google font  → swap the import + call for any next/font/google export.
//   · Purchased/custom .woff2 → use next/font/local instead (drop the file in
//     ./fonts). Same variable name.
//   Keep `variable: "--font-brand"` — theme.css feeds exactly that into
//   --font-sans; rename it and the site silently falls back to system-ui.
//   Never default to Inter / Roboto / Open Sans — the AI-slop fingerprints.
//   Add `subsets` for the languages you need (e.g. "latin-ext" for Czech).
const brand = Space_Grotesk({
  variable: "--font-brand",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Required. Without it, every relative canonical/OG url is a build error.
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    url: "/",
    title: site.name,
    description: site.description,
    locale: site.locale,
  },
  twitter: {
    card: "summary_large_image",
    creator: site.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={site.lang} className={brand.variable}>
      <body className="min-h-dvh">
        <JsonLd schema={organizationSchema()} />
        {/* Client boundary. `children` stays a server-rendered RSC payload and
            is not pulled into the client bundle. */}
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
