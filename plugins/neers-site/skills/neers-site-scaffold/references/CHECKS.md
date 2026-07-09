# Checks

Three commands, separated by one thing only: **what they need to run.**

```
bun run check     needs nothing            pre-commit hook
bun run test      needs a dev server       the loop, and what review reads
bun run ci        builds the site          CI. = check + test against a real build
```

## Errors and warnings

**An error is something that is always a bug. A warning is something that is usually a
mistake but sometimes deliberate.** Errors fail the build; warnings print and the run
passes. So an agent is told when it drifts from house style, and you can accept the
exception knowingly instead of being blocked by it.

| | |
|---|---|
| **error** | `tsc`, `biome`, missing `metadata`, page ↔ `lib/site.ts` mismatch, token collision, a catalogue entry naming a variable CSS never declares |
| **error** | horizontal scrollbar, zero-size element, broken image, axe violations (contrast, names, roles, target size), missing focus indicator, every SEO assertion |
| **warn** | arbitrary Tailwind values |

Only one warning today, because the browser suite deliberately checks nothing that is
merely *usually* a mistake. Tighten or loosen as real projects teach you.

## `bun run check`

`biome check` · `tsc --noEmit` · `tests/check-source.ts`

Instant, no browser, no build. If a rule *can* be checked from source, it belongs here.

`tsc` doubles as a JSON-LD validator — `schema-dts` makes a typo'd schema property a
type error.

`check-source.ts` asserts four things: SEO wiring both ways; no `--color-*` primitive
sharing a name with a shadcn semantic token; every `varName` in `design-tokens.ts`
actually declared in the `src/styles` partials; and no arbitrary Tailwind values (warning).

It never rewrites your code. `git commit --no-verify` bypasses the hook; `bun run check`
and CI still fail.

## `bun run test`

`playwright test`, with `reuseExistingServer: true` — it attaches to the `bun run dev`
you already have, never starts a second one, never builds.

| | |
|---|---|
| `tests/layout/` | horizontal scrollbar, zero-size, broken images — at 5 widths — plus reduced motion and placeholder content |
| `tests/a11y/` | axe `wcag22aa` + focus visibility |
| `tests/seo/` | served-HTML assertions, sitemap coverage both ways |
| `tests/visual/` | asserts nothing; writes `.neers/` screenshots + findings JSON |

`tests/visual/` rides along because it costs ~1s, so a green run has already produced
the evidence `neers-site-review` reads.

## `bun run ci`

`bun run check && CI=1 playwright test`

`CI=1` points `webServer` at `bun run build && bun run start` and adds a retry. Same
tests. Almost all the runtime is `next build`.

**Never run `bun run build` unprompted.** `check` and `test` don't need it.

```yaml
- bun install --frozen-lockfile
- bunx playwright install --with-deps chromium   # cache ~/.cache/ms-playwright
- bun run ci
- upload .neers/ as artifacts
```

`ci` fails on `check` before paying for a build.

## Not checks

```
bun run fix        biome --write + tsc
```

`init.sh` runs `bun update && bun audit` once at kickoff, so patches and minors are
already current — there's no `freshen` script. It also runs `shadcn-diff.sh`, which shows
what shadcn changed upstream versus the frozen vendored components, to adopt by hand.
