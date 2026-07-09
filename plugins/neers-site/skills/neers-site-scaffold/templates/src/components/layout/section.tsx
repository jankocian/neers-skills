import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "~/lib/utils";

type SectionProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

/**
 * A band of the page. It owns the vertical rhythm and nothing else — no heading, no
 * eyebrow, no container. Compose:
 *
 *   <footer className="theme-inverse">
 *     <Section>
 *       <Container>…</Container>
 *     </Section>
 *   </footer>
 *
 * Colour comes from a `theme-*` class, horizontal space from `Container`.
 */
function Section<T extends ElementType = "section">(props: SectionProps<T>) {
  const { as, className, children, ...rest } = props as SectionProps<"section">;
  const Comp = (as ?? "section") as ElementType;

  return (
    <Comp className={cn("py-16 sm:py-24", className)} {...rest}>
      {children}
    </Comp>
  );
}

export { Section };
