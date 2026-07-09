"use client";

// `stagger` comes from motion/react — react-m only re-exports the `m` components.
import { stagger } from "motion/react";
import * as m from "motion/react-m";
import type { ComponentProps, ReactNode } from "react";

import { EASE_OUT_EXPO, VIEWPORT } from "~/lib/motion";

// `delayChildren: stagger(n)` — the bare `staggerChildren: n` form is deprecated.
const container = {
  hidden: {},
  show: { transition: { delayChildren: stagger(0.09, { startDelay: 0.04 }) } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof m.div>, "children" | "className">;

// Cascades its StaggerItem children in as the group scrolls into view. Like
// Reveal, it carries no reduced-motion logic — MotionConfig snaps the per-item
// transform while opacity still fades.
function Stagger({ children, className, ...props }: StaggerProps) {
  return (
    <m.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      {...props}
    >
      {children}
    </m.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof m.div>, "children" | "className">;

// Every direct child of <Stagger> must be one of these, or variants won't
// propagate and the group will appear all at once.
function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  return (
    <m.div className={className} variants={item} {...props}>
      {children}
    </m.div>
  );
}

export { Stagger, StaggerItem };
