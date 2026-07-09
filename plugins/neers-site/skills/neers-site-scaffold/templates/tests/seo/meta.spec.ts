import { expect, test } from "@playwright/test";
import * as cheerio from "cheerio";

import { routes, site } from "../../src/lib/site";

/**
 * Playwright's `request` fixture — no browser launch. Asserts against the served
 * HTML, so it behaves identically under `next dev` and `next start`.
 */

/**
 * With `trailingSlash: false` (the default) Next resolves `canonical: "/"` to
 * `https://site.com` — no trailing slash, even though `metadataBase.href` has one.
 */
const abs = (path: string) => `${site.url}${path === "/" ? "" : path}`;

for (const route of routes) {
  test(`seo ${route.path}`, async ({ request }) => {
    const res = await request.get(route.path);
    expect(res.status(), `${route.path} did not return 200`).toBe(200);
    const $ = cheerio.load(await res.text());

    // `head > title`, not `title`: an inline SVG's <title> satisfies the bare selector.
    const title = $("head > title").text();
    expect(title, "missing <title> in <head>").toBeTruthy();
    expect(
      title.length,
      `title is ${title.length} chars (max 60)`,
    ).toBeLessThanOrEqual(60);

    const desc = $('meta[name="description"]').attr("content") ?? "";
    expect(desc, "missing meta description").toBeTruthy();
    expect(
      desc.length,
      `description is ${desc.length} chars (want 50-160)`,
    ).toBeGreaterThanOrEqual(50);
    expect(desc.length).toBeLessThanOrEqual(160);

    const canonical = $('link[rel="canonical"]').attr("href");
    expect(canonical, "missing canonical").toBeTruthy();
    expect(canonical, "canonical must be absolute").toBe(abs(route.path));

    expect(
      $('meta[property="og:title"]').attr("content"),
      "missing og:title",
    ).toBeTruthy();
    expect(
      $('meta[property="og:image"]').attr("content"),
      "missing og:image",
    ).toBeTruthy();
    expect(
      $('meta[name="twitter:card"]').attr("content"),
      "missing twitter:card",
    ).toBeTruthy();
    expect($("html").attr("lang"), "missing <html lang>").toBe(site.lang);

    // Size comes from the class, so the tag stays semantic.
    expect($("h1").length, "want exactly one <h1>").toBe(1);

    $("img:not([alt])").each((_, el) => {
      throw new Error(`<img> without alt: ${$(el).attr("src")}`);
    });

    $('script[type="application/ld+json"]').each((_, el) => {
      const raw = $(el).contents().text();
      const parsed = JSON.parse(raw); // throws => invalid JSON-LD
      for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
        expect(node["@context"], "JSON-LD @context").toBe("https://schema.org");
        expect(node["@type"], "JSON-LD missing @type").toBeTruthy();
      }
    });
  });
}

// Coverage in both directions: an unregistered page and a stale sitemap entry both fail.
test("sitemap covers every route and nothing else", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const inSitemap = new Set(
    [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].replace(/\/$/, "")),
  );
  const expected = new Set(routes.map((r) => abs(r.path).replace(/\/$/, "")));

  const missing = [...expected].filter((u) => !inSitemap.has(u));
  const extra = [...inSitemap].filter((u) => !expected.has(u));

  expect(missing, "routes absent from sitemap.xml").toEqual([]);
  expect(extra, "sitemap.xml lists routes that do not exist").toEqual([]);
});

test("robots.txt enforces the crawler policy", async ({ request }) => {
  const txt = await (await request.get("/robots.txt")).text();
  expect(txt).toContain("/style-guide");
  expect(txt).toContain(`${site.url}/sitemap.xml`);

  // The point of robots.ts is the allow/block matrix. A refactor that drops a
  // citation bot into the block group (or vice-versa) must fail here, not ship —
  // the wrong policy silently de-indexes the site. Groups are blank-line separated.
  const blockFor = (bot: string) =>
    txt.split(/\n\s*\n/).find((b) => b.includes(bot));
  const rootDisallow = /^Disallow:\s*\/\s*$/m;

  for (const bot of ["CCBot", "Bytespider"]) {
    expect(blockFor(bot), `${bot} must be blocked at root`).toMatch(
      rootDisallow,
    );
  }
  // Only the search/citation bots that must never be blocked (doing so de-indexes
  // the site). Whether to allow AI *training* bots (GPTBot etc.) is a per-site
  // policy, not an invariant — so it is deliberately not asserted here.
  for (const bot of ["Googlebot", "PerplexityBot"]) {
    expect(blockFor(bot), `${bot} must be present`).toBeTruthy();
    expect(
      rootDisallow.test(blockFor(bot) ?? ""),
      `${bot} must NOT be root-disallowed`,
    ).toBe(false);
  }
});

test("llms.txt has a title, a summary and real links", async ({ request }) => {
  const txt = await (await request.get("/llms.txt")).text();
  expect(
    txt.startsWith(`# ${site.name}`),
    "llms.txt must open with an H1",
  ).toBe(true);
  expect(txt, "llms.txt needs a blockquote summary").toContain("\n> ");
  expect(txt, "llms.txt lists no pages").toContain(`](${site.url}`);
});
