import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "~/lib/utils";

/**
 * Typography primitives. They do exactly two things: pick the element, and apply
 * the wrapping default you would otherwise forget.
 *
 * The SIZE comes from a class — `heading-d1`, `heading-h2` (the scale), or a
 * Tailwind built-in like `text-xl` / `text-sm` — written in `className`, never a
 * prop. Each `heading-*` / `type-*` utility bundles size + line-height +
 * letter-spacing + weight, so the class IS the complete typographic instruction.
 * A `variant` prop would be a lookup table whose answer is the class you were
 * going to write anyway, unreadable without opening this file.
 *
 * `heading-*` / `type-*` (not `text-*`) so tailwind-merge leaves them alone — see
 * globals.css. Colour is a class too: `text-muted-foreground`, `text-primary`.
 *
 *   <Heading level={1} className="heading-d1">      hero: display size, still one <h1>
 *   <Heading level={2} className="heading-h2">      section title
 *   <Text className="text-xl text-muted-foreground">
 *   <Text as="span" className="text-xs">
 *
 * Never bump `level` to get a bigger size — that's what the size class is for.
 * The SEO gate enforces exactly one <h1> per page.
 */

type HeadingProps = {
  level?: 1 | 2 | 3;
} & Omit<ComponentPropsWithoutRef<"h2">, "color">;

/** Heading tag + `text-balance`, which you want on every heading and will forget. */
function Heading({ level = 2, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3";
  return <Tag className={cn("text-balance", className)} {...props} />;
}

type TextProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

/** Any text element + `text-pretty`. Defaults to <p>. */
function Text<T extends ElementType = "p">(props: TextProps<T>) {
  const { as, className, ...rest } = props as TextProps<"p">;
  const Comp = (as ?? "p") as ElementType;
  return <Comp className={cn("text-pretty", className)} {...rest} />;
}

export type { TextProps };
export { Heading, Text };
