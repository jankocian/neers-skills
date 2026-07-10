/**
 * The easing vocabulary. Every animation takes its curve from here.
 *
 * These mirror the `--ease-*` tokens in theme.css. Motion animates in JS and can't
 * read a CSS custom property per frame, so the literals live in both places — change
 * one, change the other.
 *
 * Durations are not centralised: they differ per primitive, and live as defaults on
 * each component.
 */

/** Entrances and exits. The default. */
export const EASE_OUT = [0.22, 0.61, 0.36, 1] as const;

/** Elements already on screen that move or morph. */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/** Sectional reveals — a long, decisive settle. What the primitives use. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Scroll-reveal viewport defaults, shared by Reveal and Stagger.
 * `amount: "some"` (any pixel visible), never a ratio: an element taller than
 * the viewport can't reach a fractional threshold, so `whileInView` would never
 * fire and the content would stay stranded at opacity 0. */
export const VIEWPORT = { once: true, amount: "some" } as const;
