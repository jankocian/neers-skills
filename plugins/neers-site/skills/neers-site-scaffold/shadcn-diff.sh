#!/usr/bin/env bash
# Show what shadcn changed upstream versus the vendored copies in this project.
#
# The vendored components (button, dialog, …) are frozen in the scaffold at authoring
# time and copied verbatim — they are NOT re-added from upstream. Upstream shadcn keeps
# moving: a new a11y attribute, a fix. This surfaces the delta between our frozen copies
# and current upstream so you can adopt what's worth it by hand. `--diff` is a dry run;
# it writes nothing.
#
# init.sh runs this once at scaffold time — the most useful moment, because the delta is
# exactly "everything shadcn improved between when this scaffold was authored and now."
# Run it again any time from a site root:  bash <plugin>/shadcn-diff.sh [component]
set -uo pipefail

# Registry-origin components only. Our own (Text, Container, Section, the motion set) have
# no upstream to diff against. Extend this list when the site vendors more from shadcn.
VENDORED="badge button dialog input label textarea toggle toggle-group"

targets="${1:-$VENDORED}"

changed=0
for c in $targets; do
  [ -f "src/components/ui/$c.tsx" ] || continue
  # `bunx shadcn` (no @latest): uses the project's pinned devDep, reproducibly.
  if ! out="$(bunx shadcn add "$c" --diff 2>&1)"; then
    printf '⚠ %s — diff failed (offline? registry down?): %s\n' "$c" "$(printf '%s' "$out" | head -1)"
    continue
  fi
  case "$out" in
    *---*|*+++*)   printf '\n── %s ──\n%s\n' "$c" "$out"; changed=1 ;;
    *"No changes"*) printf '✓ %s — up to date with upstream\n' "$c" ;;
    # Anything else is NOT "up to date" — say so instead of a false green check.
    *)             printf '⚠ %s — unrecognised diff output, inspect by hand:\n%s\n' "$c" "$out" ;;
  esac
done

[ "$changed" = 1 ] && printf '\nAdopt worthwhile hunks by hand; keep our edits small so this stays readable.\n'
exit 0
