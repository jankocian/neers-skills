import type {
  BreadcrumbList,
  Organization,
  Thing,
  WithContext,
} from "schema-dts";

import { type Route, routeFor, site } from "~/lib/site";

/**
 * JSON-LD, typed by schema-dts, so `tsc --noEmit` validates it at compile time.
 *
 * Return the narrow type (`WithContext<Organization>`), never a cast to
 * `WithContext<Thing>` — the cast throws away the validation.
 *
 * Types worth shipping on a marketing site:
 *   Organization         root layout. Establishes the Knowledge Graph entity.
 *   BreadcrumbList       any page below the root. Still produces rich results.
 *   SoftwareApplication  the right type for SaaS. Better than Product.
 *   FAQPage              rich result retired ~2026-05, but still parsed, and
 *                        answer engines read it. Cheap. Keep it.
 *
 * Deliberately absent: WebSite + potentialAction: SearchAction. Google retired
 * the Sitelinks Search Box globally on 2024-11-21. It renders nothing.
 */

export function organizationSchema(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    // TODO: logo: `{site.url}/logo.svg`,
    description: site.description,
    sameAs: Object.values(site.socials),
  };
}

export function breadcrumbSchema(
  trail: Route["path"][],
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((path, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: routeFor(path).title,
      item: `${site.url}${path === "/" ? "" : path}`,
    })),
  };
}

/**
 * Renders a JSON-LD block. The `<` escape is mandatory, not defensive:
 * JSON.stringify does not sanitise, so a `</script>` inside any string value
 * would close the tag and hand an attacker the page. Next's own docs say so.
 *
 * A native <script> tag, never next/script — next/script optimises loading of
 * executable JS. This is data.
 */
export function JsonLd({ schema }: { schema: WithContext<Thing> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the only way to emit JSON-LD; escaped below
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
