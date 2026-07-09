import type { ReactNode } from "react";

import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

/** A labelled specimen row: fixed label column, flexible body, optional note. */
function SgRow({
  label,
  note,
  children,
  className,
}: {
  label: string;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-border border-t py-8 first:border-t-0 first:pt-0 sm:flex-row sm:gap-10",
        className,
      )}
    >
      <div className="sm:w-40 sm:shrink-0 sm:pt-1.5">
        <Text className="type-tagline text-muted-foreground lowercase" as="div">
          {label}
        </Text>
      </div>
      <div className="min-w-0 flex-1">
        {children}
        {note ? (
          <Text className="mt-4 max-w-measure text-muted-foreground text-sm">
            {note}
          </Text>
        ) : null}
      </div>
    </div>
  );
}

export { SgRow };
