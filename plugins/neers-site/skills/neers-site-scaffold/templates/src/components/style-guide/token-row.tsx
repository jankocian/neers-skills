"use client";

import { Text } from "~/components/ui/text";

import { CopyToken } from "./copy-token";
import { useTokenValue } from "./use-token-value";

/** A name / live-value / usage row. The value comes from globals.css at runtime. */
function TokenRow({
  varName,
  label,
  usage,
}: {
  varName: string;
  label: string;
  usage: string;
}) {
  const value = useTokenValue(varName);

  return (
    <div className="flex items-baseline justify-between gap-4 border-border border-t py-2.5 first:border-t-0">
      <CopyToken
        value={value ?? varName}
        label={label}
        className="text-foreground text-sm"
      />
      <Text className="text-muted-foreground text-xs" as="span">
        {usage}
      </Text>
    </div>
  );
}

export { TokenRow };
