import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { ROUTES, settle } from "../routes";

/**
 * axe catches ~57% of real accessibility issues by volume (Deque's own study of
 * 2,000+ audits). This gate is a FLOOR, not a pass. It cannot see focus order,
 * meaningful alt text, or whether your copy makes sense.
 *
 * `wcag22aa` is not optional: `target-size` (WCAG 2.2 §2.5.8) is disabled unless
 * you request that tag explicitly.
 */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const path of ROUTES) {
  test(`a11y ${path}`, async ({ page }) => {
    await page.goto(path);
    await settle(page);

    const { violations, incomplete } = await new AxeBuilder({ page })
      .withTags(TAGS)
      .analyze();

    const summary = violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.map((n) => n.target.join(" ")),
    }));
    expect(violations, JSON.stringify(summary, null, 2)).toEqual([]);

    // Contrast over a gradient or image lands in `incomplete`, not `violations` —
    // axe can't resolve a single background colour. This is NOT a failure and needs
    // no per-site allowlist: it's WARNED here and eyeballed in the vision pass. The
    // real fix, when it is wrong, is a solid/rgba scrim behind the text — a design
    // change, never a test edit.
    const unverified = incomplete
      .filter((i) => i.id === "color-contrast")
      .flatMap((i) => i.nodes.map((n) => n.target.join(" ")));
    if (unverified.length) {
      console.warn(
        `⚠ a11y ${path}: axe could not verify contrast on ${unverified.length} ` +
          `element(s) over a gradient/image — eyeball them:\n  ${unverified.join("\n  ")}`,
      );
    }
  });
}

/**
 * Focus visibility (WCAG 2.4.7 / 2.4.11 / 2.4.13) has NO axe rule. Roll it.
 *
 * `element.focus()` does NOT match `:focus-visible` — the browser only applies it
 * after a keyboard interaction. So we walk the real tab order with page.keyboard,
 * which is a trusted event.
 *
 * We compare computed styles, not pixels: a focus ring is drawn OUTSIDE the border
 * box (`outline-offset`, `ring`), so an element screenshot never contains it.
 *
 * This proves the element renders differently when focused, and that the difference
 * is in a property a focus indicator lives in. It cannot prove the indicator has
 * enough contrast — tab through the page yourself for that.
 *
 * Capped at 25 stops: enough for a marketing page's chrome and hero.
 */
const MAX_TAB_STOPS = 25;

/** The properties a focus indicator can plausibly live in. */
const focusStyle = (n: Element) => {
  const s = getComputedStyle(n);
  return {
    outlineStyle: s.outlineStyle,
    outlineWidth: s.outlineWidth,
    outlineColor: s.outlineColor,
    boxShadow: s.boxShadow,
    borderColor: s.borderColor,
    backgroundColor: s.backgroundColor,
    color: s.color,
  };
};

type FocusStyle = ReturnType<typeof focusStyle>;

for (const path of ROUTES) {
  test(`focus visible ${path}`, async ({ page }) => {
    await page.goto(path);
    await settle(page);

    const invisible: string[] = [];

    await page.locator("body").click({ position: { x: 1, y: 1 } });

    for (let i = 0; i < MAX_TAB_STOPS; i++) {
      await page.keyboard.press("Tab");

      // Pin the node NOW. A `:focus` locator stops matching the moment we blur.
      const handle = await page.evaluateHandle(() => document.activeElement);
      const el = handle.asElement();
      if (!el) break;

      // `id` is a label for reporting only, NOT an identity — many real elements
      // share tag+class (a row of nav links), so keying wrap-detection on it
      // aborted the walk at the first duplicate. Detect a genuine wrap by marking
      // the node itself; stop only when we return to one already visited.
      const { id, wrapped } = await el.evaluate((n) => {
        const e = n as HTMLElement & { __focusSeen?: boolean };
        const label = `${e.tagName}#${e.id}.${e.className.slice(0, 40)}`;
        const seen = e.__focusSeen === true;
        e.__focusSeen = true;
        return { id: label, wrapped: seen };
      });
      if (id.startsWith("BODY") || id.startsWith("HTML")) break;

      // The Next dev-tools overlay is a focusable custom element that ships no
      // focus ring and does not exist in a production build. Skip, don't fail.
      if (id.startsWith("NEXTJS-")) continue;

      if (wrapped) break; // genuinely cycled back to an already-checked element

      const focused = await el.evaluate(focusStyle);
      await el.evaluate((n) => (n as HTMLElement).blur());
      const blurred = await el.evaluate(focusStyle);

      // An outline with `style: none` renders nothing however wide or colourful it
      // is — comparing outlineWidth/outlineColor alone passes elements that show
      // no ring at all. And `boxShadow !== "none"` is worthless on its own: a
      // `ring-*` utility leaves a transparent box-shadow even when unfocused.
      const outlineDraws = (s: FocusStyle) =>
        s.outlineStyle !== "none" && Number.parseFloat(s.outlineWidth) > 0;

      const appeared =
        (outlineDraws(focused) && !outlineDraws(blurred)) ||
        focused.boxShadow !== blurred.boxShadow ||
        focused.borderColor !== blurred.borderColor;

      if (!appeared) invisible.push(id);

      // Restore focus so the next Tab continues from this point in the order.
      await el.evaluate((n) => (n as HTMLElement).focus());
      await handle.dispose();
    }

    expect(
      invisible,
      "focusable elements with no visible focus indicator",
    ).toEqual([]);
  });
}
