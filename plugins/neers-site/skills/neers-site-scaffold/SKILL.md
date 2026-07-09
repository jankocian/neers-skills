---
name: neers-site-scaffold
description: >-
  Scaffold a production-grade marketing/landing site from zero — Next.js 16 App
  Router, Tailwind v4 @theme tokens, shadcn/ui on Base UI, a self-hosted variable
  font, .theme-* surface theming, reusable Motion primitives, a dev-only
  /style-guide page, full SEO (metadata, sitemap, robots, JSON-LD, llms.txt, OG
  images, favicons), and the accessibility + layout + SEO quality gates that keep
  it that way. Use when starting a new marketing site, landing page, or
  presentational website — even if the user only says "kick off the site", "set
  up a new landing page", "scaffold the marketing site", or "start a new project
  for <brand>". Produces the same battle-tested foundation every time.
user-invocable: true
---

# neers-site-scaffold

Kicks off a marketing site. Runs **once**, at the start of a project. Afterwards every
page and section goes through `neers-site-feature`, and every change is checked by
`neers-site-review`.

**This exists so the basics are decided once.** Every neers site starts with the same
tokens, the same motion vocabulary, the same accessibility and SEO floor — speed and
consistency, not a catalogue of edge cases. **CI is a litmus test, not a straitjacket:**
things that are always bugs fail the build, house-style drift only warns, so an agent is
told when it strays and you can knowingly accept an exception.

The **system** is the invariant. Only the **brand** — colours, font, mark, name, voice —
changes between projects.

## Never guess an API

Next, Tailwind, shadcn, Base UI, Motion and Biome all move fast, and this skill
will go stale. Before writing code against any of them, **read the installed
types** (`node_modules/**/*.d.ts`, `node_modules/next/dist/docs/`) or fetch the
live docs. The thought *"I know this library"* is the signal to check.

Known-good as of 2026-07 — verify, don't trust:

| | |
|---|---|
| `next` | 16.2.10 |
| `tailwindcss` · `@tailwindcss/postcss` | 4.3.2 (lockstep) |
| `@base-ui/react` | 1.6.0 — **stable**. ⚠ NOT `@base-ui-components/react`, which is deprecated and whose `latest` is an RC, which is why everyone thinks Base UI is still beta |
| `shadcn` (CLI) | 4.13.0 — Base UI is the **default** primitive since 2026-07; Radix is `init -b radix` |
| `motion` | 12.42.2 |
| `@biomejs/biome` | 2.5.3 (pin exact) |
| `bun` | 1.3.14 |
| `@playwright/test` · `@axe-core/playwright` | 1.61.1 · 4.12.1 |

## Phase 0 — Block

**Do not scaffold anything until you have these.** Ask, then wait. A placeholder
becomes permanent.

1. **The brand face.** A variable `.woff2`. If the user names a typeface instead,
   decline **Inter, Roboto, Arial, Open Sans and system defaults** — they are the
   fingerprints of AI-generated work. Say so, and ask for something with a point
   of view.
2. **Brand colour**, site name, a one-line description, and the production URL.

A logo is **not** required. When the user has one, follow `references/FAVICONS.md`;
until then the site builds and ships without it.

Then run **`teach-impeccable`** to write `.impeccable.md`. Every impeccable skill
gates on it, and `neers-site-feature` reads it before touching anything.

## Phase 1 — Scaffold

```bash
"${CLAUDE_SKILL_DIR}/init.sh" ./my-site
```

`${CLAUDE_SKILL_DIR}` resolves to this skill's directory wherever the plugin is installed;
`./my-site` is the new project directory, relative to your working directory. `init.sh`
copies `templates/` (which **is** the project — same
layout, nothing to rearrange), runs `bun install`, freshens within the caret ranges
(`bun update && bun audit`), then installs the git hooks and the Playwright browser. No
CLI decides anything, so the structure is identical every time; majors are picked up by
updating this template, never by a surprise in someone's project.

## Phase 2 — Tokens

`globals.css`, three tiers. Full detail in **`references/TOKENS.md`**.

1. **Primitives** in `@theme` → generates the utilities.
2. **Surfaces** — `:root, .theme-base` plus `.theme-subtle`, `.theme-inverse`,
   `.theme-brand`, each setting the *complete* shadcn token set. Inversion
   happens here and nowhere else. Each `.theme-*` also paints its own
   `background-color` and `color` from `@layer base`, so the class alone is
   enough — there is no `Surface` component.
3. **`@theme inline`** maps shadcn tokens → `--color-*`. The `inline` is
   **required**, or the utilities bake a value and won't invert.

> ⚠ **Never name a primitive after a shadcn semantic token.** Tier 3 re-points every one
> of them, so a primitive called `--color-muted` is silently overwritten by
> `--color-muted: var(--muted)`. The warm grey is `--color-ink-muted`.
> `bun run check` enforces this.

Type scale is `heading-d1 · heading-d2 · heading-h1 · heading-h2 · heading-h3` for
the titling bundles and `type-tagline` for the kicker label. Two display levels,
because marketing pages need a hero size *and* a section-opener size. Everything
that is *just a size* — body, small, caption — uses Tailwind's own `text-base` /
`text-sm` / `text-xs`; a token that only renames a built-in earns nothing.

**Size lives in the class name.** Each `--heading-*` / `--type-*` token bundles size +
line-height + letter-spacing + weight, so `heading-d1` is the complete instruction —
write it straight on the element, never via a lookup prop. A hero is
`<Heading level={1} className="heading-d1">`. Never bump `level` to get a bigger size.

> ⚠ **Never put the custom type scale in the `text-*` namespace.** tailwind-merge
> can't read the Tailwind theme, so it files an unrecognised `text-hero` under
> text-*colour*, and a later `text-muted-foreground` silently deletes the size
> (upstream bug dcastil/tailwind-merge#684). The scale therefore ships as
> `heading-*` and `type-*` `@utility` blocks, which tailwind-merge has no conflict
> rule for and leaves alone — so `cn()` stays a plain `twMerge(clsx())` with zero
> config and no codegen. Pure sizes (`text-base`/`text-sm`/`text-xs`) use Tailwind's
> own, which it classifies correctly. See `references/TOKENS.md`.

## Phase 3 — Components

Everything ships already vendored: `button`, `badge`, `dialog`, `input`, `label`,
`textarea`, `toggle`, `toggle-group` from shadcn, plus our own `Text`/`Heading`
(typography), `Section`/`Container` (layout), `Lightbox` (media) and the motion primitives
(`Reveal`, `Stagger`, `MaskReveal`). Colour context is the `.theme-*` classes, not a
component.

**Vendored components are ours, and frozen at authoring time.** shadcn has no update
command, so `init.sh` runs `shadcn-diff.sh` at scaffold time to show what upstream changed
since — read that output and adopt the improvements worth having by hand. Re-run it any
time from a site root: `bash <plugin>/shadcn-diff.sh [component]`. Keeping our edits small
is what keeps that diff readable, so `button.tsx` uses shadcn's base string verbatim and
changes only the variants.

Need something else? `bunx shadcn@latest add <name>`, then add it to `/style-guide` and to
the `VENDORED` list in `shadcn-diff.sh`.

**The style guide IS the spec.** It composes the real `components/ui/*`.

## Phase 4 — Motion

`MotionProvider` = `<LazyMotion features={domAnimation} strict>` ›
`<MotionConfig reducedMotion="user">`.

`m` is Motion's own export (`motion/react-m`) — the same components with no features
baked in; `LazyMotion` supplies them through context. `strict` is load-bearing:
without it, one `import { motion }` anywhere silently pulls in all 34kB.

We pass `features={domAnimation}` **synchronously**, so the main chunk carries
~20kB (4.6 + 15), not the 4.6kB the docs advertise for the initial render. The
saving over full `motion` is ~14kB. `domAnimation` gives up exactly two things:
drag/pan gestures and layout animations (`layout`, `layoutId`). `whileInView` is
included, despite the docs' feature list omitting it.

Custom animation is allowed and expected for featured elements — use `m.*`, never
`motion`. See `references/MOTION.md`.

Then **invoke `web-animation-design`** against `src/components/motion/*` to settle
easing and duration, and record the verdict in `.impeccable.md`.

> ⚠ **Override `web-animation-design` on one point.** It says every animated
> element needs its own `prefers-reduced-motion` query disabling *all* animation,
> opacity included. Do not do that here. `reducedMotion="user"` already disables
> transforms and layout animations while preserving opacity — which is what
> Motion's own docs specify, and what WCAG intends (the concern is vestibular
> motion, not fades). Branching the DOM on `useReducedMotion` causes a hydration
> mismatch and can strand content at `opacity: 0`: a **blank page**. See
> `references/MOTION.md`.

## Phase 5 — Style guide

`/style-guide`, twelve sections, data-driven from `lib/design-tokens.ts`,
composing the **real** `components/ui/*`.

Three layers keep it off the live site: `notFound()` in production,
`robots: { index: false }`, and a `robots.txt` disallow via `privateRoutes`.

## Phase 6 — The marketing layer

`lib/site.ts` is the single source of truth: every route, title and description lives
there, and `sitemap.ts` / `robots.ts` / `llms.txt` / every page's `metadata` derive from
it. `bun run check` asserts coverage in **both** directions, so a page can't drift out of
the sitemap.

Detail in **`references/SEO.md`**.

Favicons are a separate, later errand: no icon is required to build, ship or pass the
checks. The moment the user points at a logo file, read **`references/FAVICONS.md`** —
it asks the two questions worth asking and generates every icon from that one SVG via
`bunx`, so nothing about the pipeline lands in the repo.

## Phase 7 — Verify

```bash
bun run check          # no browser, no build
bun run dev            # one dev server, max
bun run test           # browser checks + writes .neers/
```

Both must be green. Full map in `references/CHECKS.md`.

Then confirm the checks bite — a check that never fails is decoration. Inject each bug,
confirm the named command fails, revert.

| Inject | Fails |
|---|---|
| a `100vw` element inside a container with side padding | `test` → `document-overflow-x` @320 |
| `className="w-[110vw]"` | `check` → arbitrary value |
| a `--color-muted` primitive in `globals.css` | `check` → token collision |
| a page with no `metadata` export | `check`, and the pre-commit hook |
| a `lib/site.ts` route with no `page.tsx` | `check` |
| an `<img>` with no `alt` | `test` → `image-alt`, and `seo` |
| a page `description` under 50 chars | `test` → description length |
| white text on a gradient | `test` → contrast under `incomplete`, violations stays empty |
| **two adjacent** 20×20 buttons | `test` → `target-size` |
| `import { motion }` inside `LazyMotion strict` | throws at runtime |

Two traps when writing those injections:

- A wide element inside `overflow-clip` is **not** a bug and won't fail. The check
  fires on a real horizontal scrollbar. Inject something that actually scrolls the page.
- A **lone** 20×20 button passes — WCAG 2.5.8 exempts undersized targets with enough
  spacing. Use two adjacent ones.

The most important check: emulate `prefers-reduced-motion: reduce`, scroll the whole
page, assert **zero** content elements sit below `opacity: 0.9`. That's the failure that
turns the page blank. If it fires, suspect the harness first — hitting `127.0.0.1`
instead of `localhost` blocks Next's dev resources and the page never hydrates.

**Do not run `bun run build` unless asked.**

## References

- `references/TOKENS.md` — the three-tier token architecture, surface contract
- `references/MOTION.md` — the motion vocabulary and the reduced-motion override
- `references/SEO.md` — metadata, sitemap, robots, JSON-LD, llms.txt, OG
- `references/FAVICONS.md` — when a logo arrives: one SVG → every icon, via `bunx`
- `references/CHECKS.md` — the three commands, and what each asserts
