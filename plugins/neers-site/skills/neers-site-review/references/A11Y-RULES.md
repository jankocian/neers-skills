# Accessibility rules

`tests/a11y/pages.spec.ts` — `@axe-core/playwright`, `fullyParallel`.

Lighthouse CI is the wrong tool for a11y: it asserts a *score*, not violations. Use it
for perf/SEO. Playwright's `toMatchAriaSnapshot()` is a baseline regression test — it
tells you the tree changed, never that a button has no name.

## The tags

```ts
.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
```

**`wcag22aa` is not decorative.** `target-size` (WCAG 2.2 §2.5.8, minimum 24×24 CSS
px) is **disabled by default** — Deque turned it off pending wider WCAG 2.2 adoption.
Drop the tag and small touch targets pass silently.

⚠ **`target-size` has a spacing exception.** A lone 20×20 button passes — WCAG 2.5.8
exempts undersized targets with enough spacing around them. The rule fires only when
small targets sit next to each other (axe then also emits `target-offset`).

Deque's own position: `target-size` is likely the *only* WCAG 2.2 rule that can be
automated without false positives. The other eight new SCs (Focus Not Obscured,
Focus Appearance, Dragging Movements, Consistent Help, Redundant Entry, Accessible
Authentication) are manual.

## The trap: contrast lands in `incomplete`

axe's `color-contrast` check assumes **a single flat background colour**. Over a
gradient, an image, or a semi-transparent stack it cannot resolve one, so the node
goes to `results.incomplete` — **not** `results.violations`.

Assert only on `violations` and your hero headline is untested. That's the exact
place white-on-gradient text lives.

```ts
const { violations, incomplete } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
expect(violations).toEqual([]);
const unresolved = incomplete.filter(i => i.id === "color-contrast");
expect(unresolved.flatMap(...)).toEqual([]);  // minus an explicit allowlist
```

**The real fix is a design fix.** Put a solid or `rgba()` scrim between the
image/gradient and the text. axe then resolves a single colour and genuinely tests
it — and the text becomes readable, which was the point. `text-shadow` and
`-webkit-text-stroke` do not satisfy axe, and barely help humans.

Only if a case is genuinely fine: add its selector to `CONTRAST_MANUAL_REVIEW`,
**with a comment saying why**. A new one then fails the build.

### axe must not run mid-animation

`Reveal`'s opacity fade is still running at `load`. axe cannot resolve a background
through a partially transparent ancestor, so it reports the text as `incomplete` —
indistinguishable from a real gradient case. `settle()` in `tests/routes.ts` awaits
`document.getAnimations()` (excluding infinite ones) before any scan. Don't remove it.

### `document-title` vs the brand mark

An inline SVG's `<title>` (the accessible name of the brand mark) satisfies a naive
`$("title")` selector, so the SEO spec asserts on `head > title`. axe's `document-title`
is what catches a genuinely missing document title.

### `NEXTJS-PORTAL`

The Next dev-tools overlay is a focusable custom element with no focus ring, and it
does not exist in a production build. The focus test skips `NEXTJS-*` rather than
failing on it.

## The gap: focus visibility

WCAG 2.4.7 (Focus Visible), 2.4.11 (Focus Not Obscured) and 2.4.13 (Focus
Appearance) have **no axe rule**. There is no `focus-visible` check. So we roll one.

The subtlety: **`element.focus()` does not match `:focus-visible`.** The browser only
applies that pseudo-class after a keyboard interaction. A headless `.focus()` shows
no ring, so a naive test either passes everything or fails everything.

The spec walks the real tab order with `page.keyboard.press("Tab")` — a trusted event —
pins the focused node as an `ElementHandle` (a `:focus` locator stops matching the
instant you blur it), and compares computed styles focused vs blurred. Screenshots
wouldn't work: an `outline-offset` ring is drawn outside the element's box.

Capped at 25 tab stops.

## What each rule family catches

| Issue | axe rule ids |
|---|---|
| Contrast | `color-contrast` (`color-contrast-enhanced` = AAA, off by default) |
| Missing alt | `image-alt` `input-image-alt` `area-alt` `role-img-alt` `svg-img-alt` `object-alt` |
| Nameless controls | `link-name` `button-name` `input-button-name` `aria-command-name` `aria-toggle-field-name` `frame-title` `aria-tab-name` |
| Form labels | `label` `form-field-multiple-labels` `select-name` `aria-input-field-name` |
| Heading order | `heading-order` `empty-heading` `page-has-heading-one` — all **best-practice**, not WCAG-tagged |
| Landmarks | `region` `landmark-one-main` `landmark-unique` `bypass` (only `bypass` is wcag2a) |
| Target size | `target-size` — **wcag22aa only** |
| ARIA validity | `aria-valid-attr` `aria-valid-attr-value` `aria-allowed-attr` `aria-allowed-role` `aria-required-attr` `aria-required-children` `aria-required-parent` `aria-roles` `aria-hidden-focus` `aria-prohibited-attr` |

Note `heading-order` and `page-has-heading-one` carry the `best-practice` tag, not a
WCAG tag — the tag list above does **not** include them. Add `"best-practice"` if you
want them, and expect noise.

## The honest ceiling

axe catches roughly 57% of accessibility issues by volume, and about 30% of WCAG 2.2's
success criteria are fully automatable. A green suite is a **floor**, not a pass.

What no automated check will tell you:

- whether the alt text is *meaningful* (`alt="image"` passes `image-alt`)
- whether the focus **order** makes sense
- whether the heading structure describes the content
- whether an error message is understandable
- whether a carousel has a pause control (it just isn't a rule)
- whether the page is usable with a screen reader

Tab through the page yourself. It takes ninety seconds.
