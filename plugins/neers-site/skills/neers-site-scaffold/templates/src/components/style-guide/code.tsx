import type { ComponentPropsWithoutRef } from "react";

import { cn } from "~/lib/utils";

/** Inline token / class name. PP Mori (font-sans) with tabular figures — the
 * brand allows no monospace, so "code" is conveyed by treatment, not face. */
function Code({ className, ...props }: ComponentPropsWithoutRef<"code">) {
  return (
    <code
      className={cn(
        "rounded-sm bg-muted px-1.5 py-0.5 font-sans text-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export { Code };
