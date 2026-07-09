import { Container } from "~/components/layout/container";
import { Section } from "~/components/layout/section";
import { Button } from "~/components/ui/button";
import { Heading, Text } from "~/components/ui/text";

export default function NotFound() {
  return (
    <Section>
      <Container size="narrow" className="text-center">
        <Text as="span" className="type-tagline text-muted-foreground">
          404
        </Text>
        <Heading level={1} className="heading-h1 mt-4">
          This page doesn&rsquo;t exist.
        </Heading>
        <Text className="mx-auto mt-4 max-w-measure text-muted-foreground">
          The link may be broken, or the page may have moved.
        </Text>
        <Button href="/" size="lg" className="mt-8">
          Back home
        </Button>
      </Container>
    </Section>
  );
}
