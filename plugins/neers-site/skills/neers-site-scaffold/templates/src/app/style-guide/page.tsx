import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Heart,
  Mail,
  Plus,
  Search,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "~/components/layout/container";
import { Code } from "~/components/style-guide/code";
import { CopyToken } from "~/components/style-guide/copy-token";
import { DialogDemo } from "~/components/style-guide/dialog-demo";
import { FormFields } from "~/components/style-guide/form-demo";
import { MotionDemo } from "~/components/style-guide/motion-demo";
import { SectionNav } from "~/components/style-guide/section-nav";
import { SgRow } from "~/components/style-guide/sg-row";
import { SgSection } from "~/components/style-guide/sg-section";
import { SurfacePreview } from "~/components/style-guide/surface-preview";
import { Swatch } from "~/components/style-guide/swatch";
import { TokenRow } from "~/components/style-guide/token-row";
import { TypeSpecimen } from "~/components/style-guide/type-specimen";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Heading, Text } from "~/components/ui/text";
import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  DURATIONS,
  EASES,
  PRIMITIVES,
  RADII,
  SEMANTIC_TOKENS,
  SHADOWS,
  SPACING,
  SURFACES,
  TYPE_SCALE,
} from "~/lib/design-tokens";
import { site } from "~/lib/site";
import { cn } from "~/lib/utils";

export const metadata: Metadata = {
  title: "style guide",
  description:
    "The design system — tokens, type, colour, surfaces, and the one button system.",
  robots: { index: false, follow: false },
};

/**
 * Three layers keep this off the live site:
 *   1. `notFound()` below — the route 404s in production.
 *   2. `robots: { index: false }` above.
 *   3. `privateRoutes` in lib/site.ts, which app/robots.ts disallows.
 *
 * The route still exists in the build output. That's fine — it's unreachable,
 * and nobody downloads a chunk for a page that 404s.
 */
function assertDevOnly() {
  if (process.env.NODE_ENV === "production") notFound();
}

const RULES = [
  "tokens, never arbitrary values",
  "one typeface, a clear weight scale",
  "one accent, used with intent",
  "surfaces invert; tokens never repeat",
  "squared corners · hairline borders",
  "calm motion, no springs",
];

// Accent-hue tinted chips (static class strings so Tailwind sees them).
const HUE_CHIPS = [
  { label: "blue", className: "border-accent-blue/35 bg-accent-blue/15" },
  { label: "teal", className: "border-accent-teal/35 bg-accent-teal/15" },
  { label: "amber", className: "border-accent-amber/40 bg-accent-amber/20" },
  { label: "rose", className: "border-accent-rose/35 bg-accent-rose/15" },
];

const ICONS = [
  ArrowUpRight,
  ArrowRight,
  Check,
  Plus,
  Search,
  Mail,
  Star,
  Heart,
];

export default function StyleGuidePage() {
  assertDevOnly();

  return (
    <div className="theme-base min-h-dvh">
      {/* ── sticky chrome ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-border border-b bg-background/80 backdrop-blur-md">
        <Container
          size="wide"
          className="flex h-16 items-center justify-between"
        >
          <Link href="/" className="flex items-center gap-3" aria-label="home">
            <Text className="font-medium text-sm" as="span">
              {site.name}
            </Text>
            <span className="h-4 w-px bg-border" aria-hidden />
            <Text className="text-muted-foreground text-sm" as="span">
              style guide
            </Text>
          </Link>
          <Text
            as="span"
            className="hidden text-muted-foreground/65 text-sm sm:block"
          >
            internal reference · v1
          </Text>
        </Container>
      </header>

      <Container size="wide">
        {/* ── hero ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 py-16 sm:py-24">
          <div className="flex items-center gap-2.5">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            <Text
              className="type-tagline text-muted-foreground lowercase"
              as="span"
            >
              design system
            </Text>
          </div>
          <Heading level={1} className="heading-h1">
            style guide
          </Heading>
          <Text className="max-w-measure text-muted-foreground text-xl">
            the building blocks of the product — tokens, type, colour, surfaces,
            and the one button system. copy these; don&apos;t reinvent them.
          </Text>
        </div>

        {/* ── body: sticky nav + sections ─────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:gap-16">
          <aside className="lg:w-48 lg:shrink-0">
            <div className="hidden lg:sticky lg:top-24 lg:block">
              <SectionNav />
            </div>
          </aside>

          <main className="min-w-0 flex-1 pb-24">
            {/* FOUNDATIONS */}
            <SgSection
              id="foundations"
              tagline="foundations"
              title="one accent. one typeface. a flat grid."
              intro="the system is small on purpose — fewer tokens used confidently beat many used cautiously. everything is built from the semantic tokens below."
              className="border-t-0 pt-0"
            >
              <div className="flex flex-col gap-10">
                <div className="flex flex-col items-start gap-6 rounded-xl border border-border p-8 sm:p-12">
                  <Text className="max-w-measure text-muted-foreground text-sm">
                    the wordmark is two-tone and surface-aware: the name takes
                    the current foreground, the accent dot stays the brand
                    colour. replace it with the real logo.
                  </Text>
                </div>
                <div className="flex flex-wrap gap-2">
                  {RULES.map((r) => (
                    <Badge key={r} variant="outline">
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>
            </SgSection>

            {/* COLOR */}
            <SgSection
              id="color"
              tagline="color"
              title="primitives, then meaning."
              intro="raw values live as --color-* primitives. you rarely touch them — UI is built from the semantic tokens below, which are surface-aware."
            >
              <div className="flex flex-col gap-12">
                {PRIMITIVES.map((group) => (
                  <div key={group.title} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <Text className="font-medium text-sm lowercase">
                        {group.title}
                      </Text>
                      <Text className="max-w-measure text-muted-foreground text-xs">
                        {group.description}
                      </Text>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {group.tokens.map((t) => (
                        <Swatch key={t.varName} token={t} />
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-1 pt-2">
                  <Text className="font-medium text-sm lowercase">
                    semantic tokens · the ones you use
                  </Text>
                  <Text className="max-w-measure text-muted-foreground text-xs">
                    shadcn&apos;s vocabulary, remapped per surface. write these
                    once and they invert. click to copy.
                  </Text>
                </div>
                <div className="flex flex-col">
                  {SEMANTIC_TOKENS.map((t) => (
                    <div
                      key={t.token}
                      className="flex items-center justify-between gap-4 border-border border-t py-3 first:border-t-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="size-5 shrink-0 rounded-sm border border-border"
                          style={{ backgroundColor: `var(--${t.token})` }}
                        />
                        <CopyToken
                          value={t.utility}
                          label={t.utility}
                          className="text-foreground text-sm"
                        />
                      </div>
                      <Text
                        as="span"
                        className="shrink-0 text-right text-muted-foreground text-sm"
                      >
                        {t.role}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </SgSection>

            {/* SURFACES */}
            <SgSection
              id="surfaces"
              tagline="surfaces"
              title="write it once. let the surface decide."
              intro="a .theme-* class remaps the semantic tokens and paints itself. the toggle below proves it — one block of markup, every surface, nothing re-declared."
            >
              <div className="flex flex-col gap-10">
                <SurfacePreview />
                <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {SURFACES.map((s) => (
                    <div
                      key={s.variant}
                      className="flex items-baseline justify-between gap-4 border-border border-t py-3"
                    >
                      <CopyToken
                        value={`theme-${s.variant}`}
                        className="text-foreground text-sm"
                      />
                      <Text
                        as="span"
                        className="text-right text-muted-foreground text-sm"
                      >
                        {s.note}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </SgSection>

            {/* TYPOGRAPHY */}
            <SgSection
              id="typography"
              tagline="typography"
              title="type does the talking."
              intro="one family, fluid display, fixed copy — each token carries size, line-height, tracking and weight. resize the window to watch the display sizes flex."
            >
              <div className="flex flex-col">
                {TYPE_SCALE.map((t) => (
                  <SgRow key={t.name} label={t.name} note={t.usage}>
                    <TypeSpecimen className={cn(t.className, "max-w-headline")}>
                      {t.sample}
                    </TypeSpecimen>
                    <CopyToken
                      value={t.className}
                      label={t.className}
                      className="mt-3 text-muted-foreground text-xs"
                    />
                  </SgRow>
                ))}
                <SgRow
                  label="weights"
                  note="lean on a few weights with clear roles — e.g. regular for body, semibold for headings. load only what you use."
                >
                  <div className="flex flex-wrap items-baseline gap-x-10 gap-y-3">
                    {[
                      { w: "font-light", n: "300 · light" },
                      { w: "font-normal", n: "400 · regular" },
                      { w: "font-semibold", n: "600 · semibold" },
                    ].map((x) => (
                      <div key={x.w} className="flex flex-col gap-1">
                        <span className={cn("heading-h2", x.w)}>Type</span>
                        <Text
                          className="text-muted-foreground text-xs"
                          as="span"
                        >
                          {x.n}
                        </Text>
                      </div>
                    ))}
                  </div>
                </SgRow>
              </div>
            </SgSection>

            {/* SPACING */}
            <SgSection
              id="spacing"
              tagline="spacing"
              title="an 8-pt grid that breathes."
              intro="spacing rides Tailwind's 4px scale. tight groupings for related elements, generous separations between sections — rhythm, not uniform padding."
            >
              <div className="flex flex-col gap-3">
                {SPACING.map((s) => (
                  <div key={s.name} className="flex items-center gap-4">
                    <CopyToken
                      value={s.className}
                      label={s.className}
                      className="w-16 shrink-0 text-muted-foreground text-xs"
                    />
                    <span className="w-12 shrink-0 text-muted-foreground text-xs tabular-nums">
                      {s.px}px
                    </span>
                    <div
                      className="h-3 rounded-xs bg-primary"
                      style={{ width: s.px }}
                    />
                  </div>
                ))}
              </div>
            </SgSection>

            {/* RADII & BORDERS */}
            <SgSection
              id="radii"
              tagline="radii & borders"
              title="mostly squared. pills for chips."
              intro="corners stay near-square; the pill radius is reserved for chips, badges and the dots. borders are a single 1px hairline at low opacity — never a heavy rule."
            >
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-7">
                {RADII.map((r) => (
                  <div
                    key={r.name}
                    className="flex flex-col items-center gap-3 text-center"
                  >
                    <div
                      className={cn(
                        "size-16 border border-border bg-secondary",
                        r.className,
                      )}
                    />
                    <div className="flex flex-col items-center gap-0.5">
                      <CopyToken
                        value={r.className}
                        label={r.name}
                        className="text-muted-foreground text-xs"
                      />
                      {r.note ? (
                        <Text
                          className="text-muted-foreground/65 text-xs"
                          as="span"
                        >
                          {r.note}
                        </Text>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </SgSection>

            {/* ELEVATION */}
            <SgSection
              id="elevation"
              tagline="elevation"
              title="shadow sparingly."
              intro="long, soft, low-opacity shadows — never tight black drops, never on cards or hero panels. depth is a tool for floating UI, not decoration."
            >
              <div className="grid gap-6 sm:grid-cols-3">
                {SHADOWS.map((s) => (
                  <div
                    key={s.name}
                    className={cn(
                      "flex flex-col gap-1.5 rounded-lg border border-border bg-background p-6",
                      s.className,
                    )}
                  >
                    <CopyToken
                      value={s.className}
                      label={s.className}
                      className="font-medium text-foreground text-sm"
                    />
                    <Text className="text-muted-foreground text-xs" as="span">
                      {s.usage}
                    </Text>
                  </div>
                ))}
              </div>
            </SgSection>

            {/* MOTION */}
            <SgSection
              id="motion"
              tagline="motion"
              title="calm and deliberate."
              intro="ease-out for entrances, ease for hover, sub-300ms, transform and opacity only. no springs, no bounce. every animation honours prefers-reduced-motion."
            >
              <div className="flex flex-col gap-12">
                <MotionDemo />
                <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    <Text className="font-medium text-sm lowercase">
                      easing
                    </Text>
                    {EASES.map((e) => (
                      <TokenRow
                        key={e.name}
                        varName={e.varName}
                        label={e.name}
                        usage={e.usage}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col gap-3">
                    <Text className="font-medium text-sm lowercase">
                      duration
                    </Text>
                    {DURATIONS.map((d) => (
                      <div
                        key={d.name}
                        className="flex items-baseline justify-between gap-4 border-border border-t py-2.5 first:border-t-0"
                      >
                        <Text as="span" className="text-sm tabular-nums">
                          {d.ms}ms · {d.name}
                        </Text>
                        <Text
                          className="text-muted-foreground text-xs"
                          as="span"
                        >
                          {d.usage}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
                <Text className="max-w-measure text-muted-foreground text-sm">
                  hover, press and focus live on every button below — the press
                  nudges 1px, focus shows a 2px brand ring.
                </Text>
              </div>
            </SgSection>

            {/* BUTTONS */}
            <SgSection
              id="buttons"
              tagline="buttons"
              title="one button system."
              intro="shadcn's variant names, brand styling, surface-aware. the same variant renders the right thing on every surface — no separate light/dark buttons."
            >
              <div className="flex flex-col">
                <SgRow
                  label="variants"
                  note="default for the one main action, secondary & inverse for high-contrast CTAs, outline & ghost for tertiary, link inline."
                >
                  <div className="flex flex-wrap items-center gap-3">
                    {BUTTON_VARIANTS.map((v) => (
                      <Button key={v} variant={v}>
                        {v}
                      </Button>
                    ))}
                  </div>
                </SgRow>
                <SgRow
                  label="on dark"
                  note="drop the very same buttons onto an inverse surface — they invert automatically, because --primary, --foreground and --border are remapped."
                >
                  <div className="theme-inverse flex flex-wrap items-center gap-3 rounded-lg p-6">
                    {BUTTON_VARIANTS.map((v) => (
                      <Button key={v} variant={v}>
                        {v}
                      </Button>
                    ))}
                  </div>
                </SgRow>
                <SgRow
                  label="sizes"
                  note="sm in the nav and dense UI · md by default · lg for hero and CTA moments."
                >
                  <div className="flex flex-wrap items-center gap-3">
                    {BUTTON_SIZES.map((s) => (
                      <Button key={s} size={s}>
                        {s === "sm" ? "small" : s === "lg" ? "large" : "medium"}
                      </Button>
                    ))}
                  </div>
                </SgRow>
                <SgRow
                  label="icons"
                  note="icons are children — any Lucide icon. lead with one, trail with one, or size='icon' for icon-only (always give it an aria-label)."
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="lg">
                      <Mail /> email us
                    </Button>
                    <Button variant="ghost" size="lg">
                      learn more
                      <ArrowUpRight />
                    </Button>
                    <Button size="icon" variant="outline" aria-label="search">
                      <Search />
                    </Button>
                  </div>
                </SgRow>
                <SgRow
                  label="states"
                  note="hover, focus and press are live — try them. disabled drops to 50%."
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <Button>default</Button>
                    <Button disabled>disabled</Button>
                    <Button variant="outline">focusable</Button>
                  </div>
                </SgRow>
              </div>
            </SgSection>

            {/* BADGES */}
            <SgSection
              id="badges"
              tagline="badges"
              title="the small stuff."
              intro="the quiet details. a badge labels; it never acts. reach for a button the moment it needs a click."
            >
              <div className="flex flex-col">
                <SgRow label="badges">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>default</Badge>
                    <Badge variant="secondary">secondary</Badge>
                    <Badge variant="outline">outline</Badge>
                    <Badge variant="destructive">destructive</Badge>
                    {HUE_CHIPS.map((h) => (
                      <Badge
                        key={h.label}
                        variant="outline"
                        className={h.className}
                      >
                        {h.label}
                      </Badge>
                    ))}
                  </div>
                </SgRow>
              </div>
            </SgSection>
            {/* OVERLAYS */}
            <SgSection
              id="overlays"
              tagline="overlays"
              title="one dialog. one lightbox."
              intro="the dialog is shadcn's, unchanged — base ui gives it a focus trap, esc, scroll lock and aria for free. the lightbox is for viewing media, nothing else; reach for the dialog whenever there is content or an action."
            >
              <div className="flex flex-wrap items-center gap-6">
                <DialogDemo />
                <Text className="max-w-measure text-muted-foreground text-sm">
                  a lightbox needs real photographs to be worth looking at, so
                  it has no specimen here. see{" "}
                  <Code>components/ui/lightbox.tsx</Code>.
                </Text>
              </div>
            </SgSection>

            {/* FORMS */}
            <SgSection
              id="forms"
              tagline="forms"
              title="fields you can actually see."
              intro="every field is a clearly bordered box — obviously an input, accessible, warming to the brand on focus. like everything else, it inverts on a dark surface for free."
            >
              <div className="grid gap-10 lg:grid-cols-2">
                <div className="rounded-xl border border-border p-8">
                  <Text className="type-tagline mb-6 block text-muted-foreground lowercase">
                    on base
                  </Text>
                  <FormFields />
                </div>
                <div className="theme-inverse rounded-xl border border-border p-8">
                  <Text className="type-tagline mb-6 block text-muted-foreground lowercase">
                    on inverse
                  </Text>
                  <FormFields />
                </div>
              </div>
            </SgSection>

            {/* ICONOGRAPHY */}
            <SgSection
              id="icons"
              tagline="iconography"
              title="geometric, line-only."
              intro="Lucide at 1.5px stroke on a 24px grid for general icons; custom SVG for the brand glyphs. outline by default, no emoji anywhere."
            >
              <div className="flex flex-col gap-12">
                <div className="flex flex-col gap-4">
                  <Text className="font-medium text-sm lowercase">
                    lucide · 1.5px stroke
                  </Text>
                  <div className="flex flex-wrap gap-6">
                    {ICONS.map((Icon) => (
                      <Icon
                        key={Icon.displayName ?? Icon.name}
                        size={24}
                        strokeWidth={1.5}
                        className="text-foreground"
                        aria-hidden
                      />
                    ))}
                  </div>
                </div>
              </div>
            </SgSection>
          </main>
        </div>
      </Container>

      {/* ── footer ──────────────────────────────────────────────── */}
      <footer className="theme-inverse mt-12">
        <Container
          size="wide"
          className="flex flex-col gap-6 py-16 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex flex-col gap-4">
            <Text className="max-w-measure-tight text-muted-foreground text-sm">
              the foundation lives in globals.css. copy the tokens, not the
              pixels.
            </Text>
          </div>
          <Text className="text-muted-foreground/65 text-xs" as="span">
            © 2026 · design system foundation
          </Text>
        </Container>
      </footer>
    </div>
  );
}
