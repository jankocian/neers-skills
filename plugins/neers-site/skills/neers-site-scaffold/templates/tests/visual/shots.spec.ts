import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { test } from "@playwright/test";

import { layoutAudit } from "../layout/audit";
import { ROUTES, SHOTS, settle } from "../routes";

/**
 * Produces the inputs for the agent's vision pass. Writes to .neers/ (gitignored):
 *
 *   .neers/findings.json           deterministic layout findings, per route+width
 *   .neers/shots/<route>@<w>.<n>.png
 *
 * Viewport-height TILES, not full-page screenshots. A 6000px-tall marketing page
 * downscaled into a vision model's input loses exactly the 1-3px detail you are
 * looking for. ~15% overlap so nothing falls between two tiles.
 *
 * These never fail. The gate is layout.spec.ts / pages.spec.ts. This is the
 * evidence the agent reads afterwards — and the findings are fed into the
 * screenshot prompt as HINTS. An LLM reviewing a screenshot cold hallucinates
 * spacing problems; one told "`.hero__cta` protrudes 14px at 375px" localises it.
 */
const OUT = ".neers";
const OVERLAP = 0.85; // step 85% of a viewport => 15% overlap
const MAX_TILES = 8;

const slug = (path: string) =>
  path === "/" ? "home" : path.replace(/\//g, "-").slice(1);

// The single best flake-killer. `reducedMotion` is not a top-level use option —
// it goes through `contextOptions`.
test.use({ contextOptions: { reducedMotion: "reduce" } });

for (const path of ROUTES) {
  for (const shot of SHOTS) {
    test(`shots ${path} @${shot.label}`, async ({ page }) => {
      await page.setViewportSize({ width: shot.width, height: shot.height });
      await page.goto(path);
      await settle(page);

      const dir = join(OUT, "shots");
      await mkdir(dir, { recursive: true });

      // Pass `false` explicitly: layoutAudit's param is optional, and the
      // zero-arg evaluate overload infers `arg: void`, which won't typecheck.
      const findings = await page.evaluate(layoutAudit, false);
      await writeFile(
        join(OUT, `findings-${slug(path)}-${shot.width}.json`),
        JSON.stringify({ route: path, width: shot.width, findings }, null, 2),
      );

      const total = await page.evaluate(() => document.body.scrollHeight);
      const step = Math.round(shot.height * OVERLAP);
      const tiles = Math.min(Math.ceil(total / step), MAX_TILES);

      if (tiles === MAX_TILES && total > step * MAX_TILES) {
        // Never silently truncate coverage.
        console.warn(
          `[shots] ${path} @${shot.width}: page is ${total}px, capturing only ` +
            `the first ${step * MAX_TILES}px (${MAX_TILES} tiles).`,
        );
      }

      for (let i = 0; i < tiles; i++) {
        await page.evaluate((y) => window.scrollTo(0, y), i * step);
        await page.waitForTimeout(120); // let sticky chrome settle
        await page.screenshot({
          path: join(dir, `${slug(path)}@${shot.width}.${i}.png`),
        });
      }
    });
  }
}
