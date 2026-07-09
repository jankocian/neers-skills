"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { cn } from "~/lib/utils";

/** Click any token value to copy it. Quiet by default; reveals on hover. */
function CopyToken({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label ?? value}`}
      className={cn(
        "group/copy inline-flex items-center gap-1.5 rounded-sm tabular-nums transition-colors hover:text-foreground",
        className,
      )}
    >
      <span>{label ?? value}</span>
      {copied ? (
        <Check className="size-3.5 text-primary" aria-hidden />
      ) : (
        <Copy
          className="size-3.5 opacity-0 transition-opacity group-hover/copy:opacity-60"
          aria-hidden
        />
      )}
    </button>
  );
}

export { CopyToken };
