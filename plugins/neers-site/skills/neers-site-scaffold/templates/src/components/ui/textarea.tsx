import type { ComponentProps } from "react";

import { cn } from "~/lib/utils";

/** The canonical multi-line input — same treatment as Input, auto-grows. */
function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content min-h-24 w-full resize-y rounded-md border border-input bg-transparent px-3.5 py-2.5 text-base text-foreground leading-relaxed outline-none transition-colors",
        "placeholder:text-muted-foreground/55",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
