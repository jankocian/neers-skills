import type { MetadataRoute } from "next";

import { privateRoutes, site } from "~/lib/site";

/**
 * Training and retrieval are SEPARATE crawlers. You can opt out of training
 * while staying citable — but on a marketing site, blocking training is usually
 * a self-own: marketing copy is not IP you're protecting, and presence in the
 * training set is free brand recall.
 *
 * robots.txt is RFC 9309 and entirely voluntary. Real enforcement lives at the
 * CDN/WAF. Re-audit the user-agent list ~quarterly; it churns (OAI-SearchBot
 * appeared in 2024, Claude-SearchBot split off in 2025).
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = [...privateRoutes, "/api/"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },

      // Retrieval, search and citation. This is the GEO surface — allow it.
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "Claude-SearchBot",
          "Claude-User",
          "PerplexityBot",
          "Perplexity-User",
          "Googlebot",
          "Bingbot",
          "Applebot",
        ],
        allow: "/",
        disallow,
      },

      // Training crawlers. Allowed on purpose — see the note above.
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: "/",
        disallow,
      },

      // Bulk scrape, no citation upside.
      { userAgent: ["CCBot", "Bytespider"], disallow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
