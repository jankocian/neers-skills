#!/usr/bin/env bash
# Scaffold a neers marketing site.
#
#   ./init.sh <target-dir>
#
# Deterministic on purpose: the templates ARE the project, so there is no CLI to
# roll the dice. Brand decisions (font, mark, colours, copy) are the agent's job,
# after this runs.
set -euo pipefail

TARGET="${1:?usage: ./init.sh <target-dir>}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$TARGET"
cp -R "$HERE/templates/." "$TARGET/"
cd "$TARGET"

# `.gitignore` can't live in the skill dir under that name — git would ignore the
# template's own contents.
mv gitignore .gitignore

# Before `bun install`: the `prepare` script installs git hooks, which needs a repo.
[ -d .git ] || git init -q

# Everything the project needs is declared in package.json.
bun install

# Pick up patches and minors within the caret ranges, once, at kickoff. `bun audit`
# is advisory — never let a transient CVE abort the scaffold.
bun update
bun audit || true

bunx playwright install --with-deps chromium

# The vendored shadcn components are frozen at authoring time. Show what upstream changed
# since, so the user can adopt improvements (new a11y attrs, fixes) by hand. Informational
# only — never fail the scaffold on it.
echo
echo "Upstream shadcn changes since this scaffold was authored:"
bash "$HERE/shadcn-diff.sh" || true

echo
echo "✓ scaffolded in $TARGET"
echo
echo "  Still required before this builds:"
echo "    src/app/fonts/Brand-Variable.woff2   the brand face"
echo "    src/app/fonts/Brand-SemiBold.ttf     static instance, for OG images"
echo "    src/lib/site.ts                      url, name, description, routes"
echo "    src/app/globals.css                  the brand palette"
echo
echo "  Then:  bun run dev   ·   bun run check   ·   bun run test"
