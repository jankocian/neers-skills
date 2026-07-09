"use client";

import { useEffect, useState } from "react";

/**
 * Reads a CSS custom property off `:root` after mount.
 *
 * This is why `lib/design-tokens.ts` carries no values: globals.css declares them
 * once, and the style guide shows whatever is actually there.
 *
 * Reading a known name works in every engine. Do not try to *enumerate* custom
 * properties instead — `@theme inline` tokens are never emitted as variables.
 */
export function useTokenValue(varName: string): string | null {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const read = () =>
      setValue(
        getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim() || null,
      );
    read();
    // Surfaces re-declare tokens, and fluid values change with the viewport.
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, [varName]);

  return value;
}
