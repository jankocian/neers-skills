"use client";

import * as m from "motion/react-m";
import type { ComponentProps, ReactNode } from "react";
import { EASE_OUT_EXPO } from "~/lib/motion";
import { cn } from "~/lib/utils";

type MaskRevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds (Motion's unit). */
  delay?: number;
  duration?: number;
} & Omit<ComponentProps<typeof m.span>, "children" | "className">;

// One headline line rising from behind a clip mask, on mount (pair with the
// `mask-line` utility in animations.css). Above-the-fold only — it has no viewport
// trigger. Under reduced motion MotionConfig snaps the transform to its target,
// so the line is simply in place — no per-component logic.
//
// No `will-change`: Motion doesn't manage it, so a static class would pin a
// compositor layer for the life of the page.
function MaskReveal({
  children,
  className,
  delay = 0,
  duration = 0.9,
  ...props
}: MaskRevealProps) {
  return (
    <span className={cn("mask-line block", className)}>
      <m.span
        className="block"
        initial={{ y: "130%" }}
        animate={{ y: 0 }}
        transition={{ duration, ease: EASE_OUT_EXPO, delay }}
        {...props}
      >
        {children}
      </m.span>
    </span>
  );
}

export { MaskReveal };
