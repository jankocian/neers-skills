# Token architecture

**The design system lives in `src/styles/`, split for legibility.** The entry
`globals.css` imports three partials and holds only the cross-cutting bits (library
imports, the dark custom-variant, the base layer):

- **`theme.css`** — the `@theme` tokens + the `heading-*` / `type-*` utilities.
- **`surfaces.css`** — the `.theme-*` scopes + the `@theme inline` mapping.
- **`animations.css`** — keyframes + their `--animate-*` tokens + `mask-line`.

Tailwind inlines every `@import` at build, and `@theme` blocks merge across files, so
the split is purely organisational. Add a token in whichever partial it belongs to.

`lib/design-tokens.ts` is the human layer — names, roles, usage notes, grouping, order.
**It carries no values.** The style guide reads them from the CSS variables at runtime
(`useTokenValue`), so a swatch can never disagree with the stylesheet. `bun run check`
reads every partial and fails if the catalogue names a variable none of them declares.

## Three tiers

1. **`@theme`** (theme.css) — primitives (`--color-*`, `--heading-*`, `--type-*`,
   `--radius-*`, `--shadow-*`, `--ease-*`, `--container-*`). Generates the utilities.
   Headings share one weight (600), set on the `heading-*` utility, not per token.
2. **`.theme-*` scopes** (surfaces.css) — each sets the complete shadcn token set
   (`--background`, `--foreground`, `--primary`, `--border`, …).
3. **`@theme inline`** (surfaces.css) — maps the shadcn tokens back to `--color-*`.

## Rules

**Colour inversion happens only in a `.theme-*` scope.** Never `.dark`, never
per-element. Need a dark section? `className="theme-inverse"`.

**`inline` on tier 3 is required.** Without it Tailwind bakes the value at build
time and `bg-background` inside `.theme-inverse` renders the light colour.

**A primitive may never be named after a shadcn semantic token.** Tier 3 re-points
every one of them, so `--color-muted: var(--muted)` silently overwrites a primitive
of that name and the colour it fed resolves wrong. Forbidden: `muted`, `accent`,
`primary`, `secondary`, `card`, `popover`, `border`, `input`, `ring`, `destructive`,
`background`, `foreground`. Give primitives distinct names — the neutral ramp
(`--color-neutral-600` …) and `--color-brand`, never a bare shadcn token name.
`bun run check` enforces this.

**Prefer tokens; arbitrary values are the rare escape hatch.** Reach for the scale
first — a hardcoded `text-[#fff]` where `text-foreground` exists is the real mistake.
But when the design needs something the scale can't express — a one-off
`grid-cols-[1.15fr_1fr]`, a specific gradient stop — an arbitrary value is correct, not
forbidden. `bun run check` **warns**, it does not block; don't distort the markup to
silence it. (Content images are the firm rule: a real `<img>`/`next/image`, never a CSS
`background-image` — see AGENTS.md.)

**`--font-brand` must match the `variable:` passed to `next/font`** (google or local)
in `app/layout.tsx`, or the site silently falls back to system-ui. A Google face is the
default (`next/font/google` self-hosts it at build); a purchased `.woff2` uses
`next/font/local`. Keep Inter, Roboto and Open Sans out of the fallback stack.

## The `text-*` trap

`tailwind-merge` (inside `cn()`) can't read the Tailwind theme. It resolves `text-*`
with a validator: font-size is tried first but only accepts t-shirt sizes, and
text-colour's validator returns true for anything. So a custom `text-hero` is
classified as a colour, and a following `text-muted-foreground` deletes it.

```
cn("heading-d1", "text-muted-foreground")  →  both survive
cn("text-hero",  "text-muted-foreground")  →  the size is gone
```

So the scale ships as `heading-*` and `type-*` `@utility` blocks. tailwind-merge has
no conflict rule for those prefixes and leaves them alone; `cn()` stays a plain
`twMerge(clsx())` with no config. Plain sizes — body, small, caption — are just
a size, so they use Tailwind's own `text-base` / `text-sm` / `text-xs`.

**Never add a level to the `text-*` namespace.**

## Size is a class, never a prop

Each `heading-*` / `type-*` utility bundles size, line-height, tracking and weight, so
the class is the complete instruction. `Heading` picks the tag from `level` and adds
`text-balance`; `Text` picks the tag from `as` and adds `text-pretty`. Neither has a
`variant`.

```tsx
<Heading level={1} className="heading-d1">   // hero, and the page's only <h1>
<Text className="text-xl text-muted-foreground">
```

**Never bump `level` to get a bigger size.** The tag carries meaning; the class carries
size. One `<h1>` per page — `bun run test` enforces it.

## Adding a surface

Three places:

1. A `.theme-<name>` block in `surfaces.css` setting **every** shadcn token.
2. Its `--primary-hover` in the shared hover rule.
3. `SURFACES` in `lib/design-tokens.ts`.

There is no `Surface` component: a `.theme-*` class paints its own `background-color`
and `color`, from `@layer base`, so it goes straight on the element. `background-color`
does not inherit — children stay transparent and show it through — and any `bg-*`
utility overrides it, because `utilities` is a later cascade layer than `base`.

`bun run check` fails if a surface has no matching CSS block, and if a `theme-*` class
in `src/` names no surface. Both would otherwise render nothing, silently.

## Gotchas

- `hover:bg-primary/90` is imperceptible. Hover uses `--primary-hover` /
  `--secondary-hover`, a real colour step.
- `var(--color-<brand>-x)` where the token doesn't exist resolves to empty. No error.
- `@theme` edits don't reliably HMR under Turbopack. Restart the dev server.
