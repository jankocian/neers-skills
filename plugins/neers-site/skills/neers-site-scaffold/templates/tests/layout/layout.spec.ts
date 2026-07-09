import { expect, test } from "@playwright/test";

import { ROUTES, settle, WIDTHS } from "../routes";
import { layoutAudit } from "./audit";

// One test per (route, width) so Playwright parallelises them and a failure
// names exactly one cell. Never loop widths inside a single test().
for (const path of ROUTES) {
  for (const width of WIDTHS) {
    test(`layout ${path} @${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await settle(page);

      // Pass `false` explicitly: layoutAudit's param is optional, and the
      // zero-arg evaluate overload infers `arg: void`, which won't typecheck.
      const findings = await page.evaluate(layoutAudit, false);
      expect(findings, JSON.stringify(findings, null, 2)).toEqual([]);
    });
  }
}

// Placeholder content is a free catch — no vision model required.
for (const path of ROUTES) {
  test(`no placeholder content ${path}`, async ({ page }) => {
    await page.goto(path);
    await settle(page);
    await expect(page.locator("body")).not.toContainText(
      /lorem ipsum|\[object Object\]|undefined|NaN|TODO/i,
    );
  });
}

// Reduced motion must actually stop motion — and, more importantly, must not
// strand content at opacity:0. That is the failure mode that turns the whole
// page blank for the users who need it most.
for (const path of ROUTES) {
  test(`reduced motion ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await settle(page);

    // Scroll the whole page so every whileInView trigger fires.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
    });
    await page.waitForTimeout(400);

    const stranded = await page.evaluate(() => {
      // An inline SVG's <title> is text content that never renders. Skip it, or
      // every brand mark reports as stranded.
      const skip = new Set(["TITLE", "DESC", "SCRIPT", "STYLE", "TEMPLATE"]);
      return Array.from(document.querySelectorAll("main *"))
        .filter((el) => !skip.has(el.tagName))
        .filter((el) => el.textContent?.trim())
        .filter((el) => Number(getComputedStyle(el).opacity) < 0.9)
        .map((el) => el.tagName + (el.className ? `.${el.className}` : ""))
        .slice(0, 10);
    });
    expect(stranded, "content stranded invisible under reduced motion").toEqual(
      [],
    );

    // What must NOT survive reduced motion: perpetual motion (loops, marquees,
    // parallax), and any animation of a POSITIONAL property.
    //
    // Opacity is deliberately NOT flagged. `MotionConfig reducedMotion="user"`
    // disables transforms and layout animations while letting opacity fade —
    // that is Motion's documented behaviour, and WCAG's concern is vestibular
    // motion, not fades. An assertion of "no animations at all" would fail on
    // the correct implementation.
    //
    // document.getAnimations() sees CSS transitions/animations and WAAPI (which
    // Motion uses). It does NOT see rAF-driven libraries like GSAP.
    const POSITIONAL = [
      "transform",
      "translate",
      "scale",
      "rotate",
      "top",
      "left",
    ];
    const offenders = await page.evaluate((positional) => {
      return document
        .getAnimations()
        .filter((a) => a.playState === "running")
        .filter((a) => {
          const timing = a.effect?.getTiming();
          if (timing?.iterations === Number.POSITIVE_INFINITY) return true;
          const props =
            (a.effect as KeyframeEffect | undefined)
              ?.getKeyframes?.()
              .flatMap((k) => Object.keys(k)) ?? [];
          return props.some((p) => positional.includes(p));
        })
        .map((a) => (a.effect as KeyframeEffect)?.target?.tagName ?? "?");
    }, POSITIONAL);

    expect(
      offenders,
      "looping or positional animations still running under reduced motion",
    ).toEqual([]);
  });
}
