"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type Metrics = {
  size: number;
  leading: string;
  tracking: string;
  weight: string;
};

/**
 * Renders a type sample and reports its live computed metrics — resize to watch a
 * fluid clamp() scale. Reading them here is why the catalogue carries no numbers.
 */
function TypeSpecimen({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const cs = getComputedStyle(el);
      const size = Number.parseFloat(cs.fontSize);
      setMetrics({
        size: Math.round(size),
        leading: (Number.parseFloat(cs.lineHeight) / size).toFixed(2),
        tracking: cs.letterSpacing === "normal" ? "0" : cs.letterSpacing,
        weight: cs.fontWeight,
      });
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  return (
    <div>
      <div ref={ref} className={className}>
        {children}
      </div>
      <span className="mt-3 inline-flex items-center gap-1.5 text-muted-foreground text-xs tabular-nums">
        <span className="size-1 rounded-full bg-primary" aria-hidden />
        {metrics
          ? `${metrics.size}px · leading ${metrics.leading} · tracking ${metrics.tracking} · weight ${metrics.weight}`
          : "—"}
      </span>
    </div>
  );
}

export { TypeSpecimen };
