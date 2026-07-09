#!/usr/bin/env bun
/**
 * Every check that needs neither a browser nor a build. Runs in the pre-commit hook
 * and in `bun run check`.
 *
 * ERRORS block. WARNINGS are printed and the run still passes — they flag drift from
 * house style, which sometimes has a good reason. Something that is always a bug is
 * an error; something that is usually a mistake is a warning.
 *
 *   error    a protected dependency was removed
 *   error    a page has no `metadata` export
 *   error    page <-> lib/site.ts disagree
 *   error    a `--color-*` primitive collides with a shadcn semantic token
 *   error    design-tokens.ts names a variable the src/styles partials never declare
 *   error    a surface has no matching `.theme-*` block
 *   warn     an arbitrary Tailwind value where a token should be
 *
 * Anything needing a rendered page lives in `tests/` and runs under `bun run test`.
 * This never rewrites your code.
 */
import { Glob } from "bun";

import { privateRoutes, routes } from "../src/lib/site";

const errors: string[] = [];
const warnings: string[] = [];
const err = (m: string) => errors.push(m);
const warn = (m: string) => warnings.push(m);

// The stylesheet is split into partials (globals.css imports theme/surfaces/
// animations). Read them all as one — a token declared in any partial counts.
const CSS = "src/styles/*.css"; // label for messages
const css = (
  await Promise.all(
    [...new Glob("src/styles/**/*.css").scanSync(".")].map((f) =>
      Bun.file(f).text(),
    ),
  )
).join("\n");

// ── 0. Protected dependencies ────────────────────────────────────────────────
//
// These are house decisions, not consequences of the current code. A fresh scaffold
// imports no SVG and reads no environment variable, so anything pruning "unused"
// dependencies — a human, an agent, a depcheck run — will propose deleting them.
// Removing one is the owner's call, made here, on purpose. Not a cleanup.

const PROTECTED = {
  "@svgr/webpack":
    "SVG imports compile to React components. The way SVGs are handled.",
  "@t3-oss/env-nextjs":
    "Environment variables are validated at build time. The way env is handled.",
  zod: "The schema language `@t3-oss/env-nextjs` validates against.",
} as const;

const pkg = await Bun.file("package.json").json();
const installed = { ...pkg.dependencies, ...pkg.devDependencies };
for (const [name, why] of Object.entries(PROTECTED)) {
  if (!installed[name]) {
    err(
      `package.json: \`${name}\` is missing, and it is protected.\n` +
        `    ${why}\n` +
        `    It is expected to look unused. Restore it, or ask the owner.`,
    );
  }
}

// ── 1. SEO wiring ────────────────────────────────────────────────────────────

const pages = [...new Glob("src/app/**/page.tsx").scanSync(".")];

const routeOf = (file: string) => {
  const path = file
    .replace(/^src\/app/, "")
    .replace(/\/page\.tsx$/, "")
    .replace(/\/\([^)]+\)/g, ""); // strip route groups
  return path === "" ? "/" : path;
};

const registered = new Set<string>([
  ...routes.map((r) => r.path as string),
  ...privateRoutes,
]);

for (const file of pages) {
  const route = routeOf(file);
  if (privateRoutes.includes(route)) continue;

  const src = await Bun.file(file).text();
  const hasMetadata =
    /export\s+const\s+metadata\b/.test(src) ||
    /export\s+(async\s+)?function\s+generateMetadata\b/.test(src);

  if (!hasMetadata) {
    err(
      `${file}: no \`metadata\` export.\n    Add: export const metadata = pageMetadata("${route}")`,
    );
  }
  if (!registered.has(route)) {
    err(
      `${file}: route "${route}" is not registered in src/lib/site.ts.\n` +
        `    Add it to \`routes\`, or to \`privateRoutes\` if it must not be indexed.\n` +
        `    Until you do, it is absent from sitemap.xml and llms.txt.`,
    );
  }
}

const known = pages.map(routeOf);
for (const route of routes) {
  if (!known.includes(route.path)) {
    err(
      `src/lib/site.ts: route "${route.path}" has no src/app${
        route.path === "/" ? "" : route.path
      }/page.tsx`,
    );
  }
}

// ── 2. Token collision ───────────────────────────────────────────────────────
//
// `@theme inline` re-points every shadcn semantic token (`--color-muted: var(--muted)`),
// silently overwriting a primitive of the same name. Whatever that primitive fed then
// resolves to the wrong colour, with no error.

// Not anchored to line start: `@theme { --color-muted: #fff; }` on one line must match.
// A `var(--color-x)` reference can't false-match — it's followed by `)`, not `:`.
const LITERAL_DECL =
  /(--color-[a-z0-9-]+)\s*:\s*(?:#|oklch|rgb|hsl|color-mix)/g;
const INDIRECT_DECL = /(--color-[a-z0-9-]+)\s*:\s*var\(/g;

// This rule's only failure mode is a quiet no-op, so it proves itself on every run.
{
  const probe =
    "@theme { --color-muted: #57534e; }\n@theme inline { --color-muted: var(--muted); }";
  const lit = [...probe.matchAll(LITERAL_DECL)].map((m) => m[1]);
  const ind = [...probe.matchAll(INDIRECT_DECL)].map((m) => m[1]);
  if (!lit.includes("--color-muted") || !ind.includes("--color-muted")) {
    throw new Error(
      "token-collision regex fails to detect the canonical clash",
    );
  }
  if ([...":  var(--color-ink-muted);".matchAll(INDIRECT_DECL)].length !== 0) {
    throw new Error("token-collision regex false-matches a var() reference");
  }
}

if (css) {
  const literal = new Set([...css.matchAll(LITERAL_DECL)].map((m) => m[1]));
  const indirect = new Set([...css.matchAll(INDIRECT_DECL)].map((m) => m[1]));
  for (const name of literal) {
    if (indirect.has(name)) {
      err(
        `${CSS}: \`${name}\` is defined both as a literal primitive and as ` +
          `\`var(...)\` in \`@theme inline\`.\n` +
          `    The inline mapping wins and the primitive is silently lost.\n` +
          `    Rename the primitive (e.g. --color-ink-muted), never the shadcn token.`,
      );
    }
  }
}

// ── 3. The catalogue can only name variables that exist ──────────────────────
//
// design-tokens.ts carries no values; the style guide reads them from these
// variables at runtime. A renamed or deleted token would silently render nothing.

if (css) {
  const declared = new Set(
    [...css.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
  );
  const catalogue = await Bun.file("src/lib/design-tokens.ts").text();
  for (const m of catalogue.matchAll(/varName:\s*"(--[a-z0-9-]+)"/g)) {
    if (!declared.has(m[1])) {
      err(
        `src/lib/design-tokens.ts: \`${m[1]}\` is not declared in ${CSS}.\n` +
          `    The style guide reads token values from CSS, so this row would render empty.`,
      );
    }
  }

  // A surface with no CSS block renders no theme, and no error. SURFACES feeds the
  // style guide and `theme-${variant}` template literals, so check it first.
  const surfaces = [...catalogue.matchAll(/variant:\s*"([a-z0-9-]+)"/g)].map(
    (m) => m[1],
  );
  for (const v of surfaces) {
    if (!css.includes(`.theme-${v}`)) {
      err(
        `src/lib/design-tokens.ts: surface \`${v}\` has no \`.theme-${v}\` block in ${CSS}.\n` +
          `    \`theme-${v}\` would render no theme, silently.`,
      );
    }
  }

  // …and a hand-written `theme-typo` in JSX is the same silent nothing: a raw class
  // string is never type-checked, so guard it by matching every `theme-*` class in the
  // source against the known surface set.
  const known = new Set(surfaces);
  for (const file of new Glob("src/**/*.{ts,tsx}").scanSync(".")) {
    const src = await Bun.file(file).text();
    for (const m of src.matchAll(/\btheme-([a-z][a-z0-9-]*)\b/g)) {
      if (!known.has(m[1])) {
        err(
          `${file}: \`theme-${m[1]}\` is not a surface.\n` +
            `    Known: ${surfaces.join(", ")}. The class would render no theme, silently.`,
        );
      }
    }
  }
}

// ── 4. Arbitrary Tailwind values (warning) ───────────────────────────────────
//
// Only utilities that carry a DESIGN decision — colour, size, spacing, radius.
// `transition-[background-color,...]` names properties, not values, and is fine.
// Vendored shadcn components under components/ui are exempt.

const DESIGN_UTILITIES = [
  "text",
  "bg",
  "border",
  "fill",
  "stroke",
  "shadow",
  "ring",
  "outline",
  "from",
  "to",
  "via",
  "decoration",
  "caret",
  "divide",
  "w",
  "h",
  "size",
  "min-w",
  "max-w",
  "min-h",
  "max-h",
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "gap",
  "gap-x",
  "gap-y",
  "top",
  "right",
  "bottom",
  "left",
  "inset",
  "leading",
  "tracking",
  "rounded",
  "opacity",
  "z",
];

// The `:` in the boundary catches variants (`md:w-[10px]`); the `-?` catches
// negatives (`-mt-[2px]`).
const ARBITRARY = new RegExp(
  `(?:^|[\\s"'\`:])-?(${DESIGN_UTILITIES.join("|")})-\\[([^\\]]+)\\]`,
  "g",
);

// The regex carries its own check, so it can't rot into noise or a no-op.
const flags = (s: string) => [...s.matchAll(ARBITRARY)].length > 0;
for (const s of [
  'className="w-[110vw]"',
  'className="text-[#fff] p-[37px]"',
  'className="md:w-[10px]"',
  'className="-mt-[2px]"',
]) {
  if (!flags(s)) throw new Error(`ARBITRARY regex should flag: ${s}`);
}
for (const s of [
  'className="transition-[background-color,color]"', // property list, not a value
  'className="[&_svg]:shrink-0"',
  'className="data-[state=on]:bg-primary"',
  'className="supports-[backdrop-filter]:bg-background/60"',
  'className="aria-[current=page]:font-medium"',
  'className="has-[:checked]:border-ring"',
  'className="grid-cols-[1fr_auto]"',
  'className="max-w-headline heading-d1"',
]) {
  if (flags(s)) throw new Error(`ARBITRARY regex false positive: ${s}`);
}

const scanned = [
  ...new Glob("src/app/**/*.{ts,tsx}").scanSync("."),
  ...new Glob("src/components/{brand,motion,style-guide}/**/*.tsx").scanSync(
    ".",
  ),
];

for (const file of scanned) {
  const src = await Bun.file(file).text();
  for (const m of src.matchAll(ARBITRARY)) {
    warn(
      `${file}: arbitrary Tailwind value \`${m[1]}-[${m[2]}]\`.\n` +
        `    Prefer a token. If none fits, add one to @theme in src/styles/theme.css.`,
    );
  }
}

// ── report ───────────────────────────────────────────────────────────────────

for (const w of warnings) console.warn(`⚠ ${w}\n`);

if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s):\n`);
  for (const e of errors) console.error(`  ${e}\n`);
  console.error(
    "  `git commit --no-verify` bypasses the hook; CI will still fail.\n",
  );
  process.exit(1);
}

const w = warnings.length ? `, ${warnings.length} warning(s)` : "";
console.log(`✓ source check — ${pages.length} page(s), no errors${w}`);
