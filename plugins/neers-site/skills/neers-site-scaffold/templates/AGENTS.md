# Agent rules

## Never guess an API

Next, Tailwind, shadcn, Base UI and Motion all move fast. Before writing code
against any of them, read the installed types (`node_modules/**/*.d.ts`,
`node_modules/next/dist/docs/`) or fetch the live docs. Training data has a
cutoff; guessing produces plausible code that doesn't compile — or worse,
compiles and is silently wrong.

The thought _"I know this library"_ is the signal to check.

## The stack, and why

- **Prefer tokens; arbitrary values are a rare escape hatch, not a ban.** `p-6` not
  `p-[24px]`, `text-primary` not `text-[#d4ff3a]`. When the scale genuinely can't express
  something (a one-off `grid-cols-[1.15fr_1fr]`), an arbitrary value is fine — `bun run
  check` only **warns**. Never hardcode a colour a token already names.
- **A content image is an `<img>` / `next/image`**, not a CSS `background-image` —
  so it gets `srcset`, responsive variants, lazy-loading and an `alt`. `bg-[url(…)]`
  is only for a rare decorative texture. A CSS *gradient* (`bg-radial-…`) is fine —
  it's not an image.
- **shadcn-first.** See below.
- **Surfaces invert; tokens never repeat.** Colour inversion happens only in a
  `.theme-*` scope in `surfaces.css`. Never `.dark`, never per-element.
- **`"use client"` at the leaf, never the page.**
- **A custom focus ring must survive `outline-none`.** Tailwind v4's `outline-none`
  zeroes `--tw-outline-style`, so `outline-2` alone renders nothing and fails WCAG 2.4.7
  silently. Pair it with `focus-visible:outline-solid`, or prefer `focus-visible:ring-2`.

## Build the whole design — stub the wiring, never the structure

Build every section, button and link the design shows. Missing content, URLs or
assets is the normal state of a WIP site: **stub the wiring** (a placeholder href, a
disabled button, a poster frame) — **never delete the UI.** A page the user can see
and finish beats a "clean" one missing half the design.

The one thing you may not fabricate is a **factual claim in structured data** — no
invented ratings or review counts (a Google penalty). Stub the UI, never the fact.

## Tests are the litmus, not your workspace

`tests/` is a universal floor that is identical on every neers site. **Never edit a
test, an audit, or an allowlist to make a build pass** — a green suite you had to edit
proves nothing. A failure means the *site* is wrong: fix the site. If you are certain a
test is wrong for **every** site (not just yours), that's a plugin bug to report, not a
local patch.

## Layout

**Every band of a page is a `Section` wrapping a `Container`.** `Section` owns the
vertical rhythm, `Container` owns the page gutter and the max width
(`narrow` | `content` | `wide` | `full`). Both take `className` plus a polymorphic `as`,
so override freely. Never re-apply `px-6` or `mx-auto max-w-*` further down the tree —
that's how gutters drift apart.

Colour is a theme class: `theme-base` | `theme-subtle` | `theme-inverse` |
`theme-brand`. A theme class paints its own background and text, so it goes straight on
the element, and children need no colour utilities at all.

```tsx
<footer className="theme-inverse">
  <Section>
    <Container size="wide">…</Container>
  </Section>
</footer>
```

## UI components — shadcn/ui first (NON-NEGOTIABLE)

1. **Check the registry first.** Before building ANY component, check whether
   shadcn provides one — the `shadcn` MCP (`search_items_in_registries`) or
   `bunx shadcn add <name>`.
2. **`shadcn add`, then customize.** Customizing the generated file in place is
   correct. Hand-writing a replacement for a component shadcn provides is
   **forbidden**.
3. **Custom is the exception, and must be flagged.** Only hand-write when shadcn
   genuinely has none: layout primitives (`Section`, `Container`) and typography
   (`Text`/`Heading`). Say so, and why.
4. **The style guide IS the spec.** `/style-guide` composes the REAL
   `src/components/ui/*` — never a bespoke preview of how they "would" look.

Known mappings: tag → `badge`, chips/toggles → `toggle`/`toggle-group`,
labels → `label`, selects → `select`, dialogs → `dialog`, carousels → `carousel`.
Vendored files are ours, frozen at authoring time — the scaffold's `shadcn-diff.sh`
(run at init, re-runnable any time) shows what changed upstream; merge worthwhile hunks by hand.

## Overlays

`Dialog` for anything with content or an action — Base UI brings the focus trap, ESC,
scroll lock and ARIA. `Lightbox` (`src/components/ui/lightbox.tsx`) only for viewing
media: it adds swipe, pinch-zoom, video and reduced-motion handling. A dialog is not a
lightbox — don't build a gallery from one.

## Typography

**Size lives in the class name.** `heading-d1`…`heading-h3`, `type-tagline`, and
Tailwind's own `text-xl`/`text-base`/`text-sm`/`text-xs`. Never invent a `text-*`
size — tailwind-merge would treat it as a colour and drop it.
Each token bundles size + line-height + tracking + weight, so the class says
everything. `Heading` adds `text-balance` and picks the tag from `level`; `Text`
adds `text-pretty`. Neither has a `variant`.

```tsx
<Heading level={1} className="heading-d1">  // hero, and still the page's only <h1>
<Text className="text-xl text-muted-foreground">
```

Never bump `level` to get a bigger size. The tag carries meaning; the class carries
size. Token rationale (and why the scale avoids the `text-*` namespace):
`neers-site-scaffold/references/TOKENS.md`.

## Motion

**Compose the primitives (`Reveal`, `Stagger` + `StaggerItem`, `MaskReveal` in
`src/components/motion/`). Use `m.*` for custom motion; never `import { motion }`** —
it throws under `LazyMotion strict`. Easing comes from `src/lib/motion.ts`, never an
inline `cubic-bezier`. Never add `will-change`.

**Never branch the DOM on `useReducedMotion`** — it can strand content at `opacity: 0`
(a blank page). `<MotionConfig reducedMotion="user">` already handles reduced motion;
continuous motion (parallax, marquee, autoplay) is the one exception. Recipes, and the
`domAnimation`/`domMax` feature split: `neers-site-scaffold/references/MOTION.md`.

## SEO

`src/lib/site.ts` is the single source of truth. Adding a page means adding a
route there. `sitemap.ts`, `robots.ts`, `llms.txt` and every page's `metadata`
derive from it, and the SEO gate asserts coverage in both directions.

`priority` on `next/image` is deprecated → use `preload`. Always set `sizes`.
Metadata, JSON-LD and sitemap detail: `neers-site-scaffold/references/SEO.md`.

## The loop

Three commands. What separates them is **what they need to run**, nothing else.

```
bun run check    needs nothing        run constantly; this is the pre-commit hook
bun run test     needs a dev server   also writes .neers/ screenshots + findings
bun run ci       builds the site      CI only. = check + test against a real build
```

Errors fail; warnings print and pass. An error is always a bug; a warning is usually a
mistake but sometimes deliberate. Don't silence a warning — fix it, or leave it and say why.

Not a check: `bun run fix` (biome --write + tsc). Dependency freshening (`bun update &&
bun audit`) runs once at scaffold time, not from a script.

Do not run `bun run build` unless explicitly asked. `bun run test` reuses the running
dev server; it does not need a build.

## Comments

Explain only what the code cannot. Default to none.

## Favicons

The site builds and ships without one. When the user supplies a logo SVG, follow
`neers-site-scaffold/references/FAVICONS.md` — it generates the whole icon set from that
one file. Nothing else in the project references it.
