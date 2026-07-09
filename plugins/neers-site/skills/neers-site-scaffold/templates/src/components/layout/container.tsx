import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "~/lib/utils";

const SIZE = {
  narrow: "max-w-narrow",
  content: "max-w-content",
  wide: "max-w-wide",
  full: "max-w-none",
} as const;

type ContainerProps<T extends ElementType> = {
  as?: T;
  size?: keyof typeof SIZE;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

/**
 * Centres content and owns the page gutter.
 *
 * The gutter is here and nowhere else: never re-apply `px-6` down the tree. Widths
 * come from `--container-*` in theme.css. `className` overrides anything.
 */
function Container<T extends ElementType = "div">(props: ContainerProps<T>) {
  const {
    as,
    size = "content",
    className,
    children,
    ...rest
  } = props as ContainerProps<"div">;
  const Comp = (as ?? "div") as ElementType;

  return (
    <Comp
      className={cn("mx-auto w-full px-6 sm:px-8", SIZE[size], className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export { Container };
