#!/usr/bin/env bun
/**
 * `bun run ui:diff [component]`
 *
 * Shows what shadcn changed upstream versus our vendored copies. Writes nothing —
 * `--diff` implies a dry run.
 *
 * Vendored components are ours: shadcn has no update command and never will, by
 * design. When a diff shows something worth having, merge that hunk by hand.
 * Keeping our edits small is what keeps this readable.
 */
import { Glob } from "bun";

const only = process.argv[2];

// Only components that came from the registry. Ours (text, container, section,
// the motion primitives) have no upstream to diff against.
const VENDORED = [
  "badge",
  "button",
  "dialog",
  "input",
  "label",
  "textarea",
  "toggle",
  "toggle-group",
];

const present = new Set(
  [...new Glob("src/components/ui/*.tsx").scanSync(".")].map((f) =>
    f.replace(/^.*\//, "").replace(/\.tsx$/, ""),
  ),
);

const targets = (only ? [only] : VENDORED).filter((c) => present.has(c));

if (!targets.length) {
  console.error(
    only ? `${only} is not a vendored component` : "nothing to diff",
  );
  process.exit(1);
}

for (const component of targets) {
  const { stdout } = Bun.spawnSync({
    cmd: ["bunx", "shadcn@latest", "add", component, "--diff"],
    stderr: "ignore",
  });
  const out = stdout.toString().trim();
  // A component with no upstream changes prints only its header.
  if (out.includes("---") || out.includes("+++")) {
    console.log(out);
    console.log();
  } else {
    console.log(`✓ ${component} — no upstream changes`);
  }
}
