# Motion

**Compose the primitives by default. Reach for `m.*` directly when a featured
element genuinely needs custom motion. Never reach for `motion`.**

That third clause is a bundle-size rule, not a taste rule. The first two are the
taste rule: a site where every component invents its own easing reads as noise, so
`Reveal` and `Stagger` cover the ordinary case — but "no bespoke animation, ever"
was never the policy, and custom motion is a first-class option.

## The provider

```tsx
<LazyMotion features={domAnimation} strict>
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
</LazyMotion>
```

### What `m` is

`m` is Motion's own export — `motion/react-m`. Same components, same props, same
API as `motion.div`. The only difference: **`m` ships with zero animation features
baked in.** The features arrive through React context, supplied by `LazyMotion`.

`motion.div` carries its features with it. `m.div` receives them. That's the whole
trick, and it is why the two are otherwise interchangeable.

### What it costs

| | size |
|---|---|
| `motion` component | 34 kB, all features pre-bundled |
| `m` + `LazyMotion` | 4.6 kB for the initial render |
| `domAnimation` | +15 kB — animations, variants, exit, tap/hover/focus, `whileInView` |
| `domMax` | +25 kB — all the above, plus pan/drag and layout animations |

`features={domAnimation}` is passed **synchronously**, so those 15 kB land in the main
chunk: we ship ~20 kB. The 4.6 kB figure needs the async form
(`features={() => import(…)}`), which defers loading past hydration and costs a flash of
unanimated hero. Not worth it here.

**`strict` is load-bearing.** Without it, one `import { motion }` anywhere in the
tree silently pulls in all 34 kB and nothing tells you. With it, that import throws
at runtime:

> You have rendered a `motion` component within a `LazyMotion` component. This will
> break tree shaking. Import and render `m` components instead.

### Import rules

- Components → **`motion/react-m`** (`import * as m from "motion/react-m"`).
- Everything else → **`motion/react`**: `LazyMotion`, `MotionConfig`,
  `AnimatePresence`, `stagger`, `useScroll`, `useTransform`, `useSpring`,
  `useAnimate`, `useInView`, `useReducedMotion`.
- `stagger` is *not* exported from `react-m` — only the `m` components are.
  Importing it from `motion/react` costs nothing extra; `LazyMotion` already pulls
  that module in.
- `strict` polices **components only**. Hooks and utilities are unaffected, because
  they aren't components.

### What `domAnimation` gives up

Exactly two things:

- **pan / drag gestures** (`drag`, `dragConstraints`, `onPan`)
- **layout animations** (`layout`, `layoutId`, shared-element transitions)

Everything else works: `animate`, `initial`, `exit` + `AnimatePresence`,
`variants`, `whileHover`, `whileTap`, `whileFocus`, `whileInView`, `transition`,
and every MotionValue hook.

**`whileInView` ships in `domAnimation`**, despite being omitted from the docs' feature
list.

If a single section truly needs drag or `layoutId`, do **not** promote the root
provider to `domMax` (+10 kB on every page). Nest a second `LazyMotion` around just
that subtree:

```tsx
import { LazyMotion, domMax } from "motion/react";
<LazyMotion features={domMax}>{/* only the draggable thing */}</LazyMotion>
```

`motion/react-client` is a different tool: it's the RSC-friendly entry, so a Server
Component can render `<motion.div>` without a `"use client"` boundary. It does not
reduce the bundle; it moves the boundary. It also bypasses `LazyMotion`, so prefer
a small `"use client"` leaf using `m.*`.

## Writing a custom animation

`strict` does not stop you animating. It stops one import. Use `m.*` and you have
Motion's full expressive surface.

```tsx
"use client";

import { useScroll, useTransform } from "motion/react";
import * as m from "motion/react-m";

import { EASE_OUT_EXPO } from "~/lib/motion";

export function HeroDevice() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <m.div
      style={{ y }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
      whileHover={{ scale: 1.02 }}
    />
  );
}
```

Four house rules, and they are the whole cost of the freedom:

1. **Easing comes from `lib/motion.ts`.** Never an inline `cubic-bezier` literal,
   never a new curve. If the vocabulary is genuinely missing something, add it
   there and to `theme.css`, and say so.
2. **No `will-change`.** Motion doesn't manage it, so a utility class pins a
   compositor layer for the life of the page.
3. **No DOM branching on `useReducedMotion`.** See below.
4. **It triggers a review.** Custom Motion adds `web-animation-design` to the
   design-pass table in `neers-site-feature`. That's the deal: freedom, then critique.

Continuous motion — parallax, marquees, autoplay — is the one place
`useReducedMotion()` is legitimate, because `MotionConfig` cannot see it. Branch the
`transition` or the MotionValue range, never the markup:

```tsx
const reduce = useReducedMotion();
const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -80]);
```

## Reduced motion

`<MotionConfig reducedMotion="user">` disables transform and layout animations while
preserving opacity. `Reveal`'s `y` snaps to 0, its opacity still fades, and content
always arrives. The primitives carry **zero** reduced-motion logic.

**Never branch the DOM on `useReducedMotion`.** It causes a hydration mismatch, and
elements strand at `opacity: 0` — a blank page for exactly the users who asked for less
motion. The vestibular concern is movement, not fades.

`web-animation-design` will tell you to add a per-element `prefers-reduced-motion` query
disabling all animation, opacity included. Ignore that part.

`useReducedMotion()` is only for what `MotionConfig` cannot see: continuous loops,
`useScroll`/`useTransform` parallax, autoplaying carousels. Even then, branch the
`transition` or a MotionValue range — **never the markup**.

Corollary for the checks: **never assert "no animations running" under reduced
motion** — the opacity fade is supposed to run. Assert that nothing positional animates
and nothing loops.

If content is stranded at `opacity: 0`, suspect the harness before the code.
`whileInView` never fires if the page never hydrates, and Next 16 blocks cross-origin
dev resources: driving the dev server at `127.0.0.1` while it announces `localhost`
blocks `/_next/*-hmr` and hydration never completes.

No CSS `!important` failsafe either — it fights the config and strands the same
elements.

## `will-change`

**Don't set it.** Motion doesn't manage `will-change`, so a static
`will-change-transform` class pins a compositor layer for the life of the page. Motion
already composites `transform` and `opacity` off the main thread.

## Stagger

```tsx
const container = {
  hidden: {},
  show: { transition: { delayChildren: stagger(0.09, { startDelay: 0.04 }) } },
};
```

`delayChildren: stagger(n)` is the current API — `staggerChildren: n` is deprecated and
can't express `from` or `ease`.

`stagger(duration, { startDelay, from, ease })` — `from` is `"first" | "center" |
"last" | <index>`, default `"first"`. `ease` redistributes the delays across the
total stagger time. Always pass `duration` explicitly; its default is undocumented.

The parent must declare the `hidden`/`show` keys — even as `{}` — or variants
don't propagate. Every direct child must be a `<StaggerItem>`.

## Easing

**`src/lib/motion.ts` is the vocabulary** — `EASE_OUT` for entrances and exits,
`EASE_IN_OUT` for things already on screen, `EASE_OUT_EXPO` for sectional reveals.
`theme.css` holds the CSS twins under `--ease-*`. Motion can't read a custom property
per frame, so the literals live in both; change one, change the other.

Never an inline `cubic-bezier`. `ease-in` almost never; `linear` only for marquees and
progress.

Durations are not centralised — they differ per primitive and live as defaults on each
component.

- **Paired elements share easing and duration.** Modal + overlay. Drawer + backdrop.
- **Exits can be ~20% faster than entrances.**
- Something a user sees on every page load should be quiet.
