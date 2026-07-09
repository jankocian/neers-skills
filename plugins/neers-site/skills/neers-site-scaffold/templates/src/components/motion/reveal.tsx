"use client";

import * as m from "motion/react-m";
import type { ComponentProps, ReactNode } from "react";

import { EASE_OUT_EXPO, VIEWPORT } from "~/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds (Motion's unit). */
  delay?: number;
  y?: number;
  once?: boolean;
} & Omit<ComponentProps<typeof m.div>, "children" | "className">;

// Reduced motion is handled globally by MotionConfig (see MotionProvider): the `y`
// snaps to 0 while opacity still fades, so content always arrives — no DOM branch
// on `useReducedMotion` (that mismatches hydration and can strand opacity:0).
function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
  ...props
}: RevealProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ ...VIEWPORT, once }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay }}
      {...props}
    >
      {children}
    </m.div>
  );
}

export { Reveal };
