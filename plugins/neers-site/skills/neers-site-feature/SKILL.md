---
name: neers-site-feature
description: >-
  Implement a page, section, or component on a neers marketing site — build it
  against the design system, run the right design passes (arrange, typeset,
  polish, and conditionally critique/colorize/distill), then gate it through
  neers-site-review before handing back. Use when adding or changing anything
  visible on a marketing/landing site scaffolded with neers-site-scaffold: "add a
  hero", "build the pricing page", "implement the testimonials section", "add a
  carousel", "change the footer". Produces polished, accessible, on-system work
  rather than a first draft.
user-invocable: true
argument-hint: [FEATURE=<what to build>]
---

# neers-site-feature

The loop that runs for every page, section and component. Five steps, in order.
Do not hand back to the user until step 4 is green.

## 1. Read context — never start cold

- **`.impeccable.md`** in the project root. If it doesn't exist, run
  `teach-impeccable` first. Every impeccable skill gates on it.
- **`src/lib/design-tokens.ts`** — the typed token source.
- **`/style-guide`** — the real components, as they actually render.
- **`AGENTS.md`** — the project's non-negotiables.

## 2. Build

**The build rules are the project's `AGENTS.md` — the single source of truth. Read it
there; don't rebuild it from memory.** It's the same contract `bun run check` enforces at
commit time, so anything it states is a hard rule, not a preference.

When a rule isn't enough, the depth lives in the scaffold references:
`TOKENS.md` (type + colour tokens), `MOTION.md` (the primitives and `strict`),
`SEO.md` (metadata, JSON-LD, sitemap), `CHECKS.md` (what the gate actually enforces).

Run `bun run check` as you go — under 3 seconds.

## 3. Design passes — adaptive, not a judgment call

Always, in this order:

```
arrange  →  typeset  →  polish
```

Then add, per the table:

| Condition                        | Add                    | Where                       |
| -------------------------------- | ---------------------- | --------------------------- |
| a new page, or a hero            | `critique`             | **first**, before `arrange` |
| section reads flat or monochrome | `colorize`             | before `polish`             |
| section is visibly bloated       | `distill`              | before `polish`             |
| custom Motion was written        | `web-animation-design` | before `polish`             |

Typical section: 3 passes. Typical hero: 5.

Notes that matter:

- **`arrange` and `typeset` contain broken relative links** to
  `reference/spatial-design.md` and `reference/typography.md`. Those paths only
  resolve inside the `frontend-design` skill directory. Read them from there.
- **The impeccable `animate` skill is user-invoked, not automatic — and it is not
  forbidden.** It's an _ideation_ skill: it surveys a whole feature and proposes
  what should move (entrances, micro-interactions, state transitions, delight
  moments). `web-animation-design` is a _critique_ skill: it evaluates motion you
  have already written. Different jobs.

  Run `/animate` yourself when you want proposals. Then treat its output as a
  proposal, not a patch: implement it with the primitives or with `m.*`, take the
  easing from `lib/motion.ts`, and ignore its advice about `will-change` and
  per-element `prefers-reduced-motion` queries, both of which this project forbids.
  Then `web-animation-design` fires, because custom motion was written.

- **When `web-animation-design` runs, override it on reduced motion.** It will tell
  you to disable all animation, opacity included, per element. Don't. See
  `neers-site-scaffold/references/MOTION.md` — `<MotionConfig reducedMotion="user">`
  already does the right thing, and branching the DOM on `useReducedMotion`
  strands content at `opacity: 0`.

## 4. Gate

Invoke **`neers-site-review`**. Do not skip it, and do not hand back to the user
while it's red. If the review finds something you introduced, fix it and re-run.

## 5. Report

Say plainly:

- what changed, and which files
- which design passes ran, and what each one actually changed
- what the review caught, and what you fixed
- anything you deliberately left — with the reason

If a gate failed and you couldn't fix it, **say so with the output**. Don't
describe a red suite as done.

## References

The build contract is the project's `AGENTS.md`. Depth lives in the scaffold skill's
references: `TOKENS.md`, `MOTION.md`, `SEO.md`, `CHECKS.md`.
