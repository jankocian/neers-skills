"use client";

import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { EASES } from "~/lib/design-tokens";
import { cn } from "~/lib/utils";
import { useTokenValue } from "./use-token-value";

// Bar heights (in Tailwind h-* steps) so the staggered rise reads clearly.
const BARS = ["h-16", "h-24", "h-20", "h-28", "h-24"];
const DEMO_MS = 600; // a touch slower than --dur-slow so the curve is legible

/**
 * Replayable staggered entrance. The animation is a single CSS keyframe (no
 * competing transitions) and the easing is applied INLINE as the exact
 * cubic-bezier — so every ease, including ease-in-out, applies cleanly and
 * smoothly. Replay / ease-change remounts the bars via `key` to restart it.
 * Stilled entirely under prefers-reduced-motion.
 */
function MotionDemo() {
  const [easeName, setEaseName] = useState(EASES[2].name);
  const [runId, setRunId] = useState(0);
  const ease = EASES.find((e) => e.name === easeName) ?? EASES[0];
  const easeValue = useTokenValue(ease.varName);

  function play(name?: string) {
    if (name && name !== easeName) setEaseName(name);
    setRunId((id) => id + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {EASES.map((e) => (
          <button
            key={e.name}
            type="button"
            onClick={() => play(e.name)}
            aria-pressed={e.name === easeName}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              e.name === easeName
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {e.name}
          </button>
        ))}
      </div>

      <div
        key={runId}
        className="flex h-40 items-end gap-3 overflow-hidden rounded-lg border border-border bg-muted/50 p-6"
      >
        {BARS.map((h, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static demo
            key={i}
            className={cn(
              "w-10 animate-rise rounded-md bg-primary motion-reduce:animate-none",
              h,
            )}
            style={{
              animationDuration: `${DEMO_MS}ms`,
              animationTimingFunction: `var(${ease.varName})`,
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Text as="span" className="text-muted-foreground text-sm tabular-nums">
          {easeValue ?? "—"} · {DEMO_MS}ms · {ease.usage}
        </Text>
        <Button variant="outline" size="sm" onClick={() => play()}>
          replay
        </Button>
      </div>
    </div>
  );
}

export { MotionDemo };
