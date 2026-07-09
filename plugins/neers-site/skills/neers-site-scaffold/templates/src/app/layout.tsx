import type { Metadata } from "next";
import localFont from "next/font/local";

import { MotionProvider } from "~/components/motion/motion-provider";
import { JsonLd, organizationSchema } from "~/lib/jsonld";
import { site } from "~/lib/site";
import "~/styles/globals.css";

// The brand face. One variable file covers 100–900, self-hosted by
// next/font/local: no external requests, and a metric-matched fallback is
// generated automatically, so font-swap CLS is ~0.
//
// `variable` MUST be `--font-brand` — globals.css feeds exactly that name into
// Tailwind's --font-sans. Rename it in one place and the site silently falls
// back to system-ui.
const brand = localFont({
  src: "./fonts/Brand-Variable.woff2",
  variable: "--font-brand",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
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
  alternates: { canonical: "/" },
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
