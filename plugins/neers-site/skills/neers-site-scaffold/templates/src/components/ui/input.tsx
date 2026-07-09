import { Input as InputPrimitive } from "@base-ui/react/input";
import type { ComponentProps } from "react";

import { cn } from "~/lib/utils";

/**
 * The canonical text input — used in the style guide AND across the site.
 * Bordered box, comfortable height, placeholder lighter than the label, and a
 * single cohesive focus (border lights up + soft ring; no double outline).
 */
function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-3.5 text-base text-foreground outline-none transition-colors",
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

export { Input };
