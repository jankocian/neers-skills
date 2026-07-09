# Layout audit

`tests/layout/audit.ts` runs inside the page via `page.evaluate()`. Baseline-free: these
are invariants that hold on any correct page at any width, so they catch a bug the first
time it's written. Pixel-diff tools need an approved baseline and cannot.

## Three findings

| kind | meaning |
|---|---|
| `document-overflow-x` | the page scrolls sideways. `detail.culprits` names the elements |
| `zero-size` | something with text or an image rendered no box |
| `img-broken` | loaded but `naturalWidth === 0` |

All three are always bugs, so there is no severity tier and nothing to triage.

**Contrast and touch-target size live in axe**, which knows the exceptions a geometry
check doesn't. Don't reimplement them here.

Nothing that is *usually* a mistake belongs here either. Truncated text, clipped text,
overlapping elements and aspect-ratio mismatch were all removed: they fire on
`line-clamp`, on deliberate ellipses, and on every `object-cover` image. A check people
learn to ignore is worse than no check.

## Horizontal overflow

**The bug is the scrollbar, not the wide element.** No page wants to scroll sideways;
plenty of pages legitimately contain elements wider than the viewport — full-bleed
bands, marquees, carousels — inside `overflow-clip`, `overflow-hidden` or a scroll
container.

So the audit fires only when `documentElement.scrollWidth > clientWidth`. It then walks
the visible elements, discards any that an ancestor clips, and reports the **outermost**
survivors as `culprits`. A deep child inherits its parent's protrusion; fixing the
parent fixes them all.

A negative `left` never scrolls an LTR document, so an off-canvas nav at `left: -300px`
is not a culprit.

`el.scrollWidth > el.clientWidth` is not the check. It measures *container* overflow and
fires on every legitimate scroll container and `<pre>`.

## `audit.ts` runs in the browser

`page.evaluate(fn)` serialises the function and re-evaluates it in page scope. **It has
no access to module scope.** A module-level `const` referenced inside `layoutAudit` is a
`ReferenceError` at runtime, and TypeScript won't warn you. Every constant it needs is
declared in its own body.

Pass arguments as extra `evaluate` params — `page.evaluate(layoutAudit, true)` — never by
closing over them.

SVG elements preserve `tagName` case: an inline `<title>` is `"title"`, not `"TITLE"`.
The `NON_RENDERED` skip-list uppercases before comparing, or every brand mark reports as
`zero-size`.

## Widths

`320` · `375` · `768` · `1280` · `1440`

**320 is non-negotiable** — WCAG 1.4.10 requires no horizontal scroll at 320 CSS px,
which is a 1280px window at 400% zoom.

One test per (route, width), so Playwright parallelises and a failure names one cell.
Never loop widths inside one `test()`.

## `settle()` before every measurement

`tests/routes.ts` exports it. It waits for the stylesheet, fonts, images, and entrance
animations.

- A cold Turbopack dev server serves HTML before the CSS compiles. Measuring an unstyled
  page produces phantom findings.
- Without `document.fonts.ready` you measure fallback-font metrics and the suite flakes.
- A not-yet-loaded image has no intrinsic size.
- Measuring mid-fade makes axe report resolvable text as `incomplete`.

## Reduced motion

Emulate `reduce`, scroll the whole page, then assert **zero** content elements sit below
`opacity: 0.9`. If a `whileInView` animation never fires, content stays invisible and the
page is blank for exactly the users who asked for less motion. (Skip `TITLE`/`DESC`/
`SCRIPT`/`STYLE`, or the brand mark's SVG `<title>` reports as stranded.)

Then assert nothing **positional** and nothing **looping** is still running:

```js
document.getAnimations()
  .filter(a => a.playState === "running")
  .filter(a => a.effect.getTiming().iterations === Infinity ||
               a.effect.getKeyframes().flatMap(Object.keys)
                 .some(p => ["transform","translate","scale","rotate","top","left"].includes(p)))
```

**Never assert "no animations at all."** `reducedMotion="user"` deliberately keeps
opacity animating; a `duration > 200ms` check fails on a correct implementation.

`getAnimations()` sees CSS animations and WAAPI (which Motion uses). It does not see
rAF-driven libraries like GSAP.

## Free wins

```ts
await expect(page.locator("body")).not.toContainText(
  /lorem ipsum|\[object Object\]|undefined|NaN|TODO/i
);
```

## Not measured here

**CLS** — `next/image` and `next/font` remove its two main causes, and a real number
comes from Lighthouse or your host's field data, not a 3-second sleep in a dev-server
test.

**Small-range layout failures** (a bug that only exists between 741 and 758px) — a real
phenomenon, and not worth an 8px sweep in a starter.
