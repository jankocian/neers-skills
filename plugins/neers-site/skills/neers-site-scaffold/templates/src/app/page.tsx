import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

import { Container } from "~/components/layout/container";
import { Section } from "~/components/layout/section";
import { Reveal } from "~/components/motion/reveal";
import { Button } from "~/components/ui/button";
import { Heading, Text } from "~/components/ui/text";
import { pageMetadata } from "~/lib/site";

export const metadata: Metadata = pageMetadata("/");

export default function Home() {
  return (
    <main>
      <Section className="flex min-h-dvh items-center">
        <Container size="narrow" className="flex flex-col items-start gap-8">
          {/* level={1} picks the tag; heading-d1 the size. Never bump level for size. */}
          <Heading level={1} className="heading-d1 max-w-headline">
            replace this<span className="text-primary">.</span>
          </Heading>
          <Reveal>
            <Text className="max-w-measure text-muted-foreground text-xl">
              the public site is on its way. for now the foundation — tokens,
              type, colour, surfaces, motion, and the button system — lives in
              the style guide.
            </Text>
          </Reveal>
          {/* The style guide 404s in production; don't ship a link to a 404. */}
          {process.env.NODE_ENV !== "production" && (
            <Button href="/style-guide" size="lg">
              view the style guide
              <ArrowUpRight />
            </Button>
          )}
        </Container>
      </Section>
    </main>
  );
}
