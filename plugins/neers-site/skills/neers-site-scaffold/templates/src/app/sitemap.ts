import type { MetadataRoute } from "next";

import { routes, site } from "~/lib/site";

// A GET-only Route Handler, statically generated at build time -> /sitemap.xml.
// Derived from lib/site.ts, so it can never drift from the pages that exist:
// tests/seo/meta.spec.ts asserts coverage in both directions.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${site.url}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
