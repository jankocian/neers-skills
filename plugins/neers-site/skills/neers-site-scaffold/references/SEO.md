# SEO

`src/lib/site.ts` is the single source of truth. Every route, title and
description lives there. `sitemap.ts`, `robots.ts`, `llms.txt`, the JSON-LD
builders and every page's `metadata` derive from it, and `tests/seo/meta.spec.ts`
asserts coverage in **both** directions — a page missing from `site.ts` fails, and
a `site.ts` route with no page fails. Drift is impossible rather than discouraged.

Adding a page: add the route to `site.ts`, then `export const metadata =
pageMetadata("/that-route")`.

## Metadata

Static `metadata` object. **Never** `generateMetadata` unless it genuinely needs
request data — Next's docs are explicit, and you cannot export both from one
segment.

Four traps:

1. **`metadataBase` is required** in the root layout. Without it, any relative
   canonical or OG url is a build error.
2. **Merging is shallow.** A page-level `openGraph` replaces the layout's
   *entirely* — not field by field. Same for `robots`. `pageMetadata()` returns a
   complete object for this reason.
3. **`alternates.canonical` must be set on every page.** It is not usefully
   inherited.
4. `title.template` in a layout does **not** apply to a `title` in that same
   segment's `page.tsx`. `title.default` is mandatory whenever `template` is set.

`themeColor` / `colorScheme` / `viewport` moved out of `metadata` into
`generateViewport` back in 14.0.

## Images

- **`priority` is deprecated in Next 16 → `preload`.** And the docs then say to
  prefer `loading="eager"` / `fetchPriority="high"` over `preload` in most cases.
  Don't combine `preload` with either.
- **Always set `sizes`.** Without it the browser assumes `100vw` and downloads an
  image far larger than needed. `sizes` also changes what Next *generates*: with
  it you get a width-descriptor `srcset` (`640w`, `750w`, …); without it, only
  `1x`/`2x`.
- Next 16 defaults changed: `images.qualities` is now `[75]` and the `quality`
  prop is **coerced to the nearest allowed value**. `images.domains` is deprecated
  → `remotePatterns`.
- CLS, ranked: missing `width`/`height` (or `fill` without a positioned, sized
  parent) › setting `width` via CSS without `height: auto` › font swap without
  metric-matched fallback (`next/font` handles this) › late-injected embeds.
- `placeholder="blur"` improves *perceived* performance, not CLS. `blurDataURL` is
  auto-generated for static imports only.

## OG images

One static bitmap for the whole site. Drop `src/app/opengraph-image.png` (or `.jpg`,
~1200×630). Next serves it and auto-injects `og:image` **and** `twitter:image` on every
route via the file-name convention — no metadata wiring. `bun run check` fails until it's
present.

- Per-route override: put an `opengraph-image.png` inside that route's folder.
- Hard limits: og ≤ 8 MB, twitter ≤ 5 MB.

We do **not** generate OG images dynamically. Satori needs a static font instance and the
per-project filename/weight coupling isn't worth it for a marketing site that wants a
single share image. If you ever do need dynamic cards, add an `opengraph-image.tsx` — it
works because we don't use `output: "export"` (static export breaks it:
[vercel/next.js#51147], #55890).

## JSON-LD

Native `<script type="application/ld+json">` with `dangerouslySetInnerHTML`.
**Not** `next/script` — that optimises loading of executable JS; this is data.

```ts
dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
```

The escape is **mandatory**, not defensive. Next's docs call out that
`JSON.stringify` does not sanitise: a `</script>` inside any string value closes
the tag and hands over the page.

Type everything with `schema-dts`. `tsc --noEmit` then becomes a free
compile-time JSON-LD validator — a typo'd property is a build error rather than
something you discover in Google's Rich Results Test six months later. There is
no supported CLI for the Rich Results Test.

What's worth shipping in 2026:

| Type | Verdict |
|---|---|
| `Organization` | Yes. Root layout. Establishes the Knowledge Graph entity. |
| `BreadcrumbList` | Yes. Still produces rich results. |
| `SoftwareApplication` + `offers` | Yes — the right type for SaaS, better than `Product`. |
| `Article` / `BlogPosting` | Yes, for `/blog`. |
| `FAQPage` | Rich result retired ~2026-05, but still **parsed**, and answer engines read it. Cheap. Keep. |
| `WebSite` + `SearchAction` | **Dead.** Google retired the Sitelinks Search Box globally on 2024-11-21. Renders nothing. |

## robots.txt

Training and retrieval are **separate crawlers**. You can block training and stay
citable. On a marketing site, blocking training is usually a self-own: the copy
isn't IP you're protecting, and presence in the training set is free brand recall.

- Allow, always: `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`,
  `Claude-User`, `PerplexityBot`, `Perplexity-User`, `Googlebot`, `Bingbot`,
  `Applebot`. This is the GEO surface.
- Allow by default: `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`.
- Block: `CCBot`, `Bytespider` — bulk scrape, no citation upside.
- Disallow `/style-guide` (via `privateRoutes`).

`robots.txt` is RFC 9309 and **voluntary**. Real enforcement is at the CDN/WAF.
Re-audit the UA list quarterly — it churns (`OAI-SearchBot` appeared in 2024,
`Claude-SearchBot` split off in 2025).

## llms.txt — ship it, but be honest

The spec (llmstxt.org, Sept 2024, no version, unchanged) defines `/llms.txt` only.
**`/llms-full.txt` is not in it** — that's a Mintlify/Vercel de-facto convention.

Structure: `# Title` (the only required section) → `> blockquote` summary →
optional prose → `##` sections of `- [name](url): description`. An `## Optional`
H2 has special meaning: its URLs may be skipped when a shorter context is needed.

What the evidence says:

- **Google does not use it.** John Mueller, publicly and repeatedly, compared it to
  the `keywords` meta tag.
- OpenAI, Anthropic, Meta, Mistral: **no public commitment**.
- Of ~38,000 domains publishing a valid `llms.txt`, **~97% received zero requests
  for it** in May 2026. Of ~500M AI bot visits over 90 days, ~408 hit `llms.txt`.
- The one demonstrated consumer: **IDE agents** (Cursor, Claude Code, Copilot) and
  MCP servers.

So: ship it, the cost is one route handler. **Do not expect GEO lift**, and never
trade on-page semantic HTML or JSON-LD for it — those *are* consumed.

`app/llms.txt/route.ts` with `export const dynamic = "force-static"`. There is no
official `app/llms.ts` convention (vercel/next.js#80692, #81182 are open).

## What we deliberately skipped

| | Why |
|---|---|
| `next-sitemap` | Redundant with `app/sitemap.ts`. |
| `structured-data-testing-tool` | Unmaintained. `schema-dts` at `tsc` time covers 90%. |
| `unlighthouse` | Genuinely good, 2–5s/page. Nightly job, not a gate. |
| `@lhci/cli` with `onlyCategories` | Known-broken with the `lighthouse:recommended` preset ([lighthouse-ci#778]). Score-based, not violation-based. |
