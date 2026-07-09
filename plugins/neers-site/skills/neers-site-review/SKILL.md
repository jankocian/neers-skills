---
name: neers-site-review
description: >-
  Catch visual, accessibility and SEO bugs on a neers marketing site before the
  user sees them — deterministic layout audits at seven breakpoints (overflow,
  collision, clipped text, invisible text, broken images), axe-core WCAG 2.2 AA,
  SEO assertions over the served HTML, then a screenshot vision pass guided by the
  deterministic findings. Use when checking a page for visual bugs, reviewing an
  implementation before handing it back, verifying responsiveness, running the
  quality gates, or when the user says "check this page", "does this look right",
  "review the site", "any layout bugs". Also what CI runs.
user-invocable: true
argument-hint: [ROUTE=<path, or all>]
---

# neers-site-review

Three callers: `neers-site-feature` (before handing back), CI, and you, directly.

One command does the work: **`bun run test`**. It needs a running dev server and
nothing else. There is no separate "gate", "visual" or "verify" step — see
`neers-site-scaffold/references/CHECKS.md` for the full map.

## Order of operations — this is load-bearing

**Run the deterministic audits first, then feed their findings into the vision
pass as hints.**

An LLM reviewing a screenshot cold hallucinates spacing problems it cannot
actually measure. An LLM told *"`.hero__cta` protrudes 14px past the viewport at
375px — here's the screenshot"* localizes the bug and explains it correctly. Never
start with the screenshots.

## 0. Server

`playwright.config.ts` sets `reuseExistingServer: true`. If `bun run dev` is
already up, `bun run test` reuses it — no build, no second server.

If nothing is running, start **one** dev server. Do not run `bun run build`; the
checks don't need it, and CI covers the built artifact.

## 1. Run the checks — `bun run test`

One command. It both **asserts** and **produces the evidence** for step 2.

```bash
bun run test
```

| It runs | It asserts |
|---|---|
| `tests/layout/` | horizontal scrollbar, zero-size, broken images × 5 widths, plus reduced motion and placeholder content. See `references/LAYOUT-AUDIT.md` |
| `tests/a11y/` | axe with `wcag22aa`, plus a hand-rolled focus-visibility check. See `references/A11Y-RULES.md` |
| `tests/seo/` | served-HTML assertions, bidirectional sitemap coverage |
| `tests/visual/` | nothing — it **writes** the screenshots and findings JSON below |

Read the failures. They are precise: a finding names a `kind`, a selector, and the
measurement that made it fail.

Written to `.neers/` (gitignored):

```
.neers/findings-<route>-<width>.json     deterministic findings
.neers/shots/<route>@<width>.<n>.png     viewport tiles, ~15% overlap
```

Tiles, not full-page screenshots: a 6000px-tall page downscaled into a vision
model's input loses exactly the 1–3px detail you're hunting for. It caps at 8 tiles
and warns when it truncates.

## 2. Vision pass

For each route, `Read` the findings JSON **first**, then the tiles for that route.
Work the 12-point checklist in `references/VISUAL-CHECKLIST.md` against each tile,
with the findings in hand.

Report a visual bug only if you can name the element and say what's wrong with it.
"The spacing feels off" is not a finding.

### Escalate to Playwright MCP when — and only when — the bug has state

A static PNG cannot show you a hover state, a focus ring mid-transition, a
mid-animation frame, or a dropdown that only exists while open. For those, drive
the live page:

```
mcp__playwright__browser_resize → browser_navigate → browser_hover / browser_click
→ browser_take_screenshot
```

Don't reach for MCP to re-take a screenshot the spec already took. The spec is what
CI runs; keep them the same.

## 3. Fix, then re-run

Fix what you find. Re-run `bun run test`. Repeat until green.

If a finding is a **deliberate** exception — a truncation you meant, a contrast
case axe can't resolve — don't suppress it silently:

- contrast over a gradient/image → add a scrim (the real fix), or add the selector
  to `CONTRAST_MANUAL_REVIEW` in `tests/a11y/pages.spec.ts` **with a comment**
- an intentional `text-truncated` → say so in the report

## 4. Report

State plainly:

- what was checked: which routes, which widths
- what failed, and what you fixed
- **what was not checked** — if you skipped the sweep, say so; if the tile cap
  truncated a long page, say so. A silent cap reads as "covered everything".
- anything that needs a human: a design judgment, a copy decision, a contrast
  case that needs a real fix

Never describe a red suite as done. If a check fails and you can't fix it, say so
and paste the output.

## The honest ceiling

- **axe catches ~57% of real accessibility issues by volume** (Deque's own study,
  2,000+ audits, ~300,000 issues). It is a floor. It cannot see focus *order*,
  whether alt text is meaningful, or whether your copy makes sense.
- Roughly 30% of WCAG 2.2 success criteria are fully automatable; ~60% are
  manual-only.
- The layout audit catches geometry. It cannot see ugly.
- `document.getAnimations()` sees CSS animations and WAAPI (which Motion uses). It
  does **not** see rAF-driven libraries like GSAP.
- CLS via the Layout Instability API is **Chromium-only**.

## References

- `references/LAYOUT-AUDIT.md` — the taxonomy, and three things the internet gets wrong
- `references/A11Y-RULES.md` — what axe catches, what it silently doesn't
- `references/VISUAL-CHECKLIST.md` — the 12 points, and the capture protocol
