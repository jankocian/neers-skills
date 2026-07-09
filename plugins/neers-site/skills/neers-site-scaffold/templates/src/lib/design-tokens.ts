/**
 * The token catalogue — the human layer, and nothing else.
 *
 * There are no values here, on purpose. `src/app/globals.css` declares each value
 * exactly once, and the style guide reads them live from the CSS variable (see
 * `useTokenValue`). What lives here is what CSS cannot: names, roles, usage notes,
 * grouping, order.
 *
 * `bun run check` fails if a `varName` below is not declared in globals.css, or if a
 * surface below has no matching `.theme-*` block there.
 */
export type ColorToken = { name: string; varName: string; note?: string };
export type ColorGroup = {
  title: string;
  description: string;
  tokens: ColorToken[];
};

export const PRIMITIVES: ColorGroup[] = [
  {
    title: "brand & neutrals",
    description:
      "One accent does the talking; ink on paper. Placeholders — replace with the brand.",
    tokens: [
      { name: "brand", varName: "--color-brand", note: "the one action" },
      {
        name: "brand strong",
        varName: "--color-brand-strong",
        note: "hover · on light",
      },
      {
        name: "brand soft",
        varName: "--color-brand-soft",
        note: "hover · on dark",
      },
      { name: "ink", varName: "--color-ink", note: "text / inverse ground" },
      {
        name: "ink raised",
        varName: "--color-ink-raised",
        note: "raised · on dark",
      },
      {
        name: "subtle",
        varName: "--color-subtle",
        note: "quieter light ground",
      },
      { name: "paper", varName: "--color-paper", note: "default page" },
    ],
  },
  {
    title: "neutral inks",
    description:
      "Warm greys for secondary and tertiary text — tinted toward the brand, never cold.",
    tokens: [
      { name: "muted", varName: "--color-ink-muted", note: "secondary text" },
      { name: "faint", varName: "--color-faint", note: "tertiary / disabled" },
    ],
  },
  {
    title: "accents · a pinch of spice",
    description:
      "Rare, for tags and mood. Never a rainbow — one accent at a time.",
    tokens: [
      { name: "blue", varName: "--color-accent-blue" },
      { name: "teal", varName: "--color-accent-teal" },
      { name: "amber", varName: "--color-accent-amber" },
      { name: "rose", varName: "--color-accent-rose" },
    ],
  },
];

export type SemanticToken = { token: string; utility: string; role: string };

/** The tokens you actually reach for. Surface-aware — they invert per scope. */
export const SEMANTIC_TOKENS: SemanticToken[] = [
  {
    token: "background",
    utility: "bg-background",
    role: "page / surface fill",
  },
  {
    token: "foreground",
    utility: "text-foreground",
    role: "primary text & icons",
  },
  {
    token: "muted-foreground",
    utility: "text-muted-foreground",
    role: "secondary text",
  },
  { token: "primary", utility: "bg-primary", role: "the one action — brand" },
  {
    token: "primary-foreground",
    utility: "text-primary-foreground",
    role: "text on primary",
  },
  {
    token: "secondary",
    utility: "bg-secondary",
    role: "raised / subtle panel",
  },
  { token: "muted", utility: "bg-muted", role: "quiet fill" },
  { token: "accent", utility: "bg-accent", role: "hover tint" },
  { token: "border", utility: "border-border", role: "hairline" },
  { token: "input", utility: "border-input", role: "field / strong hairline" },
  { token: "ring", utility: "ring-ring", role: "focus ring" },
  { token: "destructive", utility: "text-destructive", role: "errors only" },
];

/**
 * The surfaces. Adding one here plus a `.theme-*` block in globals.css is all it
 * takes — nothing to register, and `bun run check` fails if you do only one.
 */
export const SURFACES = [
  { variant: "base", label: "base", note: "the default light page" },
  {
    variant: "subtle",
    label: "subtle",
    note: "raised hero & alternating sections",
  },
  {
    variant: "inverse",
    label: "inverse",
    note: "the dark inverted band — footer, manifesto",
  },
  { variant: "brand", label: "brand", note: "full-bleed accent splash / CTA" },
] as const;

export type SurfaceVariant = (typeof SURFACES)[number]["variant"];

export type TypeSpec = {
  name: string;
  className: string;
  usage: string;
  sample: string;
};

export const TYPE_SCALE: TypeSpec[] = [
  {
    name: "d1",
    className: "heading-d1",
    usage: "hero lockups only",
    sample: "design with intent",
  },
  {
    name: "d2",
    className: "heading-d2",
    usage: "section openers",
    sample: "considered, not decorated",
  },
  {
    name: "h1",
    className: "heading-h1",
    usage: "page titles",
    sample: "build small, considered things",
  },
  {
    name: "h2",
    className: "heading-h2",
    usage: "section titles",
    sample: "structure in service of clarity",
  },
  {
    name: "h3",
    className: "heading-h3",
    usage: "card titles",
    sample: "components that compose",
  },
  {
    name: "lede",
    className: "text-xl",
    usage: "intro paragraphs",
    sample:
      "a system of tokens, surfaces, and components that stays coherent as the product grows.",
  },
  {
    name: "body",
    className: "text-base",
    usage: "body copy",
    sample:
      "body copy at a comfortable measure — set the line length with the ch-based tokens so paragraphs stay readable.",
  },
  {
    name: "small",
    className: "text-sm",
    usage: "meta & captions",
    sample: "© 2026 · all rights reserved",
  },
  {
    name: "caption",
    className: "text-xs",
    usage: "fine print",
    sample: "fine print and metadata",
  },
  {
    name: "tagline",
    className: "type-tagline",
    usage: "lowercase labels",
    sample: "label · category · 2026",
  },
];

/**
 * Tailwind's own spacing scale, not ours — the px are the framework's, so there is
 * no custom property to read them from.
 */
export type ScaleStep = { name: string; px: number; className: string };

export const SPACING: ScaleStep[] = [
  { name: "1", px: 4, className: "p-1" },
  { name: "2", px: 8, className: "p-2" },
  { name: "3", px: 12, className: "p-3" },
  { name: "4", px: 16, className: "p-4" },
  { name: "6", px: 24, className: "p-6" },
  { name: "8", px: 32, className: "p-8" },
  { name: "12", px: 48, className: "p-12" },
  { name: "16", px: 64, className: "p-16" },
  { name: "24", px: 96, className: "p-24" },
  { name: "32", px: 128, className: "p-32" },
];

/** `full` has no token — `rounded-full` is Tailwind's own. */
export type RadiusSpec = {
  name: string;
  className: string;
  varName?: string;
  note?: string;
};

export const RADII: RadiusSpec[] = [
  { name: "xs", varName: "--radius-xs", className: "rounded-xs" },
  { name: "sm", varName: "--radius-sm", className: "rounded-sm" },
  {
    name: "md",
    varName: "--radius-md",
    className: "rounded-md",
    note: "buttons",
  },
  { name: "lg", varName: "--radius-lg", className: "rounded-lg" },
  { name: "xl", varName: "--radius-xl", className: "rounded-xl" },
  { name: "2xl", varName: "--radius-2xl", className: "rounded-2xl" },
  { name: "full", className: "rounded-full", note: "chips & badges only" },
];

export type ShadowSpec = { name: string; className: string; usage: string };

export const SHADOWS: ShadowSpec[] = [
  { name: "sm", className: "shadow-sm", usage: "floating UI" },
  { name: "md", className: "shadow-md", usage: "menus & toasts" },
  { name: "lg", className: "shadow-lg", usage: "modals — sparingly" },
];

export type EaseSpec = { name: string; varName: string; usage: string };

export const EASES: EaseSpec[] = [
  { name: "ease-out", varName: "--ease-out", usage: "entrances & exits" },
  {
    name: "ease-in-out",
    varName: "--ease-in-out",
    usage: "on-screen movement",
  },
  {
    name: "ease-out-expo",
    varName: "--ease-out-expo",
    usage: "sectional reveals",
  },
];

/** Per-primitive defaults in `lib/motion.ts`, not CSS tokens. */
export type DurationSpec = { name: string; ms: number; usage: string };

export const DURATIONS: DurationSpec[] = [
  { name: "fast", ms: 120, usage: "micro-interactions" },
  { name: "base", ms: 220, usage: "default" },
  { name: "slow", ms: 420, usage: "sectional reveals" },
];

export const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "inverse",
  "outline",
  "ghost",
  "link",
] as const;

export const BUTTON_SIZES = ["sm", "md", "lg"] as const;

export type SectionId =
  | "foundations"
  | "color"
  | "surfaces"
  | "typography"
  | "spacing"
  | "radii"
  | "elevation"
  | "motion"
  | "buttons"
  | "badges"
  | "overlays"
  | "forms"
  | "icons";

export const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "foundations", label: "foundations" },
  { id: "color", label: "color" },
  { id: "surfaces", label: "surfaces" },
  { id: "typography", label: "typography" },
  { id: "spacing", label: "spacing" },
  { id: "radii", label: "radii & borders" },
  { id: "elevation", label: "elevation" },
  { id: "motion", label: "motion" },
  { id: "buttons", label: "buttons" },
  { id: "badges", label: "badges" },
  { id: "overlays", label: "overlays" },
  { id: "forms", label: "forms" },
  { id: "icons", label: "iconography" },
];
