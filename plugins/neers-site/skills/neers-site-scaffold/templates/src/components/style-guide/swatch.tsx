"use client";

import { Text } from "~/components/ui/text";
import type { ColorToken } from "~/lib/design-tokens";

import { CopyToken } from "./copy-token";
import { useTokenValue } from "./use-token-value";

/**
 * A single colour chip. The fill references the token's own CSS variable, and the
 * caption prints whatever that variable actually resolves to — so the chip cannot
 * disagree with globals.css.
 */
function Swatch({ token }: { token: ColorToken }) {
  const value = useTokenValue(token.varName);

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div
        className="h-20"
        style={{ backgroundColor: `var(${token.varName})` }}
      />
      <div className="flex flex-col gap-1 border-border border-t p-3">
        <div className="flex items-baseline justify-between gap-2">
          <Text as="span" className="font-medium text-sm lowercase">
            {token.name}
          </Text>
          {token.note ? (
            <Text
              as="span"
              className="text-right text-muted-foreground/65 text-xs"
            >
              {token.note}
            </Text>
          ) : null}
        </div>
        <CopyToken
          value={value ?? token.varName}
          label={value ?? "—"}
          className="text-muted-foreground text-xs"
        />
      </div>
    </div>
  );
}

export { Swatch };
