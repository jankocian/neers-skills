import type { ReactNode } from "react";

import { Section } from "~/components/layout/section";
import { Heading, Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

/** One style-guide section: anchored, tagline + title + optional intro, body. */
function SgSection({
  id,
  tagline,
  title,
  intro,
  children,
  className,
}: {
  id: string;
  tagline: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Section
      id={id}
      className={cn("scroll-mt-28 border-border border-t", className)}
    >
      <header className="mb-3 flex items-center gap-2.5">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden />
        <Text
          className="type-tagline text-muted-foreground lowercase"
          as="span"
        >
          {tagline}
        </Text>
      </header>
      <Heading level={2} className="heading-h2 max-w-headline">
        {title}
      </Heading>
      {intro ? (
        <Text className="mt-5 max-w-measure text-muted-foreground text-xl">
          {intro}
        </Text>
      ) : null}
      <div className="mt-12">{children}</div>
    </Section>
  );
}

export { SgSection };
