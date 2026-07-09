"use client";

import { useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Heading, Text } from "~/components/ui/text";
import { SURFACES, type SurfaceVariant } from "~/lib/design-tokens";
import { cn } from "~/lib/utils";

import { Code } from "./code";

/** Flip one block of markup across every surface to watch the tokens invert. */
function SurfacePreview() {
  const [variant, setVariant] = useState<SurfaceVariant>("base");
  const active = SURFACES.find((s) => s.variant === variant);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Surface">
        {SURFACES.map((s) => {
          const isActive = s.variant === variant;
          return (
            <button
              key={s.variant}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setVariant(s.variant)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          `theme-${variant}`,
          "rounded-xl border border-border p-8 transition-colors duration-300 ease-out sm:p-12",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          <Text
            className="type-tagline text-muted-foreground lowercase"
            as="span"
          >{`.theme-${variant}`}</Text>
        </div>
        <Heading level={2} className="heading-h2 mt-4 max-w-headline">
          the same markup, inverted.
        </Heading>
        <Text className="mt-4 max-w-measure text-muted-foreground text-xl">
          one class paints this block. everything inside is authored once with{" "}
          <Code>text-muted-foreground</Code>, <Code>border-border</Code> and{" "}
          <Code>bg-primary</Code> — the surface decides the colour, nothing here
          is re-declared.
        </Text>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Button arrow>get started</Button>
          <Button variant="outline">learn more</Button>
          {active ? <Badge variant="outline">{active.note}</Badge> : null}
        </div>
      </div>
    </div>
  );
}

export { SurfacePreview };
