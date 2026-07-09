# neers-skills

A Claude Code **marketplace** hosting neers plugins. Each plugin is self-contained and
installed independently; new ones drop into `plugins/` without touching the others.

## Plugins

### `neers-site` — marketing-site toolkit (three skills)

| Skill | When it runs |
|---|---|
| **neers-site-scaffold** | Once, at project kickoff. Next.js 16 + Tailwind v4 + shadcn/Base UI, tokens, motion primitives, a dev-only `/style-guide`, full SEO, and the quality gates. |
| **neers-site-feature** | Every page/section/component. Builds on-system, runs the design passes, gates through review. |
| **neers-site-review** | The gate. Deterministic layout audits, axe-core WCAG 2.2 AA, SEO assertions, a screenshot vision pass. Also what CI runs. |

## Install

```
/plugin marketplace add jankocian/neers-skills
/plugin install neers-site@neers-skills
```

Then in any project: *"scaffold a marketing site for Acme"* fires `neers-site-scaffold`.

## Local development

Point Claude Code at this checkout instead of the published repo:

```
/plugin marketplace add ~/Dev/Code/neers-skills
/plugin install neers-site@neers-skills
```

Edit the skills, commit, `/plugin marketplace update neers-skills` to pick up changes.

## Layout

```
.claude-plugin/
  marketplace.json              the marketplace (name: neers-skills) — lists every plugin
plugins/
  neers-site/                   one plugin, three coupled skills
    .claude-plugin/plugin.json
    skills/
      neers-site-scaffold/        SKILL.md · references/ · templates/ (the project source) · init.sh
      neers-site-feature/         SKILL.md · references/
      neers-site-review/          SKILL.md · references/
```

Each `plugin.json` deliberately carries **no `version`** — every commit counts as an update,
so `/plugin marketplace update` always pulls the latest base.

## No archaeology (pre-commit guard)

Docs describe what the code **is** — never what was removed, renamed, or prior state. <!-- archaeology-ok -->
A line like "colour is a class, *not a component*" (ghost of a deleted `Surface`) or a
"we tried X" note is dead weight for the next reader. <!-- archaeology-ok -->

`.githooks/pre-commit` blocks any commit whose staged `.md`/`.mdx`/`.ts`/`.tsx`/`.css`
lines match the archaeology pattern, printing `file:line`. Rewrite them affirmatively, or
append `<!-- archaeology-ok -->` on the line for a deliberate mention. Extend the pattern
in the hook as new tells appear.

**Fresh clone, once** (hooks path isn't set by clone):
```
git config core.hooksPath .githooks
```

## Adding a new plugin later

1. `mkdir -p plugins/<name>/.claude-plugin plugins/<name>/skills`
2. Write `plugins/<name>/.claude-plugin/plugin.json` (just `name` + `description`).
3. Drop skills under `plugins/<name>/skills/<skill-name>/SKILL.md`.
4. Add one entry to `.claude-plugin/marketplace.json` with `"source": "./plugins/<name>"`.

Group skills into one plugin only when they're coupled (shared references, install-together,
like `neers-site`). Otherwise give each its own plugin so users install just what they want.
