"use client";

import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// `strict` forbids the heavy `motion.*` import in favour of the lazy `m.*` proxy.
// `reducedMotion="user"` is the cornerstone: every motion component honours the OS
// setting — transforms snap to their target (content still arrives), opacity still
// animates — so the reveal primitives carry no per-component reduced-motion logic.
function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

export { MotionProvider };
