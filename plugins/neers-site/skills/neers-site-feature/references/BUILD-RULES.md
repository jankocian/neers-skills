# Build rules

## Never guess an API

Read the installed types (`node_modules/**/*.d.ts`,
`node_modules/next/dist/docs/`) or fetch the live docs before writing code against
Next, Tailwind, shadcn, Base UI or Motion. The thought *"I know this library"* is
the signal to check. Then grep the project for existing usage and match it.

## Components

**shadcn-first, always.** Before building anything, check the registry — the
`shadcn` MCP (`search_items_in_registries`, `view_items_in_registries`) or
`bunx shadcn@latest add <name>`. If shadcn has it, `add` it and customize the
generated file in place. Customizing is correct. **Hand-writing a replacement for
a component shadcn provides is forbidden.**

Known mappings: tag → `badge` · chips/toggles → `toggle` / `toggle-group` ·
labels → `label` · selects → `select` · dialogs → `dialog` · carousels →
`carousel`.

Custom is the exception and must be **flagged out loud**, with the reason. The
existing exceptions: `Text`/`Heading` (typography), and `Section` / `Container`
(layout).

**Vendored components are ours.** `bun run ui:diff [component]` shows what shadcn changed
upstream; it writes nothing. Merge what's worth having by hand, and keep our edits small.

**The style guide IS the spec.** `/style-guide` composes the real `src/components/ui/*`.
Add a component worth reusing, add it there too — and to `VENDORED` in
`scripts/ui-diff.ts` if it came from shadcn.

## Overlays

`Dialog` for anything with content or an action — Base UI gives it a focus trap, ESC,
scroll lock and ARIA. `Lightbox` only for viewing media: it wraps
`yet-another-react-lightbox` with our backdrop and reduced-motion handling, and brings
swipe, pinch-zoom and video.

A dialog is not a lightbox. Don't build a gallery out of one.

## Layout

**Every band of a page is a `Section` wrapping a `Container`.** `Section` owns the
vertical rhythm, `Container` owns the page gutter and the max width
(`narrow` | `content` | `wide` | `full`). Both take `className` plus a polymorphic `as`,
so override freely. Never re-apply `px-6` or `mx-auto max-w-*` further down the tree —
that's how gutters drift apart.

Colour is a class, not a component: `theme-base` | `theme-subtle` | `theme-inverse` |
`theme-brand`. A theme class paints its own background and text, so it goes straight on
the element.

```tsx
<footer className="theme-inverse">
  <Section>
    <Container size="wide">…</Container>
  </Section>
</footer>
```

Neither has a heading, an eyebrow, or a title. Compose those yourself; the day one
section needs a different header, a baked-in one becomes a prop soup.

## Styling

- **No arbitrary Tailwind values.** `text-[#fff]`, `p-[37px]`, `w-[12rem]` — all
  forbidden. Everything comes from a token. ch-based measures are tokens too.
  - Sanctioned exception: an inline `style` rendering a literal token value.
  - Vendored shadcn `data-[…]` / `[&_svg]` variants are fine; those aren't values.
- **Surfaces invert; tokens never repeat.** Need a dark section? Put `theme-inverse`
  on it. Never `.dark`, never a per-element colour override. Adding a surface is in
  `neers-site-scaffold/references/TOKENS.md`.
- **`outline-none` kills the focus ring.** Tailwind v4's `outline-none` sets
  `--tw-outline-style: none`; `outline-2` only sets the width. Any focus ring built
  on `outline` needs `focus-visible:outline-solid`, or it renders nothing and fails
  WCAG 2.4.7 silently. Prefer `focus-visible:ring-2` (a box-shadow) for new components.
- **Never name a new token after a shadcn semantic token.** `@theme inline` re-points
  `--color-muted`, `--color-accent`, `--color-primary` and friends. A primitive with
  one of those names is silently overwritten. Use `--color-ink-muted`, etc.
- **No monospace.** `code, kbd, samp, pre` inherit the brand face.
- Type: the scale is `heading-d1 · heading-d2 · heading-h1 · heading-h2 · heading-h3`
  plus `type-tagline`. Each bundles size + line-height + tracking + weight, so the
  **class is the complete typographic instruction** — there is no `variant` prop. A
  hero is `<Heading level={1} className="heading-d1">`: the tag is visible, so "one
  `<h1>` per page" is obvious rather than encoded in a prop. **Never bump `level` to
  get a bigger size.**
  - Plain sizes use Tailwind's own — `text-xl`, `text-base`, `text-sm`, `text-xs`.
  - **Never invent a `text-*` size class.** tailwind-merge files anything it doesn't
    recognise under text-*colour*, so a following `text-muted-foreground` silently
    deletes it. That's why the scale is `heading-*` / `type-*`.
- `Heading` adds `text-balance`, `Text` adds `text-pretty`. That is all they do.
  Colour is a class too: `text-muted-foreground`, `text-primary`.

## Server / client boundary

`"use client"` goes on the **leaf**, never the page or layout. A page stays a
Server Component; small client primitives take `children` and wrap them, and those
children pass through as an RSC payload without entering the client bundle.

For a Server Component that needs one `motion.div` and nothing else:
`import * as motion from "motion/react-client"`. It's a pre-marked client module.
It doesn't shrink the bundle — it moves the boundary.

## Motion

**Compose the primitives by default. Reach for `m.*` when a featured element
genuinely needs custom motion. Never reach for `motion`.**

Primitives live in `src/components/motion/`: `Reveal`, `Stagger` + `StaggerItem`,
`MaskReveal`. They cover the ordinary case, and using them is what makes a page feel
like one page rather than six.

- **`m` is Motion's own export** (`motion/react-m`) — identical API to `motion.div`,
  but with no features baked in; `LazyMotion` supplies them via context. `strict`
  makes `import { motion }` throw, because it silently re-bundles all 34kB.
  `strict` polices *components only* — hooks are unaffected.
- Import components from `motion/react-m`; everything else (`stagger`, `LazyMotion`,
  `AnimatePresence`, `useScroll`, `useTransform`, `useReducedMotion`) from
  `motion/react`.
- **What you can't do under `domAnimation`:** drag/pan gestures, and layout
  animations (`layout`, `layoutId`). Everything else — `animate`, `exit`,
  `variants`, `whileHover`, `whileInView`, MotionValues — works. Need drag or
  `layoutId`? Nest a second `<LazyMotion features={domMax}>` around that subtree
  only; don't promote the root provider.
- **Easing always comes from `src/lib/motion.ts`.** No inline `cubic-bezier`
  literals, no new curves without adding them there and to `globals.css`.
- Every direct child of `<Stagger>` must be a `<StaggerItem>`, or variants don't
  propagate and the group appears all at once.
- `MaskReveal` fires on mount, not on scroll. Above-the-fold headlines only.
- **Never branch the DOM on `useReducedMotion`.** Hydration mismatch; strands
  content at `opacity: 0`. `MotionProvider`'s `<MotionConfig reducedMotion="user">`
  already disables transforms and keeps opacity. The one legitimate use is
  continuous motion (parallax, marquee, autoplay), which `MotionConfig` cannot see —
  and then you branch the `transition` or a MotionValue range, never the markup.
- **Never add `will-change`.** Motion doesn't manage it, so a utility class pins a
  compositor layer permanently.

Writing custom motion adds `web-animation-design` to the design-pass table. That's
the deal: freedom, then critique. Full recipe in
`neers-site-scaffold/references/MOTION.md`.

## Images

- **Always set `sizes`.** Without it the browser assumes `100vw` and over-fetches.
  `sizes` also changes what Next generates: with it, a width-descriptor `srcset`;
  without it, only `1x`/`2x`.
- **`priority` is deprecated in Next 16 → `preload`.** And the docs then say to
  prefer `loading="eager"` / `fetchPriority="high"`. Don't combine them.
- `fill` needs a positioned, sized parent.
- Setting `width` via CSS without `height: auto` distorts the image and causes CLS.
- `next/image`, never a bare `<img>` — the layout audit flags missing dimensions.

## Links

`next/link` for every internal href — that's what buys prefetching. A bare `<a>` to
an internal route is a bug.

## Adding a page

1. Add the route to `src/lib/site.ts` (`path`, `title`, `description` 50–160 chars,
   `changeFrequency`, `priority`).
2. `export const metadata: Metadata = pageMetadata("/that-route")`.
3. Exactly one `<h1>`.

`bun run check` fails on a page with no `metadata` export, on a page missing from
`site.ts`, and on a `site.ts` route with no page.

## Code

- Prefer no state. Then prefer derived state. Then `useState`.
- Don't extract a shared abstraction that costs more code than the duplication it
  removes. Two similar sections are fine. Three is a component.
- Comments explain only what the code cannot. Default to none.

## The loop

Two commands while you work. They differ only in **what they need to run**.

```
bun run check    needs nothing         ~3s   run constantly
bun run test     needs a dev server    ~5s   also writes .neers/ for the review pass
```

`bun run check` is also the pre-commit hook, so anything it catches is a hard
violation, never a preference. `bun run ci` exists but is CI's job: it's `check` +
`test` against a real `next build`.

One dev server, max. `bun run test` reuses it. **Never run `bun run build` unless
asked.**

`bun run check` will fail on an arbitrary Tailwind value, a page missing `metadata`,
and a `--color-*` primitive that collides with a shadcn token. All three are rules
stated above; now they're enforced rather than hoped for.
