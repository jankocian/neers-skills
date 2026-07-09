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

bunx playwright install --with-deps chromium

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
