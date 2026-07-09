/**
 * The single source of truth for everything SEO.
 *
 * `sitemap.ts`, `robots.ts`, `llms.txt`, the JSON-LD builders, every page's
 * `metadata`, and the SEO gate in `tests/seo/` all derive from this file. A page
 * that isn't listed here fails the sitemap-coverage check in both directions, so
 * drift is impossible rather than merely discouraged.
 *
 * Adding a page = add a route here, then `export const metadata` on the page
 * built from `pageMetadata(path)`.
 */

export type Route = {
  path: `/${string}` | "/";
  /** Slots into the `%s | <name>` template. Keep under ~45 chars. */
  title: string;
  /** 50–160 chars. The SEO gate enforces this. */
  description: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
  /** Omit from llms.txt's main list, place under `## Optional`. */
  optional?: boolean;
};

export const site = {
  url: "https://example.com",
  name: "Example",
  /** Used as the default meta description and the llms.txt blockquote. */
  description: "A one-line description of what this is and who it is for.",
  locale: "en_US",
  lang: "en",
  socials: {
    x: "https://x.com/example",
    github: "https://github.com/example",
  },
  /** For `twitter.creator`. Include the @. */
  twitterHandle: "@example",
} as const;

export const routes: Route[] = [
  {
    path: "/",
    title: "Example",
    description: site.description,
    changeFrequency: "weekly",
    priority: 1,
  },
];

/** Routes that exist in the app but must never be indexed or listed. */
export const privateRoutes: readonly string[] = ["/style-guide"];

export function routeFor(path: Route["path"]): Route {
  const route = routes.find((r) => r.path === path);
  if (!route) throw new Error(`Route ${path} is not registered in lib/site.ts`);
  return route;
}

/**
 * Per-page metadata. Next merges `metadata` SHALLOWLY — a page-level
 * `openGraph` replaces the layout's entirely — so this returns the complete
 * object rather than a partial to be spread into one.
 */
export function pageMetadata(path: Route["path"]) {
  const { title, description } = routeFor(path);
  const isHome = path === "/";

  return {
    // The `title` key must be ABSENT on the home page. An explicit `title: undefined`
    // overrides the layout's `title.default` and Next emits no <title> at all.
    ...(isHome ? {} : { title }),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      siteName: site.name,
      url: path,
      title,
      description,
      locale: site.locale,
    },
    twitter: {
      card: "summary_large_image" as const,
      creator: site.twitterHandle,
      title,
      description,
    },
  };
}
