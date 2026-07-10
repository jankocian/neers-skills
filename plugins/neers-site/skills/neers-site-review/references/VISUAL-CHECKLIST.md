# Visual review

## Order matters more than the checklist

**Deterministic findings first, screenshots second.**

An LLM handed a screenshot with no context invents problems: it will tell you the
spacing is inconsistent when it is measuring a JPEG artifact, and it will miss the
14px overflow because the tile was downscaled. An LLM handed
`{"kind":"document-overflow-x","detail":{"by":14,"culprits":[".hero__cta"]}}`
*and* the screenshot will find it, name it, and explain it.

Read `.neers/findings-<route>-<width>.json` before you open a single PNG.

## Capture protocol

What `bun run test` captures, and why:

- **`reducedMotion: "reduce"`** — the single best flake-killer. A mid-animation frame
  is a false positive generator.
- **`await document.fonts.ready`**, and every image `complete`, before any capture.
- **Viewport tiles with ~15% overlap, not full-page.** A 6000px marketing page
  downscaled to a vision model's input loses the 1–3px detail you're looking for.
  The overlap means nothing falls between two tiles.
- **`375×812` (mobile) · `768×1024` (tablet) · `1440×900` (desktop).** 1920 rarely
  reveals anything 1440 doesn't.
- Capped at 8 tiles per route/width. It warns when it truncates. **Repeat that warning
  in your report** — a silent cap reads as "covered everything".

Capture more yourself (Playwright MCP) only when the review calls for it: `320×568`
for reflow, `deviceScaleFactor: 2` when judging text legibility (a 2× tile costs 4×
the tokens), and dark mode if the site has one.

## The checklist

Per tile, with the findings in hand:

1. **Clipped or truncated text.** Any `…` you didn't ask for? Text running under
   another element?
2. **Illegible text.** Low contrast, or text over an image/gradient. Cross-reference
   the `incomplete` contrast entries from the a11y gate — that's exactly where they
   land.
3. **Right-edge cutoff.** Anything running off the side, or a horizontal scrollbar.
   The layout audit will already have named the element.
4. **Alignment.** Card-grid baselines, icon + label centring, optical vs mathematical
   centre.
5. **Vertical rhythm.** Equal gaps between repeated blocks. Uneven section padding is
   the most common real finding.
6. **Orphans and widows.** A heading whose last word wraps alone. `text-balance` on
   headings, `text-pretty` on body — both are already on the type variants.
7. **Aspect ratio.** Stretched logo, squashed avatar — eyeball it; no deterministic
   check covers this.
8. **Empty regions.** A failed image, a component that rendered nothing, a stranded
   skeleton or spinner.
9. **Placeholder content.** `Lorem ipsum`, `TODO`, `undefined`, `NaN`,
   `[object Object]`. The layout suite greps for these — but it can't see
   placeholder *imagery*.
10. **The primary CTA.** Above the fold, and visually dominant. If two things are
    primary, nothing is.
11. **Mobile.** Is the nav usable? Are touch targets ≥24×24 (ideally 44×44)? Does the
    hero still read at 375px, or has `d1` eaten the screen?
12. **Dark mode — only if the site has one.** Any element still carrying a
    light-mode-only colour — a white box on a dark ground, an invisible border,
    text that vanishes into the surface. (The scaffold ships light-only; its
    `.theme-inverse` sections are covered by the normal capture.)

## Escalate to Playwright MCP only for state

A static PNG cannot show you:

- hover and active states
- focus rings mid-transition
- a mid-animation frame
- a dropdown, popover or dialog that only exists while open
- anything behind a scroll-triggered threshold

Those, and only those, justify driving the live page:

```
mcp__playwright__browser_resize → browser_navigate → browser_hover / browser_click
→ browser_take_screenshot
```

Don't use MCP to re-take a screenshot the spec already took. The spec is what CI
runs; the moment the two diverge, the gate stops meaning anything.

## Reporting

A finding names the element and says what is wrong with it:

> `.pricing-card:nth-child(2)` sits 6px lower than its siblings at 1440px — its
> badge adds height the others don't reserve.

Not a finding:

> The pricing section feels a little cramped.

If it's a design judgment rather than a bug, say that explicitly and hand it to the
user. That's what `critique` is for, and it's not this skill's job.

## What this pass cannot do

It catches geometry and rendering. It does not catch **ugly**. A page can pass every
gate here and still be generic, timid, or badly composed — that's the impeccable
suite's job (`critique`, `arrange`, `typeset`, `polish`), which runs in
`neers-site-feature` *before* this one.
