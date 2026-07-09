import type { ComponentPropsWithoutRef } from "react";

import { cn } from "~/lib/utils";

/** Inline token / class name. The brand face (font-sans) with tabular figures —
 * no separate monospace, so "code" is conveyed by treatment, not face. */
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
