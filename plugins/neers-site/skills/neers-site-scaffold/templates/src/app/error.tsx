"use client";

import { useEffect } from "react";

import { Container } from "~/components/layout/container";
import { Section } from "~/components/layout/section";
import { Button } from "~/components/ui/button";
import { Heading, Text } from "~/components/ui/text";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section>
      <Container size="narrow" className="text-center">
        <Heading level={1} className="heading-h1">
          Something went wrong.
        </Heading>
        <Text className="mx-auto mt-4 max-w-measure text-muted-foreground">
          An unexpected error occurred. Try again, or head back home.
        </Text>
        <Button className="mt-8" onClick={reset}>
          Try again
        </Button>
      </Container>
    </Section>
  );
}
