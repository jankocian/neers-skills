# Agent rules

## Never guess an API

Next, Tailwind, shadcn, Base UI and Motion all move fast. Before writing code
against any of them, read the installed types (`node_modules/**/*.d.ts`,
`node_modules/next/dist/docs/`) or fetch the live docs. Training data has a
cutoff; guessing produces plausible code that doesn't compile — or worse,
compiles and is silently wrong.

The thought _"I know this library"_ is the signal to check.

## The stack, and why

- **Tokens, never arbitrary values.** No `text-[#fff]`, no `p-[37px]`. The one
  sanctioned exception is an inline `style` rendering a literal token value.
- **shadcn-first.** See below.
- **Surfaces invert; tokens never repeat.** Colour inversion happens only in a
  `.theme-*` scope in `globals.css`. Never `.dark`, never per-element.
- **`"use client"` at the leaf, never the page.**

## Layout

**Every band of a page is a `Section` wrapping a `Container`.** `Section` owns the
vertical rhythm, `Container` owns the page gutter and the max width
(`narrow` | `content` | `wide` | `full`). Both take `className` plus a polymorphic `as`,
so override freely. Never re-apply `px-6` or `mx-auto max-w-*` further down the tree —
that's how gutters drift apart.

Colour is a class, not a component: `theme-base` | `theme-subtle` | `theme-inverse` |
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
   `bunx shadcn@latest add <name>`.
2. **`shadcn add`, then customize.** Customizing the generated file in place is
   correct. Hand-writing a replacement for a component shadcn provides is
   **forbidden**.
3. **Custom is the exception, and must be flagged.** Only hand-write when shadcn
   genuinely has none: layout primitives (`Section`, `Container`) and typography
   (`Text`/`Heading`). Say so, and why.
4. **The style guide IS the spec.** `/style-guide` composes the REAL
   `src/components/ui/*` — never a bespoke preview of how they "would" look.

Known mappings: tag → `badge`, chips/toggles → `toggle`/`toggle-group`,
labels → `label`, selects → `select`, dialogs → `dialog`.

## Typography

**Size is a class, not a prop.** `heading-d1`…`heading-h3`, `type-tagline`, and
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
size.

## Motion

**Compose the primitives by default. Reach for `m.*` when a featured element needs
custom motion. Never reach for `motion`.**

Primitives: `Reveal`, `Stagger` + `StaggerItem`, `MaskReveal` in
`src/components/motion/`. `m` is Motion's own export (`motion/react-m`) — identical
API, features supplied by `LazyMotion` via context. `import { motion }` throws under
`strict`, because it silently re-bundles all 34kB.

- **Easing always from `src/lib/motion.ts`.** No inline `cubic-bezier`.
- `domAnimation` gives up only drag/pan and layout animations (`layout`, `layoutId`).
  Need them? Nest a second `<LazyMotion features={domMax}>` around that subtree.
- Hooks (`useScroll`, `useTransform`, `stagger`, `AnimatePresence`) come from
  `motion/react` and are unaffected by `strict`.
- **Never add `will-change`.** Motion doesn't manage it; a utility class pins a
  compositor layer for the life of the page.

**Never branch the DOM on `useReducedMotion`.** It causes a hydration mismatch
and can strand elements at `opacity: 0` — a blank page for the users who need
reduced motion. `<MotionConfig reducedMotion="user">` in `MotionProvider` already
disables transforms and layout animations while letting opacity fade. That is
the correct behaviour: WCAG's concern is vestibular motion, not fades.

The exception is continuous motion (parallax, marquee, autoplay), which
`MotionConfig` cannot see. Then branch the `transition` or a MotionValue range —
never the markup.

## SEO

`src/lib/site.ts` is the single source of truth. Adding a page means adding a
route there. `sitemap.ts`, `robots.ts`, `llms.txt` and every page's `metadata`
derive from it, and the SEO gate asserts coverage in both directions.

`priority` on `next/image` is deprecated in Next 16 → `preload`. Prefer
`loading="eager"` / `fetchPriority="high"`. Always set `sizes`.

## The loop

Three commands. What separates them is **what they need to run**, nothing else.

```
bun run check    needs nothing        run constantly; this is the pre-commit hook
bun run test     needs a dev server   also writes .neers/ screenshots + findings
bun run ci       builds the site      CI only. = check + test against a real build
```

Errors fail; warnings print and pass. An error is always a bug; a warning is usually a
mistake but sometimes deliberate. Don't silence a warning — fix it, or leave it and say why.

Not checks: `bun run fix` (biome --write), `bun run ui:diff` (upstream shadcn changes),
`bun run freshen` (`bun update && bun audit`).

Do not run `bun run build` unless explicitly asked. `bun run test` reuses the running
dev server; it does not need a build.

## Comments

Explain only what the code cannot. Default to none.

## Favicons

The site builds and ships without one. When the user supplies a logo SVG, follow
`neers-site-scaffold/references/FAVICONS.md` — it generates the whole icon set from that
one file. Nothing else in the project references it.
