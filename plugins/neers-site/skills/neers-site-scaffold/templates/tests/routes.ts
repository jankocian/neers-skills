import { routes } from "../src/lib/site";

/** Public routes, from the single source of truth. Never hardcode a list. */
export const ROUTES = routes.map((r) => r.path);

/**
 * WCAG 1.4.10 (Reflow) requires no horizontal scroll at 320 CSS px — that width is
 * non-negotiable. The rest are the real-device clusters. Five is enough: 1024 and
 * 1920 have never caught anything 768 and 1440 didn't.
 */
export const WIDTHS = [320, 375, 768, 1280, 1440] as const;

/** Screenshot sizes for the vision pass. 1920 rarely reveals what 1440 doesn't. */
export const SHOTS = [
  { label: "mobile", width: 375, height: 812 },
  { label: "tablet", width: 768, height: 1024 },
  { label: "desktop", width: 1440, height: 900 },
] as const;

/**
 * Wait for a *measurable* page. Every assertion downstream depends on this.
 *
 * Three waits, each earning its place:
 *   fonts    — without it you measure fallback-font metrics and the layout suite
 *              flakes at random widths.
 *   images   — a not-yet-loaded image has no intrinsic size.
 *   animations — entrance animations (Reveal, Stagger) fade opacity 0→1. axe
 *              scanning mid-fade reports a transiently low contrast, and the
 *              layout audit measures a faded box. Both are false positives.
 *
 * Infinite animations are excluded, or this would never resolve.
 *
 * The animation wait DRAINS, waits two frames, then DRAINS AGAIN. Motion starts
 * `whileInView` entrances a few frames after hydration (via IntersectionObserver),
 * so a single `getAnimations()` read can fire before they register and resolve
 * instantly — leaving axe to scan text at opacity 0. The frame gap lets stragglers
 * register; the second drain waits them out.
 */
export async function settle(page: import("@playwright/test").Page) {
  await page.waitForLoadState("load");

  // A cold Turbopack dev server can serve HTML before the stylesheet compiles.
  // Measuring an unstyled page produces phantom contrast and layout findings.
  await page.waitForFunction(
    () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim() !== "",
  );

  await page.evaluate(() => document.fonts.ready);

  // next/image is lazy by default: a below-the-fold image never fetches, so its
  // `complete` stays false and the wait below would hang on any tall, image-heavy
  // page. Step through the page to trigger every lazy load, then return to the top.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let y = 0;
        const step = () => {
          window.scrollTo(0, y);
          y += window.innerHeight;
          if (y < document.documentElement.scrollHeight) {
            requestAnimationFrame(step);
          } else {
            window.scrollTo(0, 0);
            resolve();
          }
        };
        step();
      }),
  );

  await page.waitForFunction(() =>
    Array.from(document.images).every((i) => i.complete),
  );
  await page.evaluate(async () => {
    const drain = () =>
      Promise.all(
        document
          .getAnimations()
          .filter(
            (a) =>
              a.effect?.getTiming().iterations !== Number.POSITIVE_INFINITY,
          )
          .map((a) => a.finished.catch(() => undefined)),
      );
    await drain();
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r(undefined))),
    );
    await drain();
  });
}
